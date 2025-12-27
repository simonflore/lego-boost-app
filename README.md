# LEGO Boost Control - React Native App

Control your LEGO Boost robot from iOS using Bluetooth Low Energy.

## Features

- **Connect**: Scan and connect to your LEGO Boost Move Hub via Bluetooth
- **Manual Control**: Directional pad for driving and turning
- **LED Control**: Change the hub's LED color
- **Motor Control**: Individual control of all motor ports (A, B, C, D)
- **AI Mode**: Autonomous obstacle avoidance
- **Configuration**: Fine-tune motor settings for your specific build

## Requirements

- iOS 13.4 or later
- LEGO Boost Move Hub (set 17101)
- Expo CLI
- EAS CLI (for building)

## Important Note: Expo Go Limitation

**This app requires a custom development build and will NOT work with the standard Expo Go app.**

This is because the app uses `react-native-ble-plx` for Bluetooth Low Energy communication, which is a native module not included in Expo Go.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### 3. Log in to Expo

```bash
eas login
```

### 4. Build Development Client

For iOS Simulator:
```bash
eas build --profile development --platform ios
```

For physical iOS device:
```bash
eas build --profile development --platform ios
```

Note: Building for a physical device requires an Apple Developer account.

### 5. Install the Development Build

After the build completes, download and install the development build on your device or simulator.

### 6. Start the Development Server

```bash
npm start
```

Then press `i` to open in iOS simulator, or scan the QR code with your development build app.

## Project Structure

```
lego-boost-app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with BoostProvider
│   └── (tabs)/             # Tab-based navigation
│       ├── index.tsx       # Connect screen
│       ├── control.tsx     # Manual control with d-pad
│       ├── motors.tsx      # Individual motor control
│       ├── ai.tsx          # Autonomous mode
│       └── config.tsx      # Configuration
├── src/
│   ├── services/
│   │   └── LegoBoostService.ts  # BLE communication service
│   ├── context/
│   │   └── BoostContext.tsx     # React context for state
│   └── types/
│       └── lego-boost.ts        # TypeScript type definitions
├── assets/                 # App icons and splash screen
├── app.json                # Expo configuration
├── eas.json                # EAS Build configuration
└── package.json
```

## How to Use

1. **Power on** your LEGO Boost Move Hub (the button on top)
2. **Open the app** and go to the Connect tab
3. **Tap Connect** - the app will scan for nearby hubs
4. **Wait for connection** - the status indicator will turn green
5. **Control your robot** using the Control, Motors, or AI tabs

## Troubleshooting

### "No LEGO Boost hub found"
- Make sure the hub is turned on (white light should be blinking)
- Ensure Bluetooth is enabled on your iOS device
- Try turning the hub off and on again
- Make sure the hub isn't connected to another device

### "Bluetooth permission denied"
- Go to Settings > Privacy > Bluetooth and enable access for this app

### App crashes on launch
- Make sure you're using a development build, not Expo Go
- Rebuild the development client

## Technology Stack

- **React Native** with Expo
- **Expo Router** for navigation
- **react-native-ble-plx** for Bluetooth LE
- **TypeScript** for type safety

## LEGO Boost Protocol

This app communicates with the LEGO Boost Move Hub using the LEGO Wireless Protocol 3.0 over Bluetooth Low Energy.

- **Service UUID**: `00001623-1212-efde-1623-785feabcd123`
- **Characteristic UUID**: `00001624-1212-efde-1623-785feabcd123`

## Disclaimer

LEGO and BOOST are Trademarks from The LEGO Company, which do not support this project.

Project maintainers are not responsible for any damage on your LEGO BOOST devices - use it at your own risk.

## License

Licensed under the [MIT](LICENSE) License.
