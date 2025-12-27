import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBoost } from '../../src/context/BoostContext';
import { ControlMode, LedColor } from '../../src/types/lego-boost';
import { LegoColors, LegoSpacing, LegoBorderRadius } from '../../src/theme/colors';
import { LegoCard, LegoStudButton, LegoResponsiveContainer } from '../../src/components/LegoComponents';
import { useDeviceType } from '../../src/hooks/useDeviceType';

const LED_COLORS = [
  { name: 'Off', value: LedColor.OFF, color: LegoColors.ledOff },
  { name: 'Pink', value: LedColor.PINK, color: LegoColors.ledPink },
  { name: 'Purple', value: LedColor.PURPLE, color: LegoColors.ledPurple },
  { name: 'Blue', value: LedColor.BLUE, color: LegoColors.ledBlue },
  { name: 'Light Blue', value: LedColor.LIGHT_BLUE, color: LegoColors.ledLightBlue },
  { name: 'Cyan', value: LedColor.CYAN, color: LegoColors.ledCyan },
  { name: 'Green', value: LedColor.GREEN, color: LegoColors.ledGreen },
  { name: 'Yellow', value: LedColor.YELLOW, color: LegoColors.ledYellow },
  { name: 'Orange', value: LedColor.ORANGE, color: LegoColors.ledOrange },
  { name: 'Red', value: LedColor.RED, color: LegoColors.ledRed },
  { name: 'White', value: LedColor.WHITE, color: LegoColors.ledWhite },
];

export default function ControlScreen() {
  const { isConnected, boost, controlMode, setControlMode } = useBoost();
  const [activeLed, setActiveLed] = useState<number>(LedColor.OFF);
  const { isTablet, studButtonSize, contentMaxWidth } = useDeviceType();

  const checkConnection = (): boolean => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to LEGO Boost first.');
      return false;
    }
    return true;
  };

  const handleDrive = async (direction: number) => {
    if (!checkConnection()) return;
    if (controlMode === ControlMode.Click) {
      await boost.drive(direction);
    } else {
      await boost.driveToDirection(direction);
    }
  };

  const handleTurn = async (direction: number) => {
    if (!checkConnection()) return;
    await boost.turn(direction);
  };

  const handleStop = async () => {
    if (!checkConnection()) return;
    await boost.stop();
  };

  const handleLedChange = async (color: number) => {
    if (!checkConnection()) return;
    Haptics.selectionAsync();
    setActiveLed(color);
    await boost.led(color);
  };

  const toggleControlMode = () => {
    setControlMode(
      controlMode === ControlMode.Click ? ControlMode.Arcade : ControlMode.Click
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}>
      <LegoResponsiveContainer maxWidth={contentMaxWidth}>
        {!isConnected && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color={LegoColors.black} />
            <Text style={styles.warningText}>CONNECT TO LEGO BOOST FIRST</Text>
          </View>
        )}

      {/* Control Mode Toggle */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            controlMode === ControlMode.Click && styles.modeButtonActive,
          ]}
          onPress={() => setControlMode(ControlMode.Click)}
        >
          <Text style={[
            styles.modeButtonText,
            controlMode === ControlMode.Click && styles.modeButtonTextActive,
          ]}>CLICK</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            controlMode === ControlMode.Arcade && styles.modeButtonActive,
          ]}
          onPress={() => setControlMode(ControlMode.Arcade)}
        >
          <Text style={[
            styles.modeButtonText,
            controlMode === ControlMode.Arcade && styles.modeButtonTextActive,
          ]}>ARCADE</Text>
        </TouchableOpacity>
      </View>

      {/* Direction Controls */}
      <LegoCard color={LegoColors.blue} style={styles.controlCard}>
        <Text style={styles.cardTitle}>DIRECTION</Text>

        <View style={styles.dpadContainer}>
          {/* Up button */}
          <View style={styles.dpadRow}>
            <LegoStudButton
              onPress={() => handleDrive(1)}
              onPressOut={controlMode === ControlMode.Arcade ? handleStop : undefined}
              color={LegoColors.blue}
              size={studButtonSize}
              disabled={!isConnected}
            >
              <Ionicons name="arrow-up" size={isTablet ? 36 : 28} color={LegoColors.white} />
            </LegoStudButton>
          </View>

          {/* Left, Stop, Right buttons */}
          <View style={styles.dpadRow}>
            <LegoStudButton
              onPress={() => handleTurn(-1)}
              color={LegoColors.blue}
              size={studButtonSize}
              disabled={!isConnected}
            >
              <Ionicons name="arrow-back" size={isTablet ? 36 : 28} color={LegoColors.white} />
            </LegoStudButton>

            <LegoStudButton
              onPress={handleStop}
              color={LegoColors.red}
              size={studButtonSize}
              disabled={!isConnected}
            >
              <Ionicons name="stop" size={isTablet ? 36 : 28} color={LegoColors.white} />
            </LegoStudButton>

            <LegoStudButton
              onPress={() => handleTurn(1)}
              color={LegoColors.blue}
              size={studButtonSize}
              disabled={!isConnected}
            >
              <Ionicons name="arrow-forward" size={isTablet ? 36 : 28} color={LegoColors.white} />
            </LegoStudButton>
          </View>

          {/* Down button */}
          <View style={styles.dpadRow}>
            <LegoStudButton
              onPress={() => handleDrive(-1)}
              onPressOut={controlMode === ControlMode.Arcade ? handleStop : undefined}
              color={LegoColors.blue}
              size={studButtonSize}
              disabled={!isConnected}
            >
              <Ionicons name="arrow-down" size={isTablet ? 36 : 28} color={LegoColors.white} />
            </LegoStudButton>
          </View>
        </View>
      </LegoCard>

      {/* LED Colors */}
      <LegoCard color={LegoColors.orange} style={styles.ledCard}>
        <Text style={styles.cardTitle}>LED COLOR</Text>
        <View style={styles.ledGrid}>
          {LED_COLORS.map((led) => (
            <TouchableOpacity
              key={led.value}
              style={[
                styles.ledButton,
                { backgroundColor: led.color },
                activeLed === led.value && styles.ledButtonActive,
              ]}
              onPress={() => handleLedChange(led.value)}
            >
              {led.value === LedColor.OFF && (
                <Ionicons name="close" size={18} color={LegoColors.white} />
              )}
              {activeLed === led.value && led.value !== LedColor.OFF && (
                <Ionicons name="checkmark" size={18} color={led.value === LedColor.WHITE || led.value === LedColor.YELLOW ? LegoColors.black : LegoColors.white} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </LegoCard>

      {/* Mode Description */}
      <LegoCard color={LegoColors.green}>
        <Text style={styles.cardTitle}>
          {controlMode === ControlMode.Click ? 'CLICK MODE' : 'ARCADE MODE'}
        </Text>
        <Text style={styles.modeDescription}>
          {controlMode === ControlMode.Click
            ? 'Tap buttons to send commands. Robot moves for a fixed duration.'
            : 'Hold buttons for continuous movement. Release to stop.'}
        </Text>
      </LegoCard>
      </LegoResponsiveContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LegoColors.background,
  },
  content: {
    padding: LegoSpacing.lg,
  },
  contentTablet: {
    paddingHorizontal: LegoSpacing.xl,
    paddingVertical: LegoSpacing.xl,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LegoColors.yellow,
    padding: LegoSpacing.md,
    borderRadius: LegoBorderRadius.brick,
    marginBottom: LegoSpacing.lg,
    borderWidth: 3,
    borderColor: '#d4a900',
  },
  warningText: {
    color: LegoColors.black,
    marginLeft: LegoSpacing.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeContainer: {
    flexDirection: 'row',
    backgroundColor: LegoColors.lightGray,
    borderRadius: LegoBorderRadius.brick,
    padding: 4,
    marginBottom: LegoSpacing.lg,
  },
  modeButton: {
    flex: 1,
    paddingVertical: LegoSpacing.md,
    alignItems: 'center',
    borderRadius: LegoBorderRadius.medium,
  },
  modeButtonActive: {
    backgroundColor: LegoColors.red,
  },
  modeButtonText: {
    fontWeight: '800',
    fontSize: 14,
    color: LegoColors.darkGray,
    letterSpacing: 1,
  },
  modeButtonTextActive: {
    color: LegoColors.white,
  },
  controlCard: {
    marginBottom: LegoSpacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: LegoColors.black,
    letterSpacing: 1,
    marginBottom: LegoSpacing.lg,
    textAlign: 'center',
  },
  dpadContainer: {
    alignItems: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: LegoSpacing.md,
    marginVertical: LegoSpacing.xs,
  },
  ledCard: {
    marginBottom: LegoSpacing.lg,
  },
  ledGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: LegoSpacing.sm,
  },
  ledButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  ledButtonActive: {
    borderColor: LegoColors.black,
    borderWidth: 4,
  },
  modeDescription: {
    color: LegoColors.darkGray,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
