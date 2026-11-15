/**
 * The Bluetooth link to a Move Hub. LegoBoostService speaks the LEGO protocol
 * over it; bleTransport.ts (iOS/Android, react-native-ble-plx) and
 * bleTransport.web.ts (Web Bluetooth) provide it.
 */

export interface HubLink {
  write(data: Uint8Array): Promise<void>;
  disconnect(): Promise<void>;
}

export interface HubLinkCallbacks {
  onData(data: Uint8Array): void;
  /** The hub went away without disconnect() being called. */
  onDisconnect(): void;
}

/** Thrown with a message that is safe to show to the user. */
export class TransportError extends Error {}

export const LEGO_HUB_SERVICE_UUID = '00001623-1212-efde-1623-785feabcd123';
export const LEGO_HUB_CHARACTERISTIC_UUID = '00001624-1212-efde-1623-785feabcd123';
export const LEGO_COMPANY_ID = 0x0397;
export const MOVE_HUB_SYSTEM_TYPE = 0x40;
