/**
 * Hub link for browsers via Web Bluetooth (Chrome and Edge on Android,
 * Windows, macOS, Linux and ChromeOS). Safari and Firefox don't implement it.
 */

import {
  HubLink,
  HubLinkCallbacks,
  LEGO_COMPANY_ID,
  LEGO_HUB_CHARACTERISTIC_UUID,
  LEGO_HUB_SERVICE_UUID,
  MOVE_HUB_SYSTEM_TYPE,
  TransportError,
} from './types';

// Minimal Web Bluetooth typings; the DOM lib doesn't ship them.
interface BluetoothCharacteristic extends EventTarget {
  value?: DataView;
  properties: { writeWithoutResponse: boolean };
  startNotifications(): Promise<BluetoothCharacteristic>;
  writeValueWithResponse(data: BufferSource): Promise<void>;
  writeValueWithoutResponse(data: BufferSource): Promise<void>;
}
interface BluetoothServer {
  connected: boolean;
  connect(): Promise<BluetoothServer>;
  disconnect(): void;
  getPrimaryService(uuid: string): Promise<{ getCharacteristic(uuid: string): Promise<BluetoothCharacteristic> }>;
}
interface BluetoothDeviceLike extends EventTarget {
  gatt?: BluetoothServer;
}
interface BluetoothLike {
  requestDevice(options: object): Promise<BluetoothDeviceLike>;
}

const bluetooth = (): BluetoothLike | undefined =>
  typeof navigator !== 'undefined' ? (navigator as unknown as { bluetooth?: BluetoothLike }).bluetooth : undefined;

export const transportName = 'web';

/** Null when Web Bluetooth can be used here; otherwise why not. */
export function unsupportedReason(): string | null {
  if (typeof window === 'undefined') return null; // static rendering
  if (!window.isSecureContext) return 'Web Bluetooth needs a secure (https) page.';
  if (!bluetooth()) {
    return 'This browser has no Web Bluetooth. Use Chrome or Edge on Android, Windows, macOS or ChromeOS. On iPhone or iPad, use the Boost Control app.';
  }
  return null;
}

export async function connectToHub(callbacks: HubLinkCallbacks): Promise<HubLink> {
  const reason = unsupportedReason();
  const ble = bluetooth();
  if (reason || !ble) throw new TransportError(reason ?? 'Web Bluetooth is not available.');

  let device: BluetoothDeviceLike;
  try {
    // Must run straight from the click: browsers only show the picker during a user gesture.
    device = await ble.requestDevice({
      filters: [
        {
          services: [LEGO_HUB_SERVICE_UUID],
          // [button state, system type]: only offer Move Hubs.
          manufacturerData: [
            {
              companyIdentifier: LEGO_COMPANY_ID,
              dataPrefix: new Uint8Array([0x00, MOVE_HUB_SYSTEM_TYPE]),
              mask: new Uint8Array([0x00, 0xff]),
            },
          ],
        },
      ],
      optionalServices: [LEGO_HUB_SERVICE_UUID],
    });
  } catch (error: any) {
    if (error?.name === 'NotFoundError') throw new TransportError('No hub selected.');
    throw new TransportError(error?.message ?? 'Could not open the Bluetooth picker.');
  }

  const server = await device.gatt?.connect();
  if (!server) throw new TransportError('Could not connect to the hub.');
  const service = await server.getPrimaryService(LEGO_HUB_SERVICE_UUID);
  const characteristic = await service.getCharacteristic(LEGO_HUB_CHARACTERISTIC_UUID);

  let closing = false;
  const onValue = () => {
    const value = characteristic.value;
    if (value) callbacks.onData(new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength)));
  };
  const onGone = () => {
    characteristic.removeEventListener('characteristicvaluechanged', onValue);
    device.removeEventListener('gattserverdisconnected', onGone);
    if (!closing) callbacks.onDisconnect();
  };
  characteristic.addEventListener('characteristicvaluechanged', onValue);
  device.addEventListener('gattserverdisconnected', onGone);
  await characteristic.startNotifications();

  // Web Bluetooth rejects a write while another is in flight; chain them.
  let queue: Promise<void> = Promise.resolve();

  return {
    write(data) {
      const bytes = new Uint8Array(data);
      queue = queue
        .catch(() => undefined)
        .then(() =>
          characteristic.properties.writeWithoutResponse
            ? characteristic.writeValueWithoutResponse(bytes)
            : characteristic.writeValueWithResponse(bytes)
        );
      return queue;
    },
    async disconnect() {
      closing = true;
      onGone();
      if (device.gatt?.connected) device.gatt.disconnect();
    },
  };
}
