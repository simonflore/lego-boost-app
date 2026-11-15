import { useEffect, useRef, useState } from 'react';
import * as BoostGamepad from '../../modules/boost-gamepad';
import type { ControllerInfo, PadState } from '../../modules/boost-gamepad';
import { useBoost } from '../context/BoostContext';

const POLL_MS = 50;
const DEADZONE = 0.12;
const CHANGE_THRESHOLD = 3;
const LED_COLOR_COUNT = 11;
const TOOL_PORT = 'D';
const FIRE_SECONDS = 0.4;
export const SPEED_LEVELS = [0.4, 0.7, 1.0];

export interface GamepadState {
  available: boolean;
  controllerConnected: boolean;
  controllerName: string | null;
  throttle: number;
  steer: number;
  speedLevel: number;
  seen: ControllerInfo[];
}

const dz = (v: number) => (Math.abs(v) < DEADZONE ? 0 : v);

/**
 * Drives the Boost from a hardware controller (Stadia, MFi, DualShock, Xbox).
 *
 * - Left stick: arcade drive (Y = throttle, X = steer)
 * - R2 / L2: analog forward / reverse (whichever beats the stick)
 * - D-pad: full-power digital drive and turn while held
 * - Right stick up/down: tool motor on port D (arm / shooter)
 * - A: fire (short burst on D) · X: reverse burst · B: stop everything (held = brake)
 * - Y: cycle hub LED · L1 / R1: speed cap down / up
 */
export function mixDrive(pad: PadState, cap: number): { throttle: number; steer: number; a: number; b: number } {
  let throttle = dz(pad.leftY);
  let steer = dz(pad.leftX);

  const triggers = pad.rightTrigger - pad.leftTrigger;
  if (Math.abs(dz(triggers)) > Math.abs(throttle)) throttle = triggers;

  if (pad.dpadUp) throttle = 1;
  if (pad.dpadDown) throttle = -1;
  if (pad.dpadLeft) steer = -1;
  if (pad.dpadRight) steer = 1;

  let a = throttle + steer;
  let b = throttle - steer;
  const peak = Math.max(1, Math.abs(a), Math.abs(b));
  a = Math.round((a / peak) * cap * 100);
  b = Math.round((b / peak) * cap * 100);
  return { throttle, steer, a, b };
}

export function useGamepad(): GamepadState {
  const { boost, isConnected } = useBoost();
  const [controllerName, setControllerName] = useState<string | null>(
    () => BoostGamepad.getControllerName(),
  );
  const [throttle, setThrottle] = useState(0);
  const [steer, setSteer] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [seen, setSeen] = useState<ControllerInfo[]>(() => BoostGamepad.listControllers());

  const speedRef = useRef(1);
  const lastPower = useRef({ a: 0, b: 0 });
  const lastTool = useRef(0);
  const prev = useRef<PadState | null>(null);
  const ledIndex = useRef(0);

  useEffect(() => {
    // Events only refresh the diagnostics list; the poll below decides
    // "connected", so a pad paired before launch is never missed.
    const refresh = () => setSeen(BoostGamepad.listControllers());
    const onConnect = BoostGamepad.addListener('onConnect', refresh);
    const onDisconnect = BoostGamepad.addListener('onDisconnect', refresh);
    const slowRefresh = setInterval(refresh, 2000);
    return () => {
      onConnect.remove();
      onDisconnect.remove();
      clearInterval(slowRefresh);
    };
  }, [boost]);

  useEffect(() => {
    const id = setInterval(() => {
      const pad = BoostGamepad.getState();
      if (!pad) {
        if (prev.current) {
          prev.current = null;
          setControllerName(null);
          setThrottle(0);
          setSteer(0);
          if (lastPower.current.a !== 0 || lastPower.current.b !== 0) boost.stop();
          if (lastTool.current !== 0) boost.motorSpeed(TOOL_PORT, 0);
          lastPower.current = { a: 0, b: 0 };
          lastTool.current = 0;
        }
        return;
      }
      if (!prev.current) setControllerName(BoostGamepad.getControllerName() ?? 'Controller');
      const before = prev.current;
      prev.current = pad;
      const pressed = (k: keyof PadState) => pad[k] === true && before?.[k] !== true;

      if (pressed('leftShoulder') || pressed('rightShoulder')) {
        const delta = pad.rightShoulder ? 1 : -1;
        speedRef.current = Math.max(0, Math.min(SPEED_LEVELS.length - 1, speedRef.current + delta));
        setSpeedLevel(speedRef.current);
      }

      const { throttle: t, steer: s, a, b } = mixDrive(pad, SPEED_LEVELS[speedRef.current]);
      setThrottle(t);
      setSteer(s);

      if (!isConnected) return;

      if (pressed('y')) {
        ledIndex.current = (ledIndex.current + 1) % LED_COLOR_COUNT;
        boost.led(ledIndex.current);
      }

      if (pad.b) {
        if (pressed('b') || lastPower.current.a !== 0 || lastPower.current.b !== 0) {
          lastPower.current = { a: 0, b: 0 };
          boost.stop();
        }
        if (pressed('b') || lastTool.current !== 0) {
          lastTool.current = 0;
          boost.motorSpeed(TOOL_PORT, 0);
        }
        return;
      }

      // Tool motor (port D): right stick is analog, A fires a short burst.
      const tool = Math.round(dz(pad.rightY) * 100);
      if (tool !== 0 || lastTool.current !== 0) {
        if (Math.abs(tool - lastTool.current) >= CHANGE_THRESHOLD || (tool === 0) !== (lastTool.current === 0)) {
          lastTool.current = tool;
          boost.motorSpeed(TOOL_PORT, tool);
        }
      } else if (pressed('a')) {
        boost.motorTime(TOOL_PORT, FIRE_SECONDS, 100);
      }
      if (pressed('x')) boost.drive(-1);

      const changed =
        Math.abs(a - lastPower.current.a) >= CHANGE_THRESHOLD ||
        Math.abs(b - lastPower.current.b) >= CHANGE_THRESHOLD ||
        ((a === 0 && b === 0) !== (lastPower.current.a === 0 && lastPower.current.b === 0));

      if (changed) {
        lastPower.current = { a, b };
        if (a === 0 && b === 0) boost.stop();
        else boost.driveWithPower(a, b);
      }
    }, POLL_MS);

    return () => clearInterval(id);
  }, [isConnected, boost]);

  return {
    available: BoostGamepad.isAvailable,
    controllerConnected: controllerName != null,
    controllerName,
    throttle,
    steer,
    speedLevel,
    seen,
  };
}
