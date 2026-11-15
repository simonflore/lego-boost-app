import { EventSubscription, requireOptionalNativeModule } from 'expo-modules-core';

export interface PadState {
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
  leftTrigger: number;
  rightTrigger: number;
  a: boolean;
  b: boolean;
  x: boolean;
  y: boolean;
  leftShoulder: boolean;
  rightShoulder: boolean;
  dpadUp: boolean;
  dpadDown: boolean;
  dpadLeft: boolean;
  dpadRight: boolean;
  menu: boolean;
  options: boolean;
}

export interface ControllerInfo {
  name: string;
  category: string;
  extended: boolean;
  micro: boolean;
}

type Events = {
  onConnect: (e: { name: string }) => void;
  onDisconnect: (e: { stillConnected: boolean }) => void;
};

interface BoostGamepadNative {
  getState(): PadState | null;
  getControllerName(): string | null;
  listControllers(): ControllerInfo[];
  addListener<K extends keyof Events>(event: K, listener: Events[K]): EventSubscription;
}

// Optional so web/Android (no native module) degrade to "no controller".
const native = requireOptionalNativeModule<BoostGamepadNative>('BoostGamepad');

export const isAvailable = native != null;

export function getState(): PadState | null {
  return native?.getState() ?? null;
}

export function getControllerName(): string | null {
  return native?.getControllerName() ?? null;
}

export function listControllers(): ControllerInfo[] {
  return native?.listControllers() ?? [];
}

export function addListener<K extends keyof Events>(
  event: K,
  listener: Events[K],
): EventSubscription {
  return native?.addListener(event, listener) ?? { remove() {} };
}
