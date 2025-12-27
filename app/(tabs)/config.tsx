import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';
import { LegoColors, LegoSpacing, LegoBorderRadius } from '../../src/theme/colors';
import { LegoCard, LegoBrickButton } from '../../src/components/LegoComponents';

const MOTOR_PRESETS = [
  { name: 'VERNIE', leftMotor: 'A' as const, rightMotor: 'B' as const, icon: 'body' },
  { name: 'CAR (A/B BACK)', leftMotor: 'B' as const, rightMotor: 'A' as const, icon: 'car-sport' },
  { name: 'CAR (A/B FRONT)', leftMotor: 'A' as const, rightMotor: 'B' as const, icon: 'car' },
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
      <View style={styles.header}>
        <Text style={styles.title}>SETTINGS</Text>
        <Text style={styles.subtitle}>Configure your robot</Text>
      </View>

      {/* Motor Presets */}
      <LegoCard color={LegoColors.blue} style={styles.card}>
        <Text style={styles.cardTitle}>MOTOR CONFIGURATION</Text>
        <Text style={styles.cardDescription}>
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
                <Ionicons
                  name={preset.icon as any}
                  size={24}
                  color={isActive ? LegoColors.white : LegoColors.darkGray}
                />
                <Text style={[
                  styles.presetButtonText,
                  isActive && styles.presetButtonTextActive,
                ]}>
                  {preset.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.motorAssignment}>
          <View style={styles.motorRow}>
            <Text style={styles.motorLabel}>LEFT MOTOR</Text>
            <View style={[styles.motorBadge, { backgroundColor: LegoColors.blue }]}>
              <Text style={styles.motorBadgeText}>{configuration.leftMotor}</Text>
            </View>
          </View>
          <View style={styles.motorRow}>
            <Text style={styles.motorLabel}>RIGHT MOTOR</Text>
            <View style={[styles.motorBadge, { backgroundColor: LegoColors.green }]}>
              <Text style={styles.motorBadgeText}>{configuration.rightMotor}</Text>
            </View>
          </View>
        </View>
      </LegoCard>

      {/* Fine-tuning */}
      <LegoCard color={LegoColors.orange} style={styles.card}>
        <Text style={styles.cardTitle}>FINE-TUNING</Text>
        <Text style={styles.cardDescription}>
          Adjust if your robot doesn't drive straight
        </Text>

        {/* Drive Finetune */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderLabelRow}>
              <Ionicons name="speedometer" size={20} color={LegoColors.orange} />
              <Text style={styles.sliderLabel}>Drive Modifier</Text>
            </View>
            <Text style={[styles.sliderValue, { color: LegoColors.orange }]}>
              {(configuration.driveFinetune || 1).toFixed(2)}x
            </Text>
          </View>
          <View style={styles.sliderTrack}>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2}
              step={0.01}
              value={configuration.driveFinetune || 1}
              onValueChange={handleDriveFinetuneChange}
              minimumTrackTintColor={LegoColors.orange}
              maximumTrackTintColor={LegoColors.lightGray}
              thumbTintColor={LegoColors.orange}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderMinMax}>0.5x</Text>
            <Text style={styles.sliderMinMax}>2.0x</Text>
          </View>
        </View>

        {/* Turn Finetune */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderLabelRow}>
              <Ionicons name="refresh" size={20} color={LegoColors.blue} />
              <Text style={styles.sliderLabel}>Turn Modifier</Text>
            </View>
            <Text style={[styles.sliderValue, { color: LegoColors.blue }]}>
              {(configuration.turnFinetune || 1).toFixed(2)}x
            </Text>
          </View>
          <View style={styles.sliderTrack}>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2}
              step={0.01}
              value={configuration.turnFinetune || 1}
              onValueChange={handleTurnFinetuneChange}
              minimumTrackTintColor={LegoColors.blue}
              maximumTrackTintColor={LegoColors.lightGray}
              thumbTintColor={LegoColors.blue}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderMinMax}>0.5x</Text>
            <Text style={styles.sliderMinMax}>2.0x</Text>
          </View>
        </View>
      </LegoCard>

      {/* Reset Button */}
      <View style={styles.buttonContainer}>
        <LegoBrickButton
          onPress={handleReset}
          title="Reset to Defaults"
          color={LegoColors.darkGray}
          size="medium"
          icon={<Ionicons name="refresh" size={20} color={LegoColors.white} />}
        />
      </View>

      {/* Tips */}
      <LegoCard color={LegoColors.yellow}>
        <Text style={styles.cardTitle}>TIPS</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <View style={[styles.tipDot, { backgroundColor: LegoColors.blue }]} />
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Vernie:</Text> Standard humanoid robot
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View style={[styles.tipDot, { backgroundColor: LegoColors.orange }]} />
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Drive:</Text> Increase if robot doesn't go far enough
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View style={[styles.tipDot, { backgroundColor: LegoColors.green }]} />
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Turn:</Text> Increase if turns are too small
            </Text>
          </View>
        </View>
      </LegoCard>

      {/* App Info */}
      <View style={styles.appInfo}>
        <View style={styles.appInfoLogo}>
          <Ionicons name="cube" size={32} color={LegoColors.red} />
        </View>
        <Text style={styles.appInfoName}>LEGO BOOST CONTROL</Text>
        <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
        <Text style={styles.appInfoNote}>Built with React Native & Expo</Text>
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
    padding: LegoSpacing.lg,
  },
  header: {
    marginBottom: LegoSpacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: LegoColors.black,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: LegoColors.darkGray,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    marginBottom: LegoSpacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: LegoColors.black,
    letterSpacing: 1,
    marginBottom: LegoSpacing.xs,
  },
  cardDescription: {
    fontSize: 13,
    color: LegoColors.darkGray,
    marginBottom: LegoSpacing.lg,
    fontWeight: '500',
  },
  presetContainer: {
    gap: LegoSpacing.sm,
    marginBottom: LegoSpacing.lg,
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LegoSpacing.md,
    borderRadius: LegoBorderRadius.medium,
    backgroundColor: LegoColors.lightGray,
    borderWidth: 3,
    borderColor: LegoColors.lightGray,
  },
  presetButtonActive: {
    backgroundColor: LegoColors.blue,
    borderColor: '#003d8f',
  },
  presetButtonText: {
    marginLeft: LegoSpacing.md,
    fontWeight: '800',
    fontSize: 14,
    color: LegoColors.darkGray,
    letterSpacing: 0.5,
  },
  presetButtonTextActive: {
    color: LegoColors.white,
  },
  motorAssignment: {
    backgroundColor: LegoColors.lightGray,
    borderRadius: LegoBorderRadius.medium,
    padding: LegoSpacing.md,
  },
  motorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: LegoSpacing.xs,
  },
  motorLabel: {
    fontSize: 13,
    color: LegoColors.darkGray,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  motorBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motorBadgeText: {
    color: LegoColors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  sliderSection: {
    marginBottom: LegoSpacing.lg,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LegoSpacing.sm,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderLabel: {
    marginLeft: LegoSpacing.sm,
    fontSize: 14,
    color: LegoColors.black,
    fontWeight: '700',
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  sliderTrack: {
    backgroundColor: LegoColors.lightGray,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderMinMax: {
    fontSize: 11,
    color: LegoColors.mediumGray,
    fontWeight: '700',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: LegoSpacing.lg,
  },
  tipsList: {
    gap: LegoSpacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: LegoSpacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: LegoColors.darkGray,
    fontWeight: '500',
    lineHeight: 18,
  },
  tipBold: {
    fontWeight: '800',
    color: LegoColors.black,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: LegoSpacing.xl,
    marginTop: LegoSpacing.md,
  },
  appInfoLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: LegoColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LegoSpacing.sm,
  },
  appInfoName: {
    fontSize: 16,
    fontWeight: '900',
    color: LegoColors.black,
    letterSpacing: 1,
  },
  appInfoVersion: {
    fontSize: 13,
    color: LegoColors.darkGray,
    marginTop: 2,
    fontWeight: '600',
  },
  appInfoNote: {
    fontSize: 12,
    color: LegoColors.mediumGray,
    marginTop: 2,
    fontWeight: '500',
  },
});
