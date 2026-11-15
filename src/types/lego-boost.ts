/**
 * LEGO Wireless Protocol 3.0 types for the BOOST Move Hub
 */

import type { MotorPort, RobotModelId } from '../models/robotModels';
import { DEFAULT_MODEL_ID } from '../models/robotModels';

// Hub service and characteristic UUIDs
export const LEGO_BOOST_SERVICE_UUID = '00001623-1212-efde-1623-785feabcd123';
export const LEGO_BOOST_CHARACTERISTIC_UUID = '00001624-1212-efde-1623-785feabcd123';

// Port IDs
export enum PortId {
  A = 0x00,
  B = 0x01,
  C = 0x02,
  D = 0x03,
  AB = 0x10, // Virtual A+B port; the hub reports the real ID on connect
  LED = 0x32,
  TILT = 0x3a,
  CURRENT = 0x3b,
  VOLTAGE = 0x3c,
}

// Message types
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

// Device type IDs reported in Hub Attached I/O messages
export enum IoType {
  COLOR_DISTANCE_SENSOR = 0x25,
  EXTERNAL_MOTOR = 0x26,
  INTERNAL_MOTOR = 0x27,
  INTERNAL_TILT = 0x28,
}

// Hub LED colours
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

export type AiState = 'Stopped' | 'Drive' | 'Back' | 'Turn';

export type ExternalPort = 'A' | 'B' | 'C' | 'D';

export type AttachedDevice = 'motor' | 'sensor' | null;

export interface TiltInfo {
  roll: number;
  pitch: number;
}

export interface DeviceInfo {
  connected: boolean;
  /** Distance to the nearest object in cm, null without a sensor reading */
  distance: number | null;
  color: string;
  error: string;
  /** Percent, null until the hub reports it */
  battery: number | null;
  tilt: TiltInfo;
  /** What the hub reports on each port */
  attached: Record<ExternalPort, AttachedDevice>;
}

export interface BoostConfiguration {
  modelId: RobotModelId;
  leftMotor: MotorPort;
  rightMotor: MotorPort;
  invertDrive: boolean;
  driveFinetune: number;
  turnFinetune: number;
}

export enum ControlMode {
  Click = 0,
  Arcade = 1,
}

/** A fresh object every call: callers mutate it. */
export function createDeviceInfo(): DeviceInfo {
  return {
    connected: false,
    distance: null,
    color: '',
    error: '',
    battery: null,
    tilt: { roll: 0, pitch: 0 },
    attached: { A: null, B: null, C: null, D: null },
  };
}

export const DEFAULT_CONFIGURATION: BoostConfiguration = {
  modelId: DEFAULT_MODEL_ID,
  leftMotor: 'A',
  rightMotor: 'B',
  invertDrive: false,
  driveFinetune: 1,
  turnFinetune: 1,
};
