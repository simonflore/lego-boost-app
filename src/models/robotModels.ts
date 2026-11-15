/**
 * Port layouts for the five official LEGO BOOST (17101) builds, plus a generic
 * car. A preset decides how drive commands map onto the hub's motors and what
 * the screens call each port.
 *
 * All five builds use the Move Hub's internal motors on A and B, the
 * colour & distance sensor on C and the external motor on D. What differs is
 * whether A+B drive the model and what the D motor does.
 */

export type MotorPort = 'A' | 'B';

export interface RobotModel {
  id: RobotModelId;
  name: string;
  description: string;
  icon: string; // Ionicons name
  /** Does this build drive around on A+B? Drive controls are disabled when false. */
  drives: boolean;
  leftMotor: MotorPort;
  rightMotor: MotorPort;
  /** Reverse forward/backward for builds where the hub sits backwards. */
  invertDrive: boolean;
  ports: Record<'A' | 'B' | 'C' | 'D', string>;
  /** What the external motor on D does, shown on the gamepad tab. */
  toolLabel: string;
}

export type RobotModelId = 'vernie' | 'mtr4' | 'frankie' | 'guitar' | 'autobuilder' | 'car';

export const ROBOT_MODELS: RobotModel[] = [
  {
    id: 'vernie',
    name: 'Vernie',
    description: 'The talking robot',
    icon: 'body',
    drives: true,
    leftMotor: 'A',
    rightMotor: 'B',
    invertDrive: false,
    ports: { A: 'Left wheel', B: 'Right wheel', C: 'Colour & distance sensor (head)', D: 'Head turn / arm' },
    toolLabel: 'Head turn',
  },
  {
    id: 'mtr4',
    name: 'M.T.R.4',
    description: 'Multi-Tooled Rover',
    icon: 'construct',
    drives: true,
    leftMotor: 'A',
    rightMotor: 'B',
    invertDrive: false,
    ports: { A: 'Left track', B: 'Right track', C: 'Colour & distance sensor (face)', D: 'Tool: arm / shooter' },
    toolLabel: 'Arm / shooter',
  },
  {
    id: 'frankie',
    name: 'Frankie the Cat',
    description: 'Interactive cat, stays put',
    icon: 'paw',
    drives: false,
    leftMotor: 'A',
    rightMotor: 'B',
    invertDrive: false,
    ports: { A: 'Hub motor A (body movement)', B: 'Hub motor B (body movement)', C: 'Colour & distance sensor', D: 'Head' },
    toolLabel: 'Head',
  },
  {
    id: 'guitar',
    name: 'Guitar 4000',
    description: 'Plays sounds, stays put',
    icon: 'musical-notes',
    drives: false,
    leftMotor: 'A',
    rightMotor: 'B',
    invertDrive: false,
    ports: { A: 'Hub motor A', B: 'Hub motor B', C: 'Colour & distance sensor (neck)', D: 'Whammy / effects motor' },
    toolLabel: 'Effects motor',
  },
  {
    id: 'autobuilder',
    name: 'AutoBuilder',
    description: 'Builds small models on a conveyor',
    icon: 'cube',
    drives: false,
    leftMotor: 'A',
    rightMotor: 'B',
    invertDrive: false,
    ports: { A: 'Hub motor A (conveyor)', B: 'Hub motor B (conveyor)', C: 'Colour & distance sensor', D: 'Builder arm' },
    toolLabel: 'Builder arm',
  },
  {
    id: 'car',
    name: 'Custom car',
    description: 'Your own build, hub facing backwards',
    icon: 'car-sport',
    drives: true,
    leftMotor: 'B',
    rightMotor: 'A',
    invertDrive: true,
    ports: { A: 'Right wheel', B: 'Left wheel', C: 'Sensor or motor', D: 'Steering or tool' },
    toolLabel: 'Motor D',
  },
];

export const DEFAULT_MODEL_ID: RobotModelId = 'vernie';

export function getRobotModel(id: RobotModelId | undefined): RobotModel {
  return ROBOT_MODELS.find(m => m.id === id) ?? ROBOT_MODELS[0];
}
