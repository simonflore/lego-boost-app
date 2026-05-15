import { useEffect, useRef, useState, useCallback } from 'react';
import GameController from 'react-native-game-controller';
import { useBoost } from '../context/BoostContext';

const POLL_MS = 50;
const DEADZONE = 0.12;
const CHANGE_THRESHOLD = 3;

const LED_COLORS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export interface GamepadState {
  controllerConnected: boolean;
  leftX: number;
  leftY: number;
}

export function useGamepad(): GamepadState {
  const { boost, isConnected } = useBoost();
  const [controllerConnected, setControllerConnected] = useState(false);
  const [leftX, setLeftX] = useState(0);
  const [leftY, setLeftY] = useState(0);
  const lastPower = useRef({ a: 0, b: 0 });
  const ledIndex = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const cycleLed = useCallback(() => {
    ledIndex.current = (ledIndex.current + 1) % LED_COLORS.length;
    boost.led(LED_COLORS[ledIndex.current]);
  }, [boost]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const connSub = GameController.addListener('controllerDidConnect', () =>
      setControllerConnected(true)
    );
    const disconnSub = GameController.addListener('controllerDidDisconnect', () => {
      setControllerConnected(false);
      lastPower.current = { a: 0, b: 0 };
      boost.stop();
    });

    // Discrete button listeners
    const stopSub = GameController.addListener('buttonB', () => boost.stop());
    const ledSub = GameController.addListener('buttonY', cycleLed);
    const fwdSub = GameController.addListener('buttonA', () => boost.drive(1));
    const revSub = GameController.addListener('buttonX', () => boost.drive(-1));
    const dpadUpSub = GameController.addListener('dpadUp', () => boost.drive(1));
    const dpadDownSub = GameController.addListener('dpadDown', () => boost.drive(-1));
    const dpadLeftSub = GameController.addListener('dpadLeft', () => boost.turn(-1));
    const dpadRightSub = GameController.addListener('dpadRight', () => boost.turn(1));

    // Analog stick polling
    intervalRef.current = setInterval(() => {
      if (!isConnected || !controllerConnected) return;

      const pad = GameController.getExtendedGamepad?.();
      if (!pad) return;

      const rawY = -(pad.leftThumbstick?.yAxis ?? 0);
      const rawX = pad.leftThumbstick?.xAxis ?? 0;

      const y = Math.abs(rawY) < DEADZONE ? 0 : rawY;
      const x = Math.abs(rawX) < DEADZONE ? 0 : rawX;

      setLeftX(x);
      setLeftY(y);

      const clamp = (v: number) => Math.max(-100, Math.min(100, Math.round(v)));
      const a = clamp((y + x) * 100);
      const b = clamp((y - x) * 100);

      const changed =
        Math.abs(a - lastPower.current.a) >= CHANGE_THRESHOLD ||
        Math.abs(b - lastPower.current.b) >= CHANGE_THRESHOLD;

      if (changed) {
        lastPower.current = { a, b };
        if (a === 0 && b === 0) {
          boost.stop();
        } else {
          boost.driveWithPower(a, b);
        }
      }
    }, POLL_MS);

    return () => {
      clearInterval(intervalRef.current);
      connSub.remove();
      disconnSub.remove();
      stopSub.remove();
      ledSub.remove();
      fwdSub.remove();
      revSub.remove();
      dpadUpSub.remove();
      dpadDownSub.remove();
      dpadLeftSub.remove();
      dpadRightSub.remove();
    };
  }, [isConnected, controllerConnected, boost, cycleLed]);

  return { controllerConnected, leftX, leftY };
}
