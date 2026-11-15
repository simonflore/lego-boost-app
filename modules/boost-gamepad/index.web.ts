/**
 * Browser version of the gamepad module, on the W3C Gamepad API.
 *
 * Controllers with the "standard" mapping (PlayStation, Xbox and most
 * Bluetooth pads in Chrome/Edge) are laid out like Apple's extended gamepad:
 * buttons 0-3 = A/B/X/Y, 4/5 = shoulders, 6/7 = triggers, 8/9 = options/menu,
 * 12-15 = D-pad; axes 0/1 = left stick, 2/3 = right stick (Y down is positive,
 * so it is flipped to match GameController's Y up).
 *
 * Browsers only expose a pad after a button is pressed on it.
 */

import type { ControllerInfo, Events, PadState } from './types';

export type { ControllerInfo, PadState } from './types';

type Subscription = { remove(): void };

const hasGamepads = () => typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function';

export const isAvailable = hasGamepads();

function activePad(): Gamepad | null {
  if (!hasGamepads()) return null;
  for (const pad of navigator.getGamepads()) {
    if (pad && pad.connected) return pad;
  }
  return null;
}

const pressed = (pad: Gamepad, i: number) => pad.buttons[i]?.pressed ?? false;
const analog = (pad: Gamepad, i: number) => pad.buttons[i]?.value ?? 0;
const axis = (pad: Gamepad, i: number) => pad.axes[i] ?? 0;

/** Strip the vendor/product suffix Chrome appends, e.g. "(STANDARD GAMEPAD Vendor: 054c …)". */
const displayName = (pad: Gamepad) => pad.id.replace(/\s*\(.*\)\s*$/, '').trim() || 'Controller';

export function getState(): PadState | null {
  const pad = activePad();
  if (!pad || pad.mapping !== 'standard') return null;
  return {
    leftX: axis(pad, 0),
    leftY: -axis(pad, 1),
    rightX: axis(pad, 2),
    rightY: -axis(pad, 3),
    leftTrigger: analog(pad, 6),
    rightTrigger: analog(pad, 7),
    a: pressed(pad, 0),
    b: pressed(pad, 1),
    x: pressed(pad, 2),
    y: pressed(pad, 3),
    leftShoulder: pressed(pad, 4),
    rightShoulder: pressed(pad, 5),
    dpadUp: pressed(pad, 12),
    dpadDown: pressed(pad, 13),
    dpadLeft: pressed(pad, 14),
    dpadRight: pressed(pad, 15),
    menu: pressed(pad, 9),
    options: pressed(pad, 8),
  };
}

export function getControllerName(): string | null {
  const pad = activePad();
  return pad ? displayName(pad) : null;
}

export function listControllers(): ControllerInfo[] {
  if (!hasGamepads()) return [];
  return navigator
    .getGamepads()
    .filter((pad): pad is Gamepad => !!pad && pad.connected)
    .map(pad => ({
      name: displayName(pad),
      category: pad.mapping === 'standard' ? 'standard layout' : 'non-standard layout',
      extended: pad.mapping === 'standard',
      micro: false,
    }));
}

export function addListener<K extends keyof Events>(event: K, listener: Events[K]): Subscription {
  if (typeof window === 'undefined') return { remove() {} };
  const domEvent = event === 'onConnect' ? 'gamepadconnected' : 'gamepaddisconnected';
  const handler = (e: Event) => {
    const pad = (e as GamepadEvent).gamepad;
    if (event === 'onConnect') (listener as Events['onConnect'])({ name: displayName(pad) });
    else (listener as Events['onDisconnect'])({ stillConnected: activePad() != null });
  };
  window.addEventListener(domEvent, handler);
  return { remove: () => window.removeEventListener(domEvent, handler) };
}
