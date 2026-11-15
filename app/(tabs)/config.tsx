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
import { ROBOT_MODELS, getRobotModel } from '../../src/models/robotModels';
import { DEFAULT_CONFIGURATION } from '../../src/types/lego-boost';
import { LegoColors, LegoSpacing, LegoBorderRadius } from '../../src/theme/colors';
import { LegoCard, LegoBrickButton } from '../../src/components/LegoComponents';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function ConfigScreen() {
  const { configuration, updateConfiguration, selectModel, model } = useBoost();

  const handleDriveFinetuneChange = (value: number) => {
    updateConfiguration({ driveFinetune: value });
  };

  const handleTurnFinetuneChange = (value: number) => {
    updateConfiguration({ turnFinetune: value });
  };

  const handleReset = () => {
    const preset = getRobotModel(configuration.modelId);
    updateConfiguration({
      ...DEFAULT_CONFIGURATION,
      modelId: preset.id,
      leftMotor: preset.leftMotor,
      rightMotor: preset.rightMotor,
      invertDrive: preset.invertDrive,
    });
  };

  const swapped = configuration.leftMotor === 'B';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>SETTINGS</Text>
        <Text style={styles.subtitle}>Configure your robot</Text>
      </View>

      {/* Robot model */}
      <LegoCard color={LegoColors.blue} style={styles.card}>
        <Text style={styles.cardTitle}>ROBOT MODEL</Text>
        <Text style={styles.cardDescription}>
          Pick what you built. This sets how the motors drive and what each port does.
        </Text>

        <View style={styles.presetContainer}>
          {ROBOT_MODELS.map(preset => {
            const isActive = configuration.modelId === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[styles.presetButton, isActive && styles.presetButtonActive]}
                onPress={() => selectModel(preset.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
              >
                <Ionicons
                  name={preset.icon as IconName}
                  size={24}
                  color={isActive ? LegoColors.white : LegoColors.darkGray}
                />
                <View style={styles.presetTextBlock}>
                  <Text style={[styles.presetButtonText, isActive && styles.presetButtonTextActive]}>
                    {preset.name.toUpperCase()}
                  </Text>
                  <Text style={[styles.presetDescription, isActive && styles.presetButtonTextActive]}>
                    {preset.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.motorAssignment}>
          {(['A', 'B', 'C', 'D'] as const).map(port => (
            <View key={port} style={styles.motorRow}>
              <View style={[styles.motorBadge, { backgroundColor: LegoColors.blue }]}>
                <Text style={styles.motorBadgeText}>{port}</Text>
              </View>
              <Text style={styles.portText}>{model.ports[port]}</Text>
            </View>
          ))}
          {!model.drives && (
            <Text style={styles.noDriveNote}>
              This model doesn’t drive, so the drive controls are off. Motors D, A and B still work from the Motors tab.
            </Text>
          )}
        </View>

        {model.drives && (
          <View style={styles.switches}>
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={styles.sliderLabel}>Reverse direction</Text>
                <Text style={styles.switchHint}>Use if forward drives backwards</Text>
              </View>
              <Switch
                value={configuration.invertDrive}
                onValueChange={value => updateConfiguration({ invertDrive: value })}
                trackColor={{ true: LegoColors.blue, false: LegoColors.lightGray }}
              />
            </View>
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={styles.sliderLabel}>Swap left and right</Text>
                <Text style={styles.switchHint}>Use if steering left turns right</Text>
              </View>
              <Switch
                value={swapped}
                onValueChange={value =>
                  updateConfiguration(value ? { leftMotor: 'B', rightMotor: 'A' } : { leftMotor: 'A', rightMotor: 'B' })
                }
                trackColor={{ true: LegoColors.blue, false: LegoColors.lightGray }}
              />
            </View>
          </View>
        )}
      </LegoCard>

      {/* Fine-tuning */}
      <LegoCard color={LegoColors.orange} style={styles.card}>
        <Text style={styles.cardTitle}>FINE-TUNING</Text>
        <Text style={styles.cardDescription}>
          Adjust if your robot doesn’t drive straight
        </Text>

        {/* Drive Finetune */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderLabelRow}>
              <Ionicons name="speedometer" size={20} color={LegoColors.orange} />
              <Text style={styles.sliderLabel}>Drive Modifier</Text>
            </View>
            <Text style={[styles.sliderValue, { color: LegoColors.orange }]}>
              {configuration.driveFinetune.toFixed(2)}x
            </Text>
          </View>
          <View style={styles.sliderTrack}>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2}
              step={0.01}
              value={configuration.driveFinetune}
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
              {configuration.turnFinetune.toFixed(2)}x
            </Text>
          </View>
          <View style={styles.sliderTrack}>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2}
              step={0.01}
              value={configuration.turnFinetune}
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
              <Text style={styles.tipBold}>Model:</Text> Pick your build first; it sets the motor layout
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View style={[styles.tipDot, { backgroundColor: LegoColors.orange }]} />
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Drive:</Text> Increase if robot doesn’t go far enough
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
  presetTextBlock: {
    marginLeft: LegoSpacing.md,
    flex: 1,
  },
  presetDescription: {
    fontSize: 12,
    color: LegoColors.mediumGray,
    marginTop: 2,
  },
  portText: {
    flex: 1,
    marginLeft: LegoSpacing.md,
    fontSize: 13,
    color: LegoColors.darkGray,
    fontWeight: '600',
  },
  noDriveNote: {
    marginTop: LegoSpacing.sm,
    fontSize: 12,
    color: LegoColors.darkGray,
    lineHeight: 17,
  },
  switches: {
    marginTop: LegoSpacing.md,
    gap: LegoSpacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchText: {
    flex: 1,
    marginRight: LegoSpacing.md,
  },
  switchHint: {
    fontSize: 12,
    color: LegoColors.mediumGray,
    marginTop: 2,
  },
  presetButtonText: {
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
