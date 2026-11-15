// Shared by index.ts (iOS, GameController) and index.web.ts (browser Gamepad API).

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

export type Events = {
  onConnect: (e: { name: string }) => void;
  onDisconnect: (e: { stillConnected: boolean }) => void;
};
