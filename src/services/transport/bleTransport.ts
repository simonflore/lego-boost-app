/**
 * Hub link for iOS and Android via react-native-ble-plx.
 */

import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, State, Subscription } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import {
  HubLink,
  HubLinkCallbacks,
  LEGO_COMPANY_ID,
  LEGO_HUB_CHARACTERISTIC_UUID,
  LEGO_HUB_SERVICE_UUID,
  MOVE_HUB_SYSTEM_TYPE,
  TransportError,
} from './types';

const SCAN_TIMEOUT_MS = 15000;

let manager: BleManager | null = null;
const getManager = () => (manager ??= new BleManager());

export const transportName = 'native';

/** Null when Bluetooth can be used here at all; otherwise why not. */
export function unsupportedReason(): string | null {
  return null;
}

async function ensureBluetooth(): Promise<void> {
  if (Platform.OS === 'android') {
    const perms =
      Number(Platform.Version) >= 31
        ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
        : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
    const result = await PermissionsAndroid.requestMultiple(perms);
    if (perms.some(p => result[p] !== PermissionsAndroid.RESULTS.GRANTED)) {
      throw new TransportError('Bluetooth permission was denied.');
    }
  }

  const ble = getManager();
  const state = await ble.state();
  if (state === State.PoweredOn) return;
  if (state === State.Unauthorized) {
    throw new TransportError('Bluetooth access is off for this app. Turn it on in Settings.');
  }
  if (state === State.Unsupported) throw new TransportError('This device does not support Bluetooth LE.');

  // Unknown / Resetting / PoweredOff: give the radio a moment to come up.
  const ready = await new Promise<boolean>(resolve => {
    const timer = setTimeout(() => {
      sub.remove();
      resolve(false);
    }, 5000);
    const sub = ble.onStateChange(newState => {
      if (newState === State.PoweredOn) {
        clearTimeout(timer);
        sub.remove();
        resolve(true);
      }
    }, true);
  });
  if (!ready) {
    throw new TransportError(state === State.PoweredOff ? 'Turn on Bluetooth to connect.' : 'Bluetooth is not ready.');
  }
}

/** Other LEGO hubs share the service UUID; the advertisement says which hub it is. */
function isMoveHub(device: Device): boolean {
  if (!device.manufacturerData) return true;
  const data = Buffer.from(device.manufacturerData, 'base64');
  if (data.length < 4 || data.readUInt16LE(0) !== LEGO_COMPANY_ID) return true;
  return data[3] === MOVE_HUB_SYSTEM_TYPE;
}

function scanForHub(): Promise<Device> {
  const ble = getManager();
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      ble.stopDeviceScan();
      reject(new TransportError('No LEGO BOOST hub found. Turn it on and press its green button.'));
    }, SCAN_TIMEOUT_MS);

    ble.startDeviceScan([LEGO_HUB_SERVICE_UUID], { allowDuplicates: false }, (error, device) => {
      if (settled) return;
      if (error) {
        settled = true;
        clearTimeout(timeout);
        ble.stopDeviceScan();
        reject(new TransportError(error.message));
        return;
      }
      if (!device || !isMoveHub(device)) return;
      settled = true;
      clearTimeout(timeout);
      ble.stopDeviceScan();
      resolve(device);
    });
  });
}

async function open(device: Device, callbacks: HubLinkCallbacks): Promise<HubLink> {
  const connected = (await device.isConnected()) ? device : await device.connect();
  await connected.discoverAllServicesAndCharacteristics();
  const characteristics = await connected.characteristicsForService(LEGO_HUB_SERVICE_UUID);
  const characteristic = characteristics.find(
    c => c.uuid.toLowerCase() === LEGO_HUB_CHARACTERISTIC_UUID.toLowerCase()
  );
  if (!characteristic) throw new TransportError('This hub does not speak the LEGO protocol.');

  let closing = false;
  const subscriptions: Subscription[] = [
    // Errors here also fire on every disconnect; onDisconnected handles that.
    characteristic.monitor((error, char) => {
      if (!error && char?.value) callbacks.onData(Buffer.from(char.value, 'base64'));
    }),
    connected.onDisconnected(() => {
      subscriptions.forEach(s => s.remove());
      if (!closing) callbacks.onDisconnect();
    }),
  ];

  return {
    async write(data) {
      const payload = Buffer.from(data).toString('base64');
      // Without-response writes don't queue behind acknowledgements, which
      // keeps a 20 Hz gamepad stream responsive.
      if (characteristic.isWritableWithoutResponse) await characteristic.writeWithoutResponse(payload);
      else await characteristic.writeWithResponse(payload);
    },
    async disconnect() {
      closing = true;
      subscriptions.forEach(s => s.remove());
      await connected.cancelConnection().catch(() => undefined);
    },
  };
}

export async function connectToHub(callbacks: HubLinkCallbacks): Promise<HubLink> {
  await ensureBluetooth();

  // After an app restart iOS often keeps the hub's BLE link open, so the hub
  // stops advertising and a scan never finds it. Reuse that link first.
  const alreadyConnected = await getManager().connectedDevices([LEGO_HUB_SERVICE_UUID]);
  for (const device of alreadyConnected) {
    try {
      return await open(device, callbacks);
    } catch (error) {
      console.warn('Could not reuse connected hub:', error);
    }
  }

  return open(await scanForHub(), callbacks);
}
