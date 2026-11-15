import { EventSubscription, requireOptionalNativeModule } from 'expo-modules-core';

import type { ControllerInfo, Events, PadState } from './types';

export type { ControllerInfo, PadState } from './types';

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
