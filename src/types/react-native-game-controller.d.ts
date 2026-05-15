declare module 'react-native-game-controller' {
  interface ThumbstickState {
    xAxis: number;
    yAxis: number;
  }

  interface ExtendedGamepad {
    leftThumbstick: ThumbstickState;
    rightThumbstick: ThumbstickState;
    buttonA: boolean;
    buttonB: boolean;
    buttonX: boolean;
    buttonY: boolean;
    leftShoulder: boolean;
    rightShoulder: boolean;
    leftTrigger: number;
    rightTrigger: number;
    dpadUp: boolean;
    dpadDown: boolean;
    dpadLeft: boolean;
    dpadRight: boolean;
  }

  interface EventSubscription {
    remove(): void;
  }

  type GameControllerEvent =
    | 'controllerDidConnect'
    | 'controllerDidDisconnect'
    | 'buttonA'
    | 'buttonB'
    | 'buttonX'
    | 'buttonY'
    | 'leftShoulder'
    | 'rightShoulder'
    | 'dpadUp'
    | 'dpadDown'
    | 'dpadLeft'
    | 'dpadRight';

  const GameController: {
    addListener(event: GameControllerEvent, handler: () => void): EventSubscription;
    getExtendedGamepad(): ExtendedGamepad | null;
  };

  export default GameController;
}
