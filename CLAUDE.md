# CLAUDE.md

## Project Overview

React Native Expo app for controlling LEGO Boost robots via Bluetooth Low Energy. Targets iOS and Android with native BLE support.

## Tech Stack

- **React Native** 0.88 with Expo SDK 58 (continuous native generation: `ios/` is generated, not committed)
- **Expo Router** for file-based navigation
- **react-native-ble-plx** for Bluetooth LE
- **TypeScript** throughout

## Key Files

- `src/services/LegoBoostService.ts` - Core BLE service implementing LEGO Wireless Protocol 3.0
- `src/context/BoostContext.tsx` - React context providing boost service to all screens
- `src/types/lego-boost.ts` - Type definitions for LEGO Boost protocol
- `src/models/robotModels.ts` - Port layouts per BOOST build; drive mapping goes through `toAB()` in the service
- `app/(tabs)/` - Tab screens (connect, control, motors, gamepad, ai, config)
- `modules/boost-gamepad/` - Local Expo module (Swift, GCController); autolinked from `modules/`, run `pod install` after changing it
- `src/hooks/useGamepad.ts` - Polls the pad at 20 Hz and maps it to motor commands

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo dev server
npm run lint         # ESLint (eslint-config-expo)
npx tsc --noEmit     # Typecheck
npx expo prebuild --platform ios --clean   # Regenerate ios/ after app.json changes
npm run build:dev    # Build iOS development client via EAS
```

CocoaPods needs `LANG=en_US.UTF-8` in this environment.

## Development Notes

### Expo Go Limitation
This app uses `react-native-ble-plx` which requires native code. You must use a development build (`expo-dev-client`), not Expo Go.

### BLE Protocol
LEGO Boost uses LEGO Wireless Protocol 3.0 over BLE:
- Service UUID: `00001623-1212-efde-1623-785feabcd123`
- Characteristic UUID: `00001624-1212-efde-1623-785feabcd123`

Commands are sent as byte arrays. See `LegoBoostService.ts` for protocol implementation.

### Protocol gotchas
- The virtual A+B port is reported by the hub on connect (usually `0x10`); `0x39` is pre-LWP3 firmware and silently ignored.
- Colour & distance sensor mode 8 reports distance in inches plus a partial byte; the service converts to cm.
- Drive commands take left/right power; `toAB()` maps them using the model's `leftMotor` and `invertDrive`.

### Adding New Motor Commands
1. Add method to `LegoBoostService.ts`
2. Use `this.write([...bytes])` to send command
3. Expose via `useBoost()` hook from context

### Screen Navigation
Uses Expo Router with tab navigation. Add new tabs by creating files in `app/(tabs)/` and updating `app/(tabs)/_layout.tsx`.
