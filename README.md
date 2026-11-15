# LEGO Boost Control

React Native app to control LEGO Boost robots via Bluetooth on iOS and Android.

## Features

- **Connect** - Scan and connect to LEGO Boost Move Hub via BLE
- **Manual Control** - D-pad for driving/turning with Click or Arcade modes
- **LED Control** - Change hub LED color (11 colors)
- **Motor Control** - Individual power control for ports A, B, C, D
- **AI Mode** - Autonomous obstacle avoidance
- **Configuration** - Motor presets and fine-tuning
- **Gamepad** - Drive with a hardware controller (Google Stadia in Bluetooth mode, MFi, PlayStation, Xbox) via Apple's GameController framework

## Tech Stack

- **React Native** 0.81 with Expo SDK 54
- **Expo Router** for file-based navigation
- **react-native-ble-plx** for Bluetooth LE
- **TypeScript** throughout

## Requirements

- iOS 13.4+ or Android 6.0+
- LEGO Boost Move Hub (set 17101)
- Node.js 18+

## Quick Start

```bash
# Install dependencies
npm install

# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Build development client for iOS
npm run build:dev

# Start dev server (after installing the build)
npm start
```

> **Note:** This app requires a custom development build. It will NOT work with Expo Go due to native Bluetooth module requirements.

## Available Scripts

```bash
npm start            # Start Expo dev server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run build:dev    # Build iOS development client via EAS
npm run build:preview # Build iOS preview build via EAS
npm run lint         # Run ESLint
```

## Project Structure

```
app/                          # Expo Router screens
├── _layout.tsx               # Root layout
└── (tabs)/                   # Tab navigation
    ├── _layout.tsx           # Tab bar configuration
    ├── index.tsx             # Connect screen
    ├── control.tsx           # Manual control screen
    ├── motors.tsx            # Motor control screen
    ├── gamepad.tsx           # Hardware controller screen
    ├── ai.tsx                # AI autonomous mode
    └── config.tsx            # Configuration screen
modules/
└── boost-gamepad/            # Local Expo module (Swift) bridging GCController to JS
src/
├── components/
│   └── LegoComponents.tsx    # Shared UI components
├── context/
│   └── BoostContext.tsx      # React context for BLE state
├── hooks/
│   ├── useDeviceType.ts      # Device detection hook
│   └── useHaptics.ts         # Haptic feedback hook
├── services/
│   └── LegoBoostService.ts   # BLE protocol implementation
├── theme/
│   └── colors.ts             # App color palette
└── types/
    └── lego-boost.ts         # TypeScript definitions
```

## BLE Protocol

Communicates with LEGO Boost using LEGO Wireless Protocol 3.0:
- Service: `00001623-1212-efde-1623-785feabcd123`
- Characteristic: `00001624-1212-efde-1623-785feabcd123`

Commands are sent as byte arrays. See `LegoBoostService.ts` for protocol implementation.

## Development

### Adding New Motor Commands
1. Add method to `src/services/LegoBoostService.ts`
2. Use `this.write([...bytes])` to send command
3. Expose via `useBoost()` hook from context

### Adding New Screens
1. Create a new file in `app/(tabs)/`
2. Update `app/(tabs)/_layout.tsx` to add the tab

## License

MIT - LEGO and BOOST are trademarks of The LEGO Company. Use at your own risk.

## Gamepad

1. Pair a PlayStation, Xbox or MFi controller in iOS Settings > Bluetooth.
2. Port layout matches the M.T.R.4 build: A + B drive, C colour/distance sensor, D tool motor.
3. Connect to the hub, open the **Gamepad** tab.

| Input | Action |
|-------|--------|
| Left stick | Arcade drive (throttle + steer) |
| R2 / L2 | Analog forward / reverse |
| D-pad | Full-power drive / turn while held |
| Right stick ↑↓ | Tool motor on port D (arm / shooter) |
| A | Fire: short burst on port D |
| X | Reverse burst |
| B | Stop everything (hold to brake) |
| Y | Cycle hub LED |
| L1 / R1 | Speed cap 40% / 70% / 100% |

The controller only works in a native build (`npm run ios` or EAS), not on web or in Expo Go.
