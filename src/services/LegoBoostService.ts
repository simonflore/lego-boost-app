/**
 * LEGO BOOST Move Hub over BLE (LEGO Wireless Protocol 3.0)
 */

import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Characteristic, Device, State, Subscription } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import {
  AiState,
  AttachedDevice,
  BoostConfiguration,
  DEFAULT_CONFIGURATION,
  DeviceInfo,
  ExternalPort,
  IoType,
  LedColor,
  LEGO_BOOST_CHARACTERISTIC_UUID,
  LEGO_BOOST_SERVICE_UUID,
  MessageType,
  PortId,
  createDeviceInfo,
} from '../types/lego-boost';

type ConnectionCallback = (connected: boolean) => void;
type DeviceInfoCallback = (info: DeviceInfo) => void;
type AiStateCallback = (state: AiState) => void;

const SCAN_TIMEOUT_MS = 15000;
const NOTIFY_INTERVAL_MS = 100;
const MOVE_HUB_SYSTEM_TYPE = 0x40;
const LEGO_COMPANY_ID = 0x0397;

const AI_SPEED = 50;
const AI_OBSTACLE_CM = 12;
const AI_BACK_MS = 800;
const AI_TURN_MS = 700;
const AI_TICK_MS = 100;

const COLOR_NAMES = [
  'black', 'pink', 'purple', 'blue', 'light blue',
  'cyan', 'green', 'yellow', 'orange', 'red', 'white',
];

const clampPower = (v: number) => Math.max(-100, Math.min(100, Math.round(v)));

class LegoBoostService {
  private manager: BleManager;
  private device: Device | null = null;
  private characteristic: Characteristic | null = null;
  private subscriptions: Subscription[] = [];
  private configuration: BoostConfiguration = { ...DEFAULT_CONFIGURATION };
  private _deviceInfo: DeviceInfo = createDeviceInfo();
  private connecting = false;

  // Virtual port for synchronised A+B. Firmware 2.x reports it on connect
  // (usually 0x10); 0x39 was the pre-LWP3 address and is ignored by current hubs.
  private abPort: number = PortId.AB;
  private sensorPort: number = PortId.C;

  private connectionCallbacks: ConnectionCallback[] = [];
  private deviceInfoCallbacks: DeviceInfoCallback[] = [];
  private aiCallbacks: AiStateCallback[] = [];
  private notifyTimer: ReturnType<typeof setTimeout> | null = null;

  private _aiState: AiState = 'Stopped';
  private aiTimer: ReturnType<typeof setInterval> | null = null;
  private aiUntil = 0;

  constructor() {
    this.manager = new BleManager();
  }

  get deviceInfo(): DeviceInfo {
    return this._deviceInfo;
  }

  get isConnected(): boolean {
    return this._deviceInfo.connected;
  }

  get aiState(): AiState {
    return this._aiState;
  }

  get isAiRunning(): boolean {
    return this._aiState !== 'Stopped';
  }

  // ---------------------------------------------------------------- events

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  onDeviceInfoChange(callback: DeviceInfoCallback): () => void {
    this.deviceInfoCallbacks.push(callback);
    return () => {
      this.deviceInfoCallbacks = this.deviceInfoCallbacks.filter(cb => cb !== callback);
    };
  }

  onAiStateChange(callback: AiStateCallback): () => void {
    this.aiCallbacks.push(callback);
    return () => {
      this.aiCallbacks = this.aiCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(cb => cb(connected));
  }

  /**
   * Sensors report many times a second; batch them so the UI re-renders at
   * most every NOTIFY_INTERVAL_MS. Connection-level changes go out at once.
   */
  private notifyDeviceInfoChange(immediate = false): void {
    if (immediate) {
      if (this.notifyTimer) clearTimeout(this.notifyTimer);
      this.flushDeviceInfo();
      return;
    }
    if (this.notifyTimer) return;
    this.notifyTimer = setTimeout(() => this.flushDeviceInfo(), NOTIFY_INTERVAL_MS);
  }

  private flushDeviceInfo(): void {
    this.notifyTimer = null;
    const info = this._deviceInfo;
    const snapshot: DeviceInfo = { ...info, tilt: { ...info.tilt }, attached: { ...info.attached } };
    this.deviceInfoCallbacks.forEach(cb => cb(snapshot));
  }

  private setAiState(state: AiState): void {
    if (this._aiState === state) return;
    this._aiState = state;
    this.aiCallbacks.forEach(cb => cb(state));
  }

  private setError(message: string): void {
    this._deviceInfo.error = message;
    this.notifyDeviceInfoChange(true);
  }

  // ------------------------------------------------------------ connecting

  /** Returns an error message, or null when Bluetooth is ready. */
  private async ensureBluetooth(): Promise<string | null> {
    if (Platform.OS === 'android') {
      const perms =
        Number(Platform.Version) >= 31
          ? [
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]
          : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
      const result = await PermissionsAndroid.requestMultiple(perms);
      if (perms.some(p => result[p] !== PermissionsAndroid.RESULTS.GRANTED)) {
        return 'Bluetooth permission was denied.';
      }
    }

    const state = await this.manager.state();
    if (state === State.PoweredOn) return null;
    if (state === State.Unauthorized) {
      return 'Bluetooth access is off for this app. Turn it on in Settings.';
    }
    if (state === State.Unsupported) return 'This device does not support Bluetooth LE.';

    // Unknown / Resetting / PoweredOff: give the radio a moment to come up.
    const ready = await new Promise<boolean>(resolve => {
      const timer = setTimeout(() => {
        sub.remove();
        resolve(false);
      }, 5000);
      const sub = this.manager.onStateChange(newState => {
        if (newState === State.PoweredOn) {
          clearTimeout(timer);
          sub.remove();
          resolve(true);
        }
      }, true);
    });
    if (ready) return null;
    return state === State.PoweredOff ? 'Turn on Bluetooth to connect.' : 'Bluetooth is not ready.';
  }

  async connect(config?: Partial<BoostConfiguration>): Promise<boolean> {
    if (config) this.updateConfiguration(config);
    if (this.isConnected) return true;
    if (this.connecting) return false;
    this.connecting = true;

    try {
      const bluetoothError = await this.ensureBluetooth();
      if (bluetoothError) {
        this.setError(bluetoothError);
        return false;
      }

      // After an app restart iOS often keeps the hub's BLE link open, so the hub
      // stops advertising and a scan never finds it. Reuse that link first.
      const alreadyConnected = await this.manager.connectedDevices([LEGO_BOOST_SERVICE_UUID]);
      for (const device of alreadyConnected) {
        if (await this.attach(device)) return true;
      }

      return await this.scanAndAttach();
    } catch (error: any) {
      console.error('Connect error:', error);
      this.setError(error?.message ?? 'Could not connect.');
      return false;
    } finally {
      this.connecting = false;
    }
  }

  private scanAndAttach(): Promise<boolean> {
    return new Promise(resolve => {
      let settled = false;

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        this.manager.stopDeviceScan();
        this.setError('No LEGO BOOST hub found. Turn it on and press its green button.');
        resolve(false);
      }, SCAN_TIMEOUT_MS);

      this.manager.startDeviceScan([LEGO_BOOST_SERVICE_UUID], { allowDuplicates: false }, (error, device) => {
        if (settled) return;
        if (error) {
          console.error('Scan error:', error);
          settled = true;
          clearTimeout(timeout);
          this.manager.stopDeviceScan();
          this.setError(error.message);
          resolve(false);
          return;
        }
        if (!device || !LegoBoostService.isMoveHub(device)) return;
        settled = true; // claim it before the async attach
        clearTimeout(timeout);
        this.manager.stopDeviceScan();
        this.attach(device).then(resolve);
      });
    });
  }

  /** Other LEGO hubs share the service UUID; the advertisement says which hub it is. */
  private static isMoveHub(device: Device): boolean {
    if (!device.manufacturerData) return true;
    const data = Buffer.from(device.manufacturerData, 'base64');
    if (data.length < 4 || data.readUInt16LE(0) !== LEGO_COMPANY_ID) return true;
    return data[3] === MOVE_HUB_SYSTEM_TYPE;
  }

  /** Connect (or re-attach) to a hub and open the LWP3 channel. */
  private async attach(device: Device): Promise<boolean> {
    this.clearSubscriptions();
    try {
      const connected = (await device.isConnected()) ? device : await device.connect();
      await connected.discoverAllServicesAndCharacteristics();
      const characteristics = await connected.characteristicsForService(LEGO_BOOST_SERVICE_UUID);
      const characteristic = characteristics.find(
        c => c.uuid.toLowerCase() === LEGO_BOOST_CHARACTERISTIC_UUID.toLowerCase()
      );
      if (!characteristic) throw new Error('This hub does not speak the LEGO protocol.');

      this.device = connected;
      this.characteristic = characteristic;
      this.abPort = PortId.AB;
      this.sensorPort = PortId.C;
      this._deviceInfo = createDeviceInfo();

      this.subscriptions.push(
        // Errors here also fire on every disconnect; onDisconnected handles that.
        characteristic.monitor((error, char) => {
          if (!error && char?.value) this.handleIncomingData(Buffer.from(char.value, 'base64'));
        }),
        connected.onDisconnected(() => this.handleDisconnected(true)),
      );

      this._deviceInfo.connected = true;
      this.notifyConnectionChange(true);
      this.notifyDeviceInfoChange(true);

      await this.subscribeSensors();
      return true;
    } catch (error: any) {
      console.error('Connection error:', error);
      this.clearSubscriptions();
      this.device = null;
      this.characteristic = null;
      this.setError(error?.message ?? 'Could not connect to the hub.');
      return false;
    }
  }

  private clearSubscriptions(): void {
    this.subscriptions.forEach(s => s.remove());
    this.subscriptions = [];
  }

  private handleDisconnected(unexpected: boolean): void {
    this.clearSubscriptions();
    this.stopAiTimer();
    this.device = null;
    this.characteristic = null;
    this._deviceInfo = createDeviceInfo();
    if (unexpected) this._deviceInfo.error = 'The hub disconnected.';
    this.notifyConnectionChange(false);
    this.notifyDeviceInfoChange(true);
  }

  async disconnect(): Promise<void> {
    const device = this.device;
    this.handleDisconnected(false);
    if (device) {
      try {
        await device.cancelConnection();
      } catch (error) {
        console.warn('Disconnect error:', error);
      }
    }
  }

  // ------------------------------------------------------------- incoming

  private async subscribeSensors(): Promise<void> {
    // Battery: hub property 0x06. Enable pushed updates (0x02), then ask once (0x05).
    await this.write([0x05, 0x00, MessageType.HUB_PROPERTIES, 0x06, 0x02]);
    await this.write([0x05, 0x00, MessageType.HUB_PROPERTIES, 0x06, 0x05]);
    // Tilt (mode 0: roll/pitch). The sensor port is re-subscribed if the hub
    // announces it elsewhere; port C is the default for every official build.
    await this.subscribePort(PortId.TILT, 0x00);
    await this.subscribePort(this.sensorPort, 0x08);
  }

  /** Port Input Format Setup: notify on every change of `mode`. */
  private subscribePort(port: number, mode: number): Promise<void> {
    return this.write([0x0a, 0x00, MessageType.PORT_INPUT_FORMAT_SETUP, port, mode, 0x01, 0x00, 0x00, 0x00, 0x01]);
  }

  private handleIncomingData(data: Buffer): void {
    if (data.length < 3) return;
    switch (data[2]) {
      case MessageType.PORT_VALUE:
        this.handlePortValue(data);
        break;
      case MessageType.HUB_ATTACHED_IO:
        this.handleAttachedIO(data);
        break;
      case MessageType.HUB_PROPERTIES:
        // [len, hub, 0x01, property, 0x06 = update, value]
        if (data[3] === 0x06 && data[4] === 0x06 && data.length >= 6) {
          this._deviceInfo.battery = data[5];
          this.notifyDeviceInfoChange();
        }
        break;
      case MessageType.GENERIC_ERROR:
        console.warn('Hub error for command', data[3], 'code', data[4]);
        break;
    }
  }

  private handlePortValue(data: Buffer): void {
    const port = data[3];

    if (port === this.sensorPort && data.length >= 6) {
      // Colour & distance sensor, mode 8: [colour, distance (inches), light, partial]
      const color = data[4];
      let inches = data[5];
      const partial = data.length >= 8 ? data[7] : 0;
      if (partial > 0) inches += 1 / partial;
      this._deviceInfo.color = color === 0xff ? 'none' : COLOR_NAMES[color] ?? 'unknown';
      this._deviceInfo.distance = Math.max(0, Math.round((inches * 25.4 - 20) / 10));
      this.notifyDeviceInfoChange();
    } else if (port === PortId.TILT && data.length >= 6) {
      this._deviceInfo.tilt = { roll: data.readInt8(4), pitch: data.readInt8(5) };
      this.notifyDeviceInfoChange();
    }
  }

  private handleAttachedIO(data: Buffer): void {
    if (data.length < 5) return;
    const port = data[3];
    const event = data[4]; // 0 = detached, 1 = attached, 2 = attached virtual

    // Attached virtual: [len, hub, 0x04, port, 0x02, typeLo, typeHi, portA, portB]
    if (event === 0x02 && data.length >= 9) {
      const members = [data[7], data[8]].sort().join(',');
      if (members === `${PortId.A},${PortId.B}`) this.abPort = port;
      return;
    }

    const key = (['A', 'B', 'C', 'D'] as ExternalPort[])[port];
    if (!key) return;

    let kind: AttachedDevice = null;
    if (event === 0x01 && data.length >= 7) {
      const type = data.readUInt16LE(5);
      if (type === IoType.COLOR_DISTANCE_SENSOR) {
        kind = 'sensor';
        if (this.sensorPort !== port) {
          this.sensorPort = port;
          this.subscribePort(port, 0x08);
        }
      } else if (type === IoType.EXTERNAL_MOTOR || type === IoType.INTERNAL_MOTOR) {
        kind = 'motor';
      }
    }
    this._deviceInfo.attached[key] = kind;
    this.notifyDeviceInfoChange();
  }

  // ------------------------------------------------------------- outgoing

  async write(data: number[]): Promise<void> {
    const characteristic = this.characteristic;
    if (!characteristic) return;
    const payload = Buffer.from(data.map(v => v & 0xff)).toString('base64');
    try {
      // Without-response writes don't queue up behind acknowledgements, which
      // keeps a 20 Hz gamepad stream responsive.
      if (characteristic.isWritableWithoutResponse) {
        await characteristic.writeWithoutResponse(payload);
      } else {
        await characteristic.writeWithResponse(payload);
      }
    } catch (error) {
      console.warn('Write error:', error);
    }
  }

  async led(color: LedColor | number): Promise<void> {
    await this.write([0x08, 0x00, MessageType.PORT_OUTPUT, PortId.LED, 0x11, 0x51, 0x00, color]);
  }

  private getPortId(port: string): number {
    switch (port.toUpperCase()) {
      case 'A': return PortId.A;
      case 'B': return PortId.B;
      case 'C': return PortId.C;
      case 'D': return PortId.D;
      case 'AB': return this.abPort;
      default: throw new Error(`Unknown port ${port}`);
    }
  }

  /** Map left/right drive power onto [A, B] using the model's layout. */
  private toAB(left: number, right: number): [number, number] {
    const sign = this.configuration.invertDrive ? -1 : 1;
    const l = clampPower(left * sign);
    const r = clampPower(right * sign);
    return this.configuration.leftMotor === 'A' ? [l, r] : [r, l];
  }

  /** Single motor, for a fixed time, then brake. */
  async motorTime(port: string, seconds: number, power: number = 100): Promise<void> {
    const time = Math.max(0, Math.min(0xffff, Math.round(seconds * 1000)));
    // 0x09 = StartSpeedForTime(Time, Speed, MaxPower, EndState=brake, UseProfile)
    await this.write([
      0x0c, 0x00, MessageType.PORT_OUTPUT, this.getPortId(port), 0x11, 0x09,
      time & 0xff, time >> 8, clampPower(power), 0x64, 0x7f, 0x03,
    ]);
  }

  /** Single motor, continuous until the next command; 0 stops it. */
  async motorSpeed(port: string, power: number): Promise<void> {
    // 0x07 = StartSpeed(Speed, MaxPower, UseProfile)
    await this.write([0x09, 0x00, MessageType.PORT_OUTPUT, this.getPortId(port), 0x11, 0x07, clampPower(power), 0x64, 0x00]);
  }

  /** Both drive motors, continuous until the next command. */
  async driveWithPower(left: number, right: number): Promise<void> {
    const [a, b] = this.toAB(left, right);
    // 0x08 = StartSpeed(Speed1, Speed2, MaxPower, UseProfile) on the virtual AB port.
    await this.write([0x0a, 0x00, MessageType.PORT_OUTPUT, this.abPort, 0x11, 0x08, a, b, 0x64, 0x00]);
  }

  /** Both drive motors, for a fixed time, then brake. */
  private async driveForTime(seconds: number, left: number, right: number): Promise<void> {
    const [a, b] = this.toAB(left, right);
    const time = Math.max(0, Math.min(0xffff, Math.round(seconds * 1000)));
    // 0x0a = StartSpeedForTime for two motors
    await this.write([
      0x0d, 0x00, MessageType.PORT_OUTPUT, this.abPort, 0x11, 0x0a,
      time & 0xff, time >> 8, a, b, 0x64, 0x7f, 0x03,
    ]);
  }

  /** Stop the drive motors. */
  async stop(): Promise<void> {
    await this.driveWithPower(0, 0);
  }

  /** Stop the drive motors and any motor on C or D. */
  async stopAll(): Promise<void> {
    await this.stop();
    for (const port of ['C', 'D'] as const) {
      if (this._deviceInfo.attached[port] !== 'sensor') await this.motorSpeed(port, 0);
    }
  }

  /** Short burst forward (1) or backward (-1). */
  async drive(direction: number = 1): Promise<void> {
    const power = direction >= 0 ? 100 : -100;
    await this.driveForTime(1 * this.configuration.driveFinetune, power, power);
  }

  /** Short spin right (1) or left (-1). */
  async turn(direction: number): Promise<void> {
    const power = direction >= 0 ? 70 : -70;
    await this.driveForTime(0.5 * this.configuration.turnFinetune, power, -power);
  }

  updateConfiguration(config: Partial<BoostConfiguration>): void {
    this.configuration = { ...this.configuration, ...config };
  }

  // ---------------------------------------------------------------- AI mode

  /** Drive until something is within AI_OBSTACLE_CM, back off, turn, repeat. */
  startAi(): void {
    if (this.aiTimer || !this.isConnected) return;
    this.setAiState('Drive');
    this.driveWithPower(AI_SPEED, AI_SPEED);

    this.aiTimer = setInterval(() => {
      if (!this.isConnected) {
        this.stopAi();
        return;
      }
      const now = Date.now();
      const distance = this._deviceInfo.distance;

      switch (this._aiState) {
        case 'Drive':
          if (distance != null && distance < AI_OBSTACLE_CM) {
            this.setAiState('Back');
            this.aiUntil = now + AI_BACK_MS;
            this.driveWithPower(-AI_SPEED, -AI_SPEED);
          }
          break;
        case 'Back':
          if (now >= this.aiUntil) {
            const dir = Math.random() > 0.5 ? 1 : -1;
            this.setAiState('Turn');
            this.aiUntil = now + AI_TURN_MS * this.configuration.turnFinetune;
            this.driveWithPower(dir * AI_SPEED, -dir * AI_SPEED);
          }
          break;
        case 'Turn':
          if (now >= this.aiUntil) {
            this.setAiState('Drive');
            this.driveWithPower(AI_SPEED, AI_SPEED);
          }
          break;
      }
    }, AI_TICK_MS);
  }

  private stopAiTimer(): void {
    if (this.aiTimer) {
      clearInterval(this.aiTimer);
      this.aiTimer = null;
    }
    this.setAiState('Stopped');
  }

  stopAi(): void {
    const wasRunning = this.aiTimer != null;
    this.stopAiTimer();
    if (wasRunning && this.isConnected) this.stop();
  }

  destroy(): void {
    this.disconnect();
    this.manager.destroy();
  }
}

export const legoBoostService = new LegoBoostService();
export default LegoBoostService;
