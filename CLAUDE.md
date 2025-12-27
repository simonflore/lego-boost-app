# CLAUDE.md

## Project Overview

React Native Expo app for controlling LEGO Boost robots via Bluetooth Low Energy. Targets iOS and Android with native BLE support.

## Tech Stack

- **React Native** with Expo SDK 50
- **Expo Router** for file-based navigation
- **react-native-ble-plx** for Bluetooth LE
- **TypeScript** throughout

## Key Files

- `src/services/LegoBoostService.ts` - Core BLE service implementing LEGO Wireless Protocol 3.0
- `src/context/BoostContext.tsx` - React context providing boost service to all screens
- `src/types/lego-boost.ts` - Type definitions for LEGO Boost protocol
- `app/(tabs)/` - Tab screens (connect, control, motors, ai, config)

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo dev server
npm run build:dev    # Build iOS development client via EAS
```

## Development Notes

### Expo Go Limitation
This app uses `react-native-ble-plx` which requires native code. You must use a development build (`expo-dev-client`), not Expo Go.

### BLE Protocol
LEGO Boost uses LEGO Wireless Protocol 3.0 over BLE:
- Service UUID: `00001623-1212-efde-1623-785feabcd123`
- Characteristic UUID: `00001624-1212-efde-1623-785feabcd123`

Commands are sent as byte arrays. See `LegoBoostService.ts` for protocol implementation.

### Adding New Motor Commands
1. Add method to `LegoBoostService.ts`
2. Use `this.write([...bytes])` to send command
3. Expose via `useBoost()` hook from context

### Screen Navigation
Uses Expo Router with tab navigation. Add new tabs by creating files in `app/(tabs)/` and updating `app/(tabs)/_layout.tsx`.
