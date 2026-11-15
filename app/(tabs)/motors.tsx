import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';
import type { ExternalPort } from '../../src/types/lego-boost';
import { LegoColors, LegoSpacing, LegoBorderRadius } from '../../src/theme/colors';
import { LegoCard, LegoBrickButton } from '../../src/components/LegoComponents';

type MotorState = Record<ExternalPort, number>;

const PORTS: ExternalPort[] = ['A', 'B', 'C', 'D'];
const STOPPED: MotorState = { A: 0, B: 0, C: 0, D: 0 };

const MOTOR_COLORS: Record<ExternalPort, string> = {
  A: LegoColors.blue,
  B: LegoColors.green,
  C: LegoColors.orange,
  D: LegoColors.red,
};

export default function MotorsScreen() {
  const { isConnected, boost, deviceInfo, model } = useBoost();
  const [motorPower, setMotorPower] = useState<MotorState>(STOPPED);

  const stopAll = useCallback(() => {
    setMotorPower(STOPPED);
    if (boost.isConnected) boost.stopAll();
  }, [boost]);

  // Leaving the tab stops every motor, so nothing keeps spinning out of sight.
  useFocusEffect(useCallback(() => stopAll, [stopAll]));

  const handleMotorChange = (port: ExternalPort, value: number) => {
    if (value === motorPower[port]) return;
    setMotorPower(prev => ({ ...prev, [port]: value }));
    boost.motorSpeed(port, value);
  };

  const renderMotorSlider = (port: ExternalPort) => {
    const isSensor = deviceInfo.attached[port] === 'sensor';
    const disabled = !isConnected || isSensor;
    return (
      <LegoCard color={MOTOR_COLORS[port]} style={styles.motorCard} key={port}>
        <View style={styles.motorHeader}>
          <View style={styles.motorTitleRow}>
            <View style={[styles.motorBadge, { backgroundColor: MOTOR_COLORS[port] }]}>
              <Text style={styles.motorBadgeText}>{port}</Text>
            </View>
            <View style={styles.motorTitleText}>
              <Text style={styles.motorLabel}>Port {port}</Text>
              <Text style={styles.motorDescription}>
                {isSensor ? 'Colour & distance sensor (no motor)' : model.ports[port]}
              </Text>
            </View>
          </View>
          <Text style={[styles.motorValue, { color: MOTOR_COLORS[port] }]}>
            {motorPower[port]}%
          </Text>
        </View>

        <View style={[styles.sliderContainer, isSensor && styles.sliderDisabled]}>
          <View style={styles.sliderTrack}>
            <Slider
              style={styles.slider}
              minimumValue={-100}
              maximumValue={100}
              step={5}
              value={motorPower[port]}
              onValueChange={value => handleMotorChange(port, value)}
              minimumTrackTintColor={MOTOR_COLORS[port]}
              maximumTrackTintColor={LegoColors.lightGray}
              thumbTintColor={MOTOR_COLORS[port]}
              disabled={disabled}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>-100</Text>
            <Text style={styles.sliderLabelCenter}>0</Text>
            <Text style={styles.sliderLabel}>+100</Text>
          </View>
        </View>
      </LegoCard>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!isConnected && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color={LegoColors.black} />
          <Text style={styles.warningText}>CONNECT TO LEGO BOOST FIRST</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>MOTOR CONTROL</Text>
        <Text style={styles.subtitle}>
          {model.name}: slide to run a motor, it keeps running until you slide back to 0
        </Text>
      </View>

      {PORTS.map(renderMotorSlider)}

      <View style={styles.stopContainer}>
        <LegoBrickButton
          onPress={stopAll}
          title="Stop all motors"
          color={LegoColors.red}
          size="medium"
          icon={<Ionicons name="stop" size={20} color={LegoColors.white} />}
        />
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
  header: {
    marginBottom: LegoSpacing.lg,
  },
  title: {
    fontSize: 24,
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
  motorTitleText: {
    flex: 1,
  },
  sliderDisabled: {
    opacity: 0.35,
  },
  stopContainer: {
    alignItems: 'center',
    marginVertical: LegoSpacing.lg,
  },
  motorCard: {
    marginBottom: LegoSpacing.md,
  },
  motorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LegoSpacing.md,
  },
  motorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: LegoSpacing.sm,
  },
  motorBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: LegoSpacing.md,
  },
  motorBadgeText: {
    color: LegoColors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  motorLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: LegoColors.black,
  },
  motorDescription: {
    fontSize: 12,
    color: LegoColors.darkGray,
    fontWeight: '500',
  },
  motorValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  sliderContainer: {
    marginBottom: LegoSpacing.sm,
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
  sliderLabel: {
    fontSize: 11,
    color: LegoColors.mediumGray,
    fontWeight: '700',
  },
  sliderLabelCenter: {
    fontSize: 11,
    color: LegoColors.mediumGray,
    fontWeight: '700',
  },
  motorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: LegoSpacing.sm,
    borderTopWidth: 2,
    borderTopColor: LegoColors.lightGray,
  },
  motorStatsText: {
    marginLeft: LegoSpacing.xs,
    fontSize: 13,
    color: LegoColors.darkGray,
    fontWeight: '600',
  },
  helpCard: {
    marginTop: LegoSpacing.sm,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: LegoColors.black,
    letterSpacing: 1,
    marginBottom: LegoSpacing.md,
  },
  helpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: LegoSpacing.xs,
  },
  helpDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: LegoSpacing.sm,
  },
  helpText: {
    fontSize: 13,
    color: LegoColors.darkGray,
    fontWeight: '600',
  },
});
