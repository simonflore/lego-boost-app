import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';
import { useGamepad } from '../../src/hooks/useGamepad';
import { LegoColors, LegoSpacing, LegoBorderRadius, LegoShadow } from '../../src/theme/colors';

const BUTTON_MAP = [
  { input: 'Left Stick', action: 'Drive + steer (analog)' },
  { input: 'Cross (✕)', action: 'Drive forward' },
  { input: 'Square (■)', action: 'Drive backward' },
  { input: 'Circle (○)', action: 'Stop' },
  { input: 'Triangle (△)', action: 'Cycle LED color' },
  { input: 'D-Pad ↑↓', action: 'Drive forward / backward' },
  { input: 'D-Pad ←→', action: 'Turn left / right' },
];

function StickIndicator({ x, y, label }: { x: number; y: number; label: string }) {
  const SIZE = 100;
  const DOT = 14;
  const clampedX = Math.max(-1, Math.min(1, x));
  const clampedY = Math.max(-1, Math.min(1, y));
  const dotLeft = (SIZE - DOT) / 2 + clampedX * ((SIZE - DOT) / 2);
  const dotTop = (SIZE - DOT) / 2 - clampedY * ((SIZE - DOT) / 2);

  return (
    <View style={styles.stickWrapper}>
      <Text style={styles.stickLabel}>{label}</Text>
      <View style={[styles.stickZone, { width: SIZE, height: SIZE }]}>
        <View style={styles.stickCrosshairH} />
        <View style={styles.stickCrosshairV} />
        <View style={[styles.stickDot, { left: dotLeft, top: dotTop, width: DOT, height: DOT, borderRadius: DOT / 2 }]} />
      </View>
      <Text style={styles.stickValue}>
        {clampedX.toFixed(2)}, {clampedY.toFixed(2)}
      </Text>
    </View>
  );
}

export default function GamepadScreen() {
  const { isConnected } = useBoost();
  const { controllerConnected, leftX, leftY } = useGamepad();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!isConnected && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={16} color={LegoColors.black} />
          <Text style={styles.warningText}>Not connected to LEGO Hub</Text>
        </View>
      )}

      {/* Controller status */}
      <View style={styles.card}>
        <Ionicons
          name="logo-playstation"
          size={56}
          color={controllerConnected ? LegoColors.blue : LegoColors.mediumGray}
        />
        <Text style={[styles.statusText, { color: controllerConnected ? LegoColors.blue : LegoColors.mediumGray }]}>
          {controllerConnected ? 'PS4 Controller Connected' : 'No Controller Detected'}
        </Text>
        {!controllerConnected && (
          <Text style={styles.pairHint}>
            Hold Share + PS on your controller to pair via Bluetooth Settings
          </Text>
        )}
      </View>

      {/* Stick visualiser */}
      <View style={[styles.card, styles.sticksRow]}>
        <StickIndicator x={leftX} y={leftY} label="Left Stick" />
      </View>

      {/* Button mapping */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Button Mapping</Text>
        {BUTTON_MAP.map(({ input, action }) => (
          <View key={input} style={styles.mapRow}>
            <Text style={styles.mapInput}>{input}</Text>
            <Text style={styles.mapAction}>{action}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LegoColors.background,
  },
  content: {
    padding: LegoSpacing.md,
    gap: LegoSpacing.md,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LegoSpacing.sm,
    backgroundColor: LegoColors.warning,
    padding: LegoSpacing.sm,
    borderRadius: LegoBorderRadius.medium,
  },
  warningText: {
    fontWeight: '700',
    color: LegoColors.black,
    fontSize: 13,
  },
  card: {
    backgroundColor: LegoColors.cardBackground,
    borderRadius: LegoBorderRadius.brick,
    padding: LegoSpacing.lg,
    alignItems: 'center',
    ...LegoShadow.small,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: LegoSpacing.sm,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  pairHint: {
    marginTop: LegoSpacing.sm,
    fontSize: 13,
    color: LegoColors.mediumGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  sticksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stickWrapper: {
    alignItems: 'center',
    gap: LegoSpacing.xs,
  },
  stickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: LegoColors.darkGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stickZone: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: LegoColors.lightGray,
    backgroundColor: LegoColors.background,
    position: 'relative',
  },
  stickCrosshairH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: LegoColors.lightGray,
  },
  stickCrosshairV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: LegoColors.lightGray,
  },
  stickDot: {
    position: 'absolute',
    backgroundColor: LegoColors.blue,
  },
  stickValue: {
    fontSize: 11,
    color: LegoColors.mediumGray,
    fontVariant: ['tabular-nums'],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: LegoColors.darkGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: LegoSpacing.md,
    alignSelf: 'flex-start',
  },
  mapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: LegoSpacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: LegoColors.lightGray,
    gap: LegoSpacing.sm,
  },
  mapInput: {
    fontSize: 13,
    fontWeight: '700',
    color: LegoColors.blue,
    flex: 1,
  },
  mapAction: {
    fontSize: 13,
    color: LegoColors.darkGray,
    flex: 1,
    textAlign: 'right',
  },
});
