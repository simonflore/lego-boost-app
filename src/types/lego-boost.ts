/**
 * LEGO Boost Hub BLE Protocol Types
 */

// LEGO Boost Hub Service and Characteristic UUIDs
export const LEGO_BOOST_SERVICE_UUID = '00001623-1212-efde-1623-785feabcd123';
export const LEGO_BOOST_CHARACTERISTIC_UUID = '00001624-1212-efde-1623-785feabcd123';

// Port IDs
export enum PortId {
  A = 0x00,
  B = 0x01,
  C = 0x02,
  D = 0x03,
  AB = 0x39, // Combined motors A+B
  LED = 0x32,
  TILT = 0x3a,
  CURRENT = 0x3b,
  VOLTAGE = 0x3c,
}

// Message Types
export enum MessageType {
  HUB_PROPERTIES = 0x01,
  HUB_ACTIONS = 0x02,
  HUB_ALERTS = 0x03,
  HUB_ATTACHED_IO = 0x04,
  GENERIC_ERROR = 0x05,
  PORT_INPUT_FORMAT_SETUP = 0x41,
  PORT_INPUT_FORMAT = 0x42,
  PORT_VALUE = 0x45,
  PORT_VALUE_COMBINED = 0x46,
  PORT_OUTPUT = 0x81,
  PORT_OUTPUT_FEEDBACK = 0x82,
}

// Motor Subcommands
export enum MotorSubCommand {
  START_POWER = 0x01,
  START_POWER_SYNC = 0x02,
  SET_ACC_TIME = 0x05,
  SET_DEC_TIME = 0x06,
  START_SPEED = 0x07,
  START_SPEED_SYNC = 0x08,
  START_SPEED_FOR_DEGREES = 0x0b,
  START_SPEED_FOR_DEGREES_SYNC = 0x0c,
  GOTO_ABSOLUTE_POSITION = 0x0d,
  GOTO_ABSOLUTE_POSITION_SYNC = 0x0e,
  PRESET_ENCODER = 0x14,
}

// LED Colors
export enum LedColor {
  OFF = 0,
  PINK = 1,
  PURPLE = 2,
  BLUE = 3,
  LIGHT_BLUE = 4,
  CYAN = 5,
  GREEN = 6,
  YELLOW = 7,
  ORANGE = 8,
  RED = 9,
  WHITE = 10,
}

// Control State
export type ControlState = 'Turn' | 'Drive' | 'Stop' | 'Back' | 'Manual' | 'Seek';

// Motor type
export type Motor = 'A' | 'B';
export type PortName = 'A' | 'B' | 'AB' | 'C' | 'D' | 'LED';

// Device Information
export interface PortInfo {
  action: string;
  angle: number;
}

export interface TiltInfo {
  roll: number;
  pitch: number;
}

export interface DeviceInfo {
  connected: boolean;
  distance: number;
  color: string;
  error: string;
  rssi: number;
  tilt: TiltInfo;
  ports: {
    A: PortInfo;
    B: PortInfo;
    AB: PortInfo;
    C: PortInfo;
    D: PortInfo;
    LED: PortInfo;
  };
}

// Control Data
export interface ControlData {
  input: string;
  speed: number;
  turnAngle: number;
  state?: ControlState;
  motorA?: number;
  motorB?: number;
}

// Configuration
export interface BoostConfiguration {
  leftMotor?: Motor;
  rightMotor?: Motor;
  distanceModifier?: number;
  turnModifier?: number;
  driveFinetune?: number;
  turnFinetune?: number;
}

// Control mode
export enum ControlMode {
  Click = 0,
  Arcade = 1,
}

// Default Device Info
export const DEFAULT_DEVICE_INFO: DeviceInfo = {
  connected: false,
  distance: 0,
  color: '',
  error: '',
  rssi: 0,
  tilt: { roll: 0, pitch: 0 },
  ports: {
    A: { action: '', angle: 0 },
    B: { action: '', angle: 0 },
    AB: { action: '', angle: 0 },
    C: { action: '', angle: 0 },
    D: { action: '', angle: 0 },
    LED: { action: '', angle: 0 },
  },
};

// Default Configuration
export const DEFAULT_CONFIGURATION: BoostConfiguration = {
  leftMotor: 'A',
  rightMotor: 'B',
  distanceModifier: 1,
  turnModifier: 1,
  driveFinetune: 1,
  turnFinetune: 1,
};
