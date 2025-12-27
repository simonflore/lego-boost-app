import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';
import { ControlMode, LedColor } from '../../src/types/lego-boost';

const LED_COLORS = [
  { name: 'Off', value: LedColor.OFF, color: '#333' },
  { name: 'Pink', value: LedColor.PINK, color: '#ff69b4' },
  { name: 'Purple', value: LedColor.PURPLE, color: '#800080' },
  { name: 'Blue', value: LedColor.BLUE, color: '#0000ff' },
  { name: 'Light Blue', value: LedColor.LIGHT_BLUE, color: '#add8e6' },
  { name: 'Cyan', value: LedColor.CYAN, color: '#00ffff' },
  { name: 'Green', value: LedColor.GREEN, color: '#00ff00' },
  { name: 'Yellow', value: LedColor.YELLOW, color: '#ffff00' },
  { name: 'Orange', value: LedColor.ORANGE, color: '#ffa500' },
  { name: 'Red', value: LedColor.RED, color: '#ff0000' },
  { name: 'White', value: LedColor.WHITE, color: '#ffffff' },
];

export default function ControlScreen() {
  const { isConnected, boost, controlMode, setControlMode } = useBoost();
  const [activeLed, setActiveLed] = useState<number>(LedColor.OFF);

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
    setActiveLed(color);
    await boost.led(color);
  };

  const toggleControlMode = () => {
    setControlMode(
      controlMode === ControlMode.Click ? ControlMode.Arcade : ControlMode.Click
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!isConnected && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#856404" />
          <Text style={styles.warningText}>Connect to LEGO Boost to use controls</Text>
        </View>
      )}

      {/* Control Mode Toggle */}
      <View style={styles.modeContainer}>
        <Text style={styles.modeLabel}>Control Mode:</Text>
        <TouchableOpacity style={styles.modeButton} onPress={toggleControlMode}>
          <Text style={styles.modeButtonText}>
            {controlMode === ControlMode.Click ? 'Click' : 'Arcade'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Direction Controls */}
      <View style={styles.controlPad}>
        <Text style={styles.sectionTitle}>Direction Control</Text>

        <View style={styles.dpadContainer}>
          {/* Up button */}
          <View style={styles.dpadRow}>
            <TouchableOpacity
              style={[styles.dpadButton, styles.dpadUp]}
              onPress={() => handleDrive(1)}
              onPressOut={controlMode === ControlMode.Arcade ? handleStop : undefined}
            >
              <Ionicons name="arrow-up" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Left, Stop, Right buttons */}
          <View style={styles.dpadRow}>
            <TouchableOpacity
              style={[styles.dpadButton, styles.dpadLeft]}
              onPress={() => handleTurn(-1)}
            >
              <Ionicons name="arrow-back" size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dpadButton, styles.dpadCenter]}
              onPress={handleStop}
            >
              <Ionicons name="stop" size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dpadButton, styles.dpadRight]}
              onPress={() => handleTurn(1)}
            >
              <Ionicons name="arrow-forward" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Down button */}
          <View style={styles.dpadRow}>
            <TouchableOpacity
              style={[styles.dpadButton, styles.dpadDown]}
              onPress={() => handleDrive(-1)}
              onPressOut={controlMode === ControlMode.Arcade ? handleStop : undefined}
            >
              <Ionicons name="arrow-down" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* LED Colors */}
      <View style={styles.ledContainer}>
        <Text style={styles.sectionTitle}>LED Color</Text>
        <View style={styles.ledGrid}>
          {LED_COLORS.map((led) => (
            <TouchableOpacity
              key={led.value}
              style={[
                styles.ledButton,
                { backgroundColor: led.color },
                activeLed === led.value && styles.ledButtonActive,
                led.value === LedColor.OFF && styles.ledButtonOff,
              ]}
              onPress={() => handleLedChange(led.value)}
            >
              {led.value === LedColor.OFF && (
                <Ionicons name="close" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mode Description */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>
          {controlMode === ControlMode.Click ? 'Click Mode' : 'Arcade Mode'}
        </Text>
        <Text style={styles.infoText}>
          {controlMode === ControlMode.Click
            ? 'Tap buttons to send individual commands. Robot moves for a fixed duration.'
            : 'Hold buttons for continuous movement. Release to stop.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    color: '#856404',
    marginLeft: 10,
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modeLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  modeButton: {
    backgroundColor: '#2185d0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  modeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  controlPad: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  dpadContainer: {
    alignItems: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dpadButton: {
    width: 70,
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  dpadUp: {
    backgroundColor: '#2185d0',
  },
  dpadDown: {
    backgroundColor: '#2185d0',
  },
  dpadLeft: {
    backgroundColor: '#2185d0',
  },
  dpadRight: {
    backgroundColor: '#2185d0',
  },
  dpadCenter: {
    backgroundColor: '#db2828',
  },
  ledContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ledGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ledButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  ledButtonActive: {
    borderColor: '#333',
    borderWidth: 3,
  },
  ledButtonOff: {
    backgroundColor: '#333',
  },
  infoBox: {
    backgroundColor: '#e8f4fd',
    borderRadius: 10,
    padding: 15,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2185d0',
    marginBottom: 5,
  },
  infoText: {
    color: '#555',
    lineHeight: 20,
  },
});
