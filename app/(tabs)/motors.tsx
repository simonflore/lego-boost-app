import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';

interface MotorState {
  A: number;
  B: number;
  C: number;
  D: number;
}

export default function MotorsScreen() {
  const { isConnected, boost, deviceInfo } = useBoost();
  const [motorPower, setMotorPower] = useState<MotorState>({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
  });

  useEffect(() => {
    // Stop all motors when leaving screen
    return () => {
      if (isConnected) {
        boost.stop();
      }
    };
  }, [isConnected]);

  const handleMotorChange = async (port: keyof MotorState, value: number) => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to LEGO Boost first.');
      return;
    }

    setMotorPower((prev) => ({ ...prev, [port]: value }));

    // Run motor with power for 10 seconds (will be overridden by next command)
    if (value !== 0) {
      await boost.motorTime(port, 10, value);
    } else {
      // Stop the motor
      await boost.motorTime(port, 0, 0);
    }
  };

  const handleSlidingComplete = async (port: keyof MotorState, value: number) => {
    if (value === 0 && isConnected) {
      await boost.motorTime(port, 0, 0);
    }
  };

  const renderMotorSlider = (port: keyof MotorState, label: string) => (
    <View style={styles.motorContainer} key={port}>
      <View style={styles.motorHeader}>
        <Text style={styles.motorLabel}>{label}</Text>
        <Text style={styles.motorValue}>{motorPower[port]}%</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>-100</Text>
        <Slider
          style={styles.slider}
          minimumValue={-100}
          maximumValue={100}
          step={5}
          value={motorPower[port]}
          onValueChange={(value) => handleMotorChange(port, value)}
          onSlidingComplete={(value) => handleSlidingComplete(port, value)}
          minimumTrackTintColor="#db2828"
          maximumTrackTintColor="#21ba45"
          thumbTintColor="#2185d0"
          disabled={!isConnected}
        />
        <Text style={styles.sliderLabel}>+100</Text>
      </View>

      <View style={styles.motorInfo}>
        <Text style={styles.motorInfoText}>
          Angle: {deviceInfo.ports[port]?.angle || 0}°
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!isConnected && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#856404" />
          <Text style={styles.warningText}>Connect to LEGO Boost to control motors</Text>
        </View>
      )}

      <Text style={styles.title}>Individual Motor Control</Text>
      <Text style={styles.subtitle}>
        Slide to control each motor's power and direction
      </Text>

      <View style={styles.motorsGrid}>
        {renderMotorSlider('A', 'Motor A (Left)')}
        {renderMotorSlider('B', 'Motor B (Right)')}
        {renderMotorSlider('C', 'Motor C (External)')}
        {renderMotorSlider('D', 'Motor D (External)')}
      </View>

      <View style={styles.helpBox}>
        <Text style={styles.helpTitle}>Motor Ports</Text>
        <Text style={styles.helpText}>
          • A & B: Main drive motors (internal){'\n'}
          • C & D: External ports for attachments{'\n'}
          • Negative values: Reverse direction{'\n'}
          • Zero: Motor stops
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  motorsGrid: {
    gap: 15,
  },
  motorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  motorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  motorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  motorValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2185d0',
    minWidth: 60,
    textAlign: 'right',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
    width: 35,
    textAlign: 'center',
  },
  motorInfo: {
    marginTop: 5,
    alignItems: 'center',
  },
  motorInfoText: {
    fontSize: 13,
    color: '#888',
  },
  helpBox: {
    backgroundColor: '#e8f4fd',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2185d0',
    marginBottom: 8,
  },
  helpText: {
    color: '#555',
    lineHeight: 22,
  },
});
