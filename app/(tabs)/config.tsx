import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';

const MOTOR_PRESETS = [
  { name: 'Vernie', leftMotor: 'A' as const, rightMotor: 'B' as const },
  { name: 'Car (A/B back)', leftMotor: 'B' as const, rightMotor: 'A' as const },
  { name: 'Car (A/B front)', leftMotor: 'A' as const, rightMotor: 'B' as const },
];

export default function ConfigScreen() {
  const { configuration, updateConfiguration } = useBoost();

  const handlePresetSelect = (preset: typeof MOTOR_PRESETS[0]) => {
    updateConfiguration({
      leftMotor: preset.leftMotor,
      rightMotor: preset.rightMotor,
    });
  };

  const handleDriveFinetuneChange = (value: number) => {
    updateConfiguration({ driveFinetune: value });
  };

  const handleTurnFinetuneChange = (value: number) => {
    updateConfiguration({ turnFinetune: value });
  };

  const handleReset = () => {
    updateConfiguration({
      leftMotor: 'A',
      rightMotor: 'B',
      driveFinetune: 1,
      turnFinetune: 1,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Configuration</Text>
      <Text style={styles.subtitle}>
        Adjust motor settings and fine-tune controls
      </Text>

      {/* Motor Presets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motor Configuration</Text>
        <Text style={styles.sectionDescription}>
          Select a preset based on your LEGO Boost model
        </Text>

        <View style={styles.presetContainer}>
          {MOTOR_PRESETS.map((preset) => {
            const isActive =
              configuration.leftMotor === preset.leftMotor &&
              configuration.rightMotor === preset.rightMotor;
            return (
              <TouchableOpacity
                key={preset.name}
                style={[
                  styles.presetButton,
                  isActive && styles.presetButtonActive,
                ]}
                onPress={() => handlePresetSelect(preset)}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    isActive && styles.presetButtonTextActive,
                  ]}
                >
                  {preset.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.motorAssignment}>
          <View style={styles.motorRow}>
            <Text style={styles.motorLabel}>Left Motor:</Text>
            <Text style={styles.motorValue}>{configuration.leftMotor}</Text>
          </View>
          <View style={styles.motorRow}>
            <Text style={styles.motorLabel}>Right Motor:</Text>
            <Text style={styles.motorValue}>{configuration.rightMotor}</Text>
          </View>
        </View>
      </View>

      {/* Fine-tuning */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fine-tuning</Text>
        <Text style={styles.sectionDescription}>
          Adjust these values if your robot doesn't drive straight or turns too much/little
        </Text>

        {/* Drive Finetune */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Drive Modifier</Text>
            <Text style={styles.sliderValue}>
              {(configuration.driveFinetune || 1).toFixed(2)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2}
            step={0.01}
            value={configuration.driveFinetune || 1}
            onValueChange={handleDriveFinetuneChange}
            minimumTrackTintColor="#2185d0"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#2185d0"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderMinMax}>0.5x</Text>
            <Text style={styles.sliderMinMax}>2.0x</Text>
          </View>
        </View>

        {/* Turn Finetune */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Turn Modifier</Text>
            <Text style={styles.sliderValue}>
              {(configuration.turnFinetune || 1).toFixed(2)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2}
            step={0.01}
            value={configuration.turnFinetune || 1}
            onValueChange={handleTurnFinetuneChange}
            minimumTrackTintColor="#2185d0"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#2185d0"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderMinMax}>0.5x</Text>
            <Text style={styles.sliderMinMax}>2.0x</Text>
          </View>
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.resetButtonText}>Reset to Defaults</Text>
      </TouchableOpacity>

      {/* Help */}
      <View style={styles.helpBox}>
        <Text style={styles.helpTitle}>Configuration Tips</Text>
        <Text style={styles.helpText}>
          • <Text style={styles.bold}>Vernie:</Text> Standard humanoid robot{'\n'}
          • <Text style={styles.bold}>Drive Modifier:</Text> Increase if robot doesn't
          go far enough, decrease if it overshoots{'\n'}
          • <Text style={styles.bold}>Turn Modifier:</Text> Increase if turns are too
          small, decrease if they're too large
        </Text>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>LEGO Boost Control</Text>
        <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
        <Text style={styles.appInfoNote}>
          Built with React Native & Expo
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
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
    color: '#333',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 15,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  presetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  presetButtonActive: {
    backgroundColor: '#e8f4fd',
    borderColor: '#2185d0',
  },
  presetButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  presetButtonTextActive: {
    color: '#2185d0',
    fontWeight: '600',
  },
  motorAssignment: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  motorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  motorLabel: {
    color: '#666',
  },
  motorValue: {
    fontWeight: '600',
    color: '#333',
  },
  sliderSection: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  sliderValue: {
    fontSize: 16,
    color: '#2185d0',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderMinMax: {
    fontSize: 12,
    color: '#999',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#767676',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpBox: {
    backgroundColor: '#e8f4fd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2185d0',
    marginBottom: 10,
  },
  helpText: {
    color: '#555',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  appInfoVersion: {
    fontSize: 13,
    color: '#999',
    marginTop: 3,
  },
  appInfoNote: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 3,
  },
});
