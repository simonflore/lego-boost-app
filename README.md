# LEGO Boost Control

React Native app to control LEGO Boost robots via Bluetooth on iOS and Android.

## Features

- **Connect** - Scan and connect to LEGO Boost Move Hub via BLE
- **Manual Control** - D-pad for driving/turning with Click or Arcade modes
- **LED Control** - Change hub LED color (11 colors)
- **Motor Control** - Individual power control for ports A, B, C, D
- **AI Mode** - Autonomous obstacle avoidance
- **Configuration** - Motor presets and fine-tuning

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
eas build --profile development --platform ios

# Start dev server (after installing the build)
npm start
```

> **Note:** This app requires a custom development build. It will NOT work with Expo Go due to native Bluetooth module requirements.

## Project Structure

```
app/                      # Expo Router screens (tabs)
src/
├── services/
│   └── LegoBoostService.ts   # BLE protocol implementation
├── context/
│   └── BoostContext.tsx      # React context for state
└── types/
    └── lego-boost.ts         # TypeScript definitions
```

## BLE Protocol

Communicates with LEGO Boost using LEGO Wireless Protocol 3.0:
- Service: `00001623-1212-efde-1623-785feabcd123`
- Characteristic: `00001624-1212-efde-1623-785feabcd123`

## License

MIT - LEGO and BOOST are trademarks of The LEGO Company. Use at your own risk.
