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
import { LegoColors, LegoSpacing, LegoBorderRadius } from '../../src/theme/colors';
import { LegoCard } from '../../src/components/LegoComponents';

interface MotorState {
  A: number;
  B: number;
  C: number;
  D: number;
}

const MOTOR_COLORS: Record<keyof MotorState, string> = {
  A: LegoColors.blue,
  B: LegoColors.green,
  C: LegoColors.orange,
  D: LegoColors.red,
};

export default function MotorsScreen() {
  const { isConnected, boost, deviceInfo } = useBoost();
  const [motorPower, setMotorPower] = useState<MotorState>({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
  });

  useEffect(() => {
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

    if (value !== 0) {
      await boost.motorTime(port, 10, value);
    } else {
      await boost.motorTime(port, 0, 0);
    }
  };

  const handleSlidingComplete = async (port: keyof MotorState, value: number) => {
    if (value === 0 && isConnected) {
      await boost.motorTime(port, 0, 0);
    }
  };

  const renderMotorSlider = (port: keyof MotorState, label: string, description: string) => (
    <LegoCard color={MOTOR_COLORS[port]} style={styles.motorCard} key={port}>
      <View style={styles.motorHeader}>
        <View style={styles.motorTitleRow}>
          <View style={[styles.motorBadge, { backgroundColor: MOTOR_COLORS[port] }]}>
            <Text style={styles.motorBadgeText}>{port}</Text>
          </View>
          <View>
            <Text style={styles.motorLabel}>{label}</Text>
            <Text style={styles.motorDescription}>{description}</Text>
          </View>
        </View>
        <Text style={[styles.motorValue, { color: MOTOR_COLORS[port] }]}>
          {motorPower[port]}%
        </Text>
      </View>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          <Slider
            style={styles.slider}
            minimumValue={-100}
            maximumValue={100}
            step={5}
            value={motorPower[port]}
            onValueChange={(value) => handleMotorChange(port, value)}
            onSlidingComplete={(value) => handleSlidingComplete(port, value)}
            minimumTrackTintColor={MOTOR_COLORS[port]}
            maximumTrackTintColor={LegoColors.lightGray}
            thumbTintColor={MOTOR_COLORS[port]}
            disabled={!isConnected}
          />
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>-100</Text>
          <Text style={styles.sliderLabelCenter}>0</Text>
          <Text style={styles.sliderLabel}>+100</Text>
        </View>
      </View>

      <View style={styles.motorStats}>
        <Ionicons name="speedometer" size={16} color={LegoColors.darkGray} />
        <Text style={styles.motorStatsText}>
          Angle: {deviceInfo.ports[port]?.angle || 0}°
        </Text>
      </View>
    </LegoCard>
  );

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
        <Text style={styles.subtitle}>Slide to control each motor's power</Text>
      </View>

      {renderMotorSlider('A', 'Motor A', 'Left drive motor')}
      {renderMotorSlider('B', 'Motor B', 'Right drive motor')}
      {renderMotorSlider('C', 'Motor C', 'External port')}
      {renderMotorSlider('D', 'Motor D', 'External port')}

      <LegoCard color={LegoColors.yellow} style={styles.helpCard}>
        <Text style={styles.helpTitle}>MOTOR PORTS</Text>
        <View style={styles.helpGrid}>
          <View style={styles.helpItem}>
            <View style={[styles.helpDot, { backgroundColor: LegoColors.blue }]} />
            <Text style={styles.helpText}>A - Left drive</Text>
          </View>
          <View style={styles.helpItem}>
            <View style={[styles.helpDot, { backgroundColor: LegoColors.green }]} />
            <Text style={styles.helpText}>B - Right drive</Text>
          </View>
          <View style={styles.helpItem}>
            <View style={[styles.helpDot, { backgroundColor: LegoColors.orange }]} />
            <Text style={styles.helpText}>C - External</Text>
          </View>
          <View style={styles.helpItem}>
            <View style={[styles.helpDot, { backgroundColor: LegoColors.red }]} />
            <Text style={styles.helpText}>D - External</Text>
          </View>
        </View>
      </LegoCard>
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
