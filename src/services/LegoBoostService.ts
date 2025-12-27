/**
 * LEGO Boost BLE Service for React Native
 * Handles Bluetooth communication with LEGO Boost Move Hub
 */

import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import {
  LEGO_BOOST_SERVICE_UUID,
  LEGO_BOOST_CHARACTERISTIC_UUID,
  PortId,
  MessageType,
  MotorSubCommand,
  LedColor,
  DeviceInfo,
  ControlData,
  BoostConfiguration,
  DEFAULT_DEVICE_INFO,
  DEFAULT_CONFIGURATION,
  ControlState,
} from '../types/lego-boost';

type ConnectionCallback = (connected: boolean) => void;
type DeviceInfoCallback = (info: DeviceInfo) => void;

class LegoBoostService {
  private manager: BleManager;
  private device: Device | null = null;
  private characteristic: Characteristic | null = null;
  private configuration: BoostConfiguration = { ...DEFAULT_CONFIGURATION };
  private _deviceInfo: DeviceInfo = { ...DEFAULT_DEVICE_INFO };
  private _controlData: ControlData = {
    input: '',
    speed: 0,
    turnAngle: 0,
  };

  private connectionCallbacks: ConnectionCallback[] = [];
  private deviceInfoCallbacks: DeviceInfoCallback[] = [];
  private aiRunning: boolean = false;
  private aiInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  get deviceInfo(): DeviceInfo {
    return this._deviceInfo;
  }

  get controlData(): ControlData {
    return this._controlData;
  }

  get isConnected(): boolean {
    return this._deviceInfo.connected;
  }

  // Subscribe to connection changes
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  // Subscribe to device info updates
  onDeviceInfoChange(callback: DeviceInfoCallback): () => void {
    this.deviceInfoCallbacks.push(callback);
    return () => {
      this.deviceInfoCallbacks = this.deviceInfoCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(cb => cb(connected));
  }

  private notifyDeviceInfoChange(): void {
    this.deviceInfoCallbacks.forEach(cb => cb(this._deviceInfo));
  }

  // Request Bluetooth permissions (for Android)
  async requestPermissions(): Promise<boolean> {
    try {
      const state = await this.manager.state();
      if (state === 'PoweredOn') {
        return true;
      }
      // Wait for Bluetooth to be ready
      return new Promise((resolve) => {
        const subscription = this.manager.onStateChange((newState) => {
          if (newState === 'PoweredOn') {
            subscription.remove();
            resolve(true);
          }
        }, true);

        setTimeout(() => {
          subscription.remove();
          resolve(false);
        }, 10000);
      });
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  // Scan and connect to LEGO Boost
  async connect(config?: BoostConfiguration): Promise<boolean> {
    if (config) {
      this.configuration = { ...this.configuration, ...config };
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        this._deviceInfo.error = 'Bluetooth permission denied or not available';
        return false;
      }

      return new Promise((resolve) => {
        console.log('Scanning for LEGO Boost...');

        this.manager.startDeviceScan(
          [LEGO_BOOST_SERVICE_UUID],
          { allowDuplicates: false },
          async (error, scannedDevice) => {
            if (error) {
              console.error('Scan error:', error);
              this._deviceInfo.error = error.message;
              this.notifyDeviceInfoChange();
              resolve(false);
              return;
            }

            if (scannedDevice) {
              console.log('Found device:', scannedDevice.name);
              this.manager.stopDeviceScan();

              try {
                // Connect to device
                this.device = await scannedDevice.connect();
                console.log('Connected to device');

                // Discover services and characteristics
                await this.device.discoverAllServicesAndCharacteristics();

                // Get the characteristic for communication
                const characteristics = await this.device.characteristicsForService(
                  LEGO_BOOST_SERVICE_UUID
                );

                this.characteristic = characteristics.find(
                  c => c.uuid.toLowerCase() === LEGO_BOOST_CHARACTERISTIC_UUID.toLowerCase()
                ) || null;

                if (!this.characteristic) {
                  throw new Error('LEGO Boost characteristic not found');
                }

                // Set up notifications for incoming data
                await this.setupNotifications();

                // Monitor disconnection
                this.device.onDisconnected(() => {
                  console.log('Device disconnected');
                  this._deviceInfo.connected = false;
                  this.device = null;
                  this.characteristic = null;
                  this.notifyConnectionChange(false);
                  this.notifyDeviceInfoChange();
                });

                this._deviceInfo.connected = true;
                this._deviceInfo.error = '';
                this.notifyConnectionChange(true);
                this.notifyDeviceInfoChange();

                // Activate notifications for sensors
                await this.activatePortNotifications();

                resolve(true);
              } catch (connectError: any) {
                console.error('Connection error:', connectError);
                this._deviceInfo.error = connectError.message;
                this.notifyDeviceInfoChange();
                resolve(false);
              }
            }
          }
        );

        // Stop scanning after 15 seconds
        setTimeout(() => {
          this.manager.stopDeviceScan();
          if (!this._deviceInfo.connected) {
            this._deviceInfo.error = 'No LEGO Boost hub found. Make sure it is turned on.';
            this.notifyDeviceInfoChange();
            resolve(false);
          }
        }, 15000);
      });
    } catch (error: any) {
      console.error('Connect error:', error);
      this._deviceInfo.error = error.message;
      this.notifyDeviceInfoChange();
      return false;
    }
  }

  // Setup notifications for incoming BLE data
  private async setupNotifications(): Promise<void> {
    if (!this.characteristic) return;

    await this.characteristic.monitor((error, char) => {
      if (error) {
        console.error('Notification error:', error);
        return;
      }
      if (char?.value) {
        this.handleIncomingData(Buffer.from(char.value, 'base64'));
      }
    });
  }

  // Activate port notifications for sensors
  private async activatePortNotifications(): Promise<void> {
    // Activate distance/color sensor (port C)
    await this.write([0x0a, 0x00, 0x41, 0x02, 0x08, 0x01, 0x00, 0x00, 0x00, 0x01]);
    // Activate tilt sensor
    await this.write([0x0a, 0x00, 0x41, 0x3a, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01]);
  }

  // Handle incoming data from the hub
  private handleIncomingData(data: Buffer): void {
    const messageType = data[2];

    switch (messageType) {
      case MessageType.PORT_VALUE:
        this.handlePortValue(data);
        break;
      case MessageType.HUB_ATTACHED_IO:
        this.handleAttachedIO(data);
        break;
      default:
        // Other message types
        break;
    }
  }

  private handlePortValue(data: Buffer): void {
    const portId = data[3];

    // Distance/Color sensor (port C = 0x02)
    if (portId === 0x02) {
      if (data.length >= 6) {
        const colorValue = data[4];
        const distance = data[5];

        this._deviceInfo.distance = distance;
        this._deviceInfo.color = this.getColorName(colorValue);
        this.notifyDeviceInfoChange();
      }
    }

    // Tilt sensor (port 0x3a)
    if (portId === 0x3a) {
      if (data.length >= 6) {
        const roll = data.readInt8(4);
        const pitch = data.readInt8(5);
        this._deviceInfo.tilt = { roll, pitch };
        this.notifyDeviceInfoChange();
      }
    }

    // Motor encoders
    if (portId === PortId.A || portId === PortId.B) {
      const portKey = portId === PortId.A ? 'A' : 'B';
      if (data.length >= 8) {
        const angle = data.readInt32LE(4);
        this._deviceInfo.ports[portKey].angle = angle;
        this.notifyDeviceInfoChange();
      }
    }
  }

  private handleAttachedIO(data: Buffer): void {
    const portId = data[3];
    const event = data[4]; // 0 = detached, 1 = attached, 2 = attached virtual
    const portKey = this.getPortKey(portId);

    if (portKey && this._deviceInfo.ports[portKey]) {
      this._deviceInfo.ports[portKey].action = event === 0 ? 'detached' : 'attached';
      this.notifyDeviceInfoChange();
    }
  }

  private getPortKey(portId: number): keyof DeviceInfo['ports'] | null {
    switch (portId) {
      case PortId.A: return 'A';
      case PortId.B: return 'B';
      case PortId.C: return 'C';
      case PortId.D: return 'D';
      case PortId.LED: return 'LED';
      default: return null;
    }
  }

  private getColorName(value: number): string {
    const colors = [
      'black', 'pink', 'purple', 'blue', 'lightblue',
      'cyan', 'green', 'yellow', 'orange', 'red', 'white'
    ];
    return colors[value] || 'unknown';
  }

  // Write raw data to the hub
  async write(data: number[]): Promise<void> {
    if (!this.characteristic || !this.device) {
      console.warn('Not connected to LEGO Boost');
      return;
    }

    try {
      const buffer = Buffer.from(data);
      const base64Data = buffer.toString('base64');
      await this.characteristic.writeWithResponse(base64Data);
    } catch (error) {
      console.error('Write error:', error);
    }
  }

  // Disconnect from the hub
  async disconnect(): Promise<void> {
    this.stopAi();
    if (this.device) {
      try {
        await this.device.cancelConnection();
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
    this.device = null;
    this.characteristic = null;
    this._deviceInfo = { ...DEFAULT_DEVICE_INFO };
    this.notifyConnectionChange(false);
    this.notifyDeviceInfoChange();
  }

  // LED Control
  async led(color: LedColor | string | number): Promise<void> {
    let colorValue: number;

    if (typeof color === 'string') {
      colorValue = this.getColorValue(color);
    } else {
      colorValue = color;
    }

    await this.write([0x08, 0x00, 0x81, 0x32, 0x11, 0x51, 0x00, colorValue]);
  }

  private getColorValue(colorName: string): number {
    const colorMap: Record<string, number> = {
      off: 0, pink: 1, purple: 2, blue: 3, lightblue: 4,
      cyan: 5, green: 6, yellow: 7, orange: 8, red: 9, white: 10
    };
    return colorMap[colorName.toLowerCase()] ?? 0;
  }

  // Motor control - single port
  async motorTime(port: string, seconds: number, power: number = 100): Promise<void> {
    const portId = this.getPortId(port);
    const time = Math.round(seconds * 1000);
    const timeHigh = (time >> 8) & 0xff;
    const timeLow = time & 0xff;
    const motorPower = Math.max(-100, Math.min(100, Math.round(power)));

    await this.write([
      0x0c, 0x00, 0x81, portId, 0x11, 0x09,
      timeLow, timeHigh, motorPower, 0x64, 0x7f, 0x03
    ]);
  }

  // Motor control - both A and B
  async motorTimeMulti(seconds: number, powerA: number = 100, powerB: number = 100): Promise<void> {
    const time = Math.round(seconds * 1000);
    const timeHigh = (time >> 8) & 0xff;
    const timeLow = time & 0xff;
    const motorPowerA = Math.max(-100, Math.min(100, Math.round(powerA)));
    const motorPowerB = Math.max(-100, Math.min(100, Math.round(powerB)));

    await this.write([
      0x0d, 0x00, 0x81, PortId.AB, 0x11, 0x0a,
      timeLow, timeHigh, motorPowerA, motorPowerB, 0x64, 0x7f, 0x03
    ]);
  }

  // Motor angle control - single port
  async motorAngle(port: string, angle: number, power: number = 100): Promise<void> {
    const portId = this.getPortId(port);
    const absAngle = Math.abs(Math.round(angle));
    const motorPower = angle >= 0 ? Math.abs(power) : -Math.abs(power);

    const angleBytes = [
      absAngle & 0xff,
      (absAngle >> 8) & 0xff,
      (absAngle >> 16) & 0xff,
      (absAngle >> 24) & 0xff
    ];

    await this.write([
      0x0e, 0x00, 0x81, portId, 0x11, 0x0b,
      ...angleBytes, motorPower, 0x64, 0x7f, 0x03
    ]);
  }

  // Motor angle control - both A and B
  async motorAngleMulti(angle: number, powerA: number = 100, powerB: number = 100): Promise<void> {
    const absAngle = Math.abs(Math.round(angle));
    const motorPowerA = angle >= 0 ? Math.abs(powerA) : -Math.abs(powerA);
    const motorPowerB = angle >= 0 ? Math.abs(powerB) : -Math.abs(powerB);

    const angleBytes = [
      absAngle & 0xff,
      (absAngle >> 8) & 0xff,
      (absAngle >> 16) & 0xff,
      (absAngle >> 24) & 0xff
    ];

    await this.write([
      0x0f, 0x00, 0x81, PortId.AB, 0x11, 0x0c,
      ...angleBytes, motorPowerA, motorPowerB, 0x64, 0x7f, 0x03
    ]);
  }

  // Stop motors
  async stop(): Promise<void> {
    await this.motorTimeMulti(0, 0, 0);
    this._controlData.state = 'Stop';
    this._controlData.speed = 0;
    this._controlData.turnAngle = 0;
  }

  // Drive forward/backward
  async drive(direction: number = 1): Promise<void> {
    const power = direction >= 0 ? 100 : -100;
    const finetune = this.configuration.driveFinetune || 1;
    await this.motorTimeMulti(1 * finetune, power, power);
    this._controlData.state = direction >= 0 ? 'Drive' : 'Back';
    this._controlData.speed = power;
  }

  // Turn left/right
  async turn(direction: number): Promise<void> {
    const finetune = this.configuration.turnFinetune || 1;
    const power = 70;

    // Positive = right, negative = left
    if (direction >= 0) {
      await this.motorTimeMulti(0.5 * finetune, power, -power);
    } else {
      await this.motorTimeMulti(0.5 * finetune, -power, power);
    }
    this._controlData.state = 'Turn';
    this._controlData.turnAngle = direction;
  }

  // Drive to a direction (continuous)
  async driveToDirection(direction: number = 1): Promise<void> {
    const power = direction >= 0 ? 100 : -100;
    // Continuous drive - will run until stopped
    await this.motorTimeMulti(10, power, power);
    this._controlData.state = direction >= 0 ? 'Drive' : 'Back';
  }

  private getPortId(port: string): number {
    const portMap: Record<string, number> = {
      A: PortId.A,
      B: PortId.B,
      C: PortId.C,
      D: PortId.D,
      AB: PortId.AB,
      LED: PortId.LED,
    };
    return portMap[port.toUpperCase()] ?? PortId.A;
  }

  // Update configuration
  updateConfiguration(config: Partial<BoostConfiguration>): void {
    this.configuration = { ...this.configuration, ...config };
  }

  // AI Mode - automatic obstacle avoidance
  startAi(): void {
    if (this.aiRunning) return;
    this.aiRunning = true;
    this._controlData.state = 'Seek';

    this.aiInterval = setInterval(async () => {
      if (!this.aiRunning || !this._deviceInfo.connected) {
        this.stopAi();
        return;
      }

      const distance = this._deviceInfo.distance;
      const currentState = this._controlData.state;

      if (distance > 0 && distance < 30) {
        // Object detected - back up and turn
        if (currentState !== 'Back') {
          this._controlData.state = 'Back';
          await this.drive(-1);
        }
      } else if (currentState === 'Back') {
        // Done backing up - turn
        this._controlData.state = 'Turn';
        const turnDir = Math.random() > 0.5 ? 1 : -1;
        await this.turn(turnDir);
      } else if (currentState === 'Turn') {
        // Done turning - seek again
        this._controlData.state = 'Seek';
        await this.drive(1);
      } else {
        // Keep driving forward
        if (currentState !== 'Drive') {
          this._controlData.state = 'Drive';
          await this.drive(1);
        }
      }
    }, 500);
  }

  stopAi(): void {
    this.aiRunning = false;
    if (this.aiInterval) {
      clearInterval(this.aiInterval);
      this.aiInterval = null;
    }
    this._controlData.state = 'Manual';
    this.stop();
  }

  get isAiRunning(): boolean {
    return this.aiRunning;
  }

  // Cleanup
  destroy(): void {
    this.stopAi();
    this.disconnect();
    this.manager.destroy();
  }
}

// Singleton instance
export const legoBoostService = new LegoBoostService();
export default LegoBoostService;
