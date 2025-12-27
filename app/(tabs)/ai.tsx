import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';
import { LegoColors, LegoSpacing, LegoBorderRadius } from '../../src/theme/colors';
import { LegoCard, LegoBrickButton, LegoBadge } from '../../src/components/LegoComponents';

const STATE_CONFIG: Record<string, { color: string; icon: string }> = {
  Drive: { color: LegoColors.green, icon: 'arrow-up-circle' },
  Back: { color: LegoColors.orange, icon: 'arrow-down-circle' },
  Turn: { color: LegoColors.blue, icon: 'refresh-circle' },
  Seek: { color: '#6435c9', icon: 'search-circle' },
  Manual: { color: LegoColors.darkGray, icon: 'hand-left' },
  Stopped: { color: LegoColors.red, icon: 'pause-circle' },
};

export default function AiScreen() {
  const { isConnected, boost, deviceInfo } = useBoost();
  const [isRunning, setIsRunning] = useState(false);
  const [currentState, setCurrentState] = useState<string>('Stopped');

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) {
        setCurrentState(boost.controlData.state || 'Unknown');
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    return () => {
      if (boost.isAiRunning) {
        boost.stopAi();
      }
    };
  }, []);

  const handleToggleAi = () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to LEGO Boost first.');
      return;
    }

    if (isRunning) {
      boost.stopAi();
      setIsRunning(false);
      setCurrentState('Stopped');
    } else {
      boost.startAi();
      setIsRunning(true);
      setCurrentState('Starting...');
    }
  };

  const stateConfig = STATE_CONFIG[currentState] || STATE_CONFIG.Stopped;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!isConnected && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color={LegoColors.black} />
          <Text style={styles.warningText}>CONNECT TO LEGO BOOST FIRST</Text>
        </View>
      )}

      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.robotIcon, isRunning && styles.robotIconActive]}>
          <Ionicons
            name="flash"
            size={48}
            color={LegoColors.white}
          />
        </View>
        <Text style={styles.title}>AI MODE</Text>
        <Text style={styles.subtitle}>Autonomous obstacle avoidance</Text>
      </View>

      {/* Current State */}
      <View style={styles.stateSection}>
        <Text style={styles.stateLabel}>CURRENT STATE</Text>
        <LegoBadge
          color={stateConfig.color}
          label={currentState.toUpperCase()}
          icon={<Ionicons name={stateConfig.icon as any} size={24} color={LegoColors.white} />}
        />
      </View>

      {/* Sensor Data */}
      <LegoCard color={LegoColors.blue} style={styles.sensorCard}>
        <Text style={styles.cardTitle}>SENSORS</Text>

        <View style={styles.sensorGrid}>
          <View style={styles.sensorItem}>
            <View style={[styles.sensorIcon, { backgroundColor: LegoColors.blue }]}>
              <Ionicons name="resize" size={24} color={LegoColors.white} />
            </View>
            <Text style={styles.sensorValue}>{deviceInfo.distance}</Text>
            <Text style={styles.sensorLabel}>Distance (cm)</Text>
          </View>

          <View style={styles.sensorItem}>
            <View style={[styles.sensorIcon, { backgroundColor: LegoColors.orange }]}>
              <Ionicons name="color-palette" size={24} color={LegoColors.white} />
            </View>
            <Text style={styles.sensorValue}>{deviceInfo.color || 'N/A'}</Text>
            <Text style={styles.sensorLabel}>Color</Text>
          </View>

          <View style={styles.sensorItem}>
            <View style={[styles.sensorIcon, { backgroundColor: LegoColors.green }]}>
              <Ionicons name="sync" size={24} color={LegoColors.white} />
            </View>
            <Text style={styles.sensorValue}>{deviceInfo.tilt.roll}°</Text>
            <Text style={styles.sensorLabel}>Roll</Text>
          </View>

          <View style={styles.sensorItem}>
            <View style={[styles.sensorIcon, { backgroundColor: LegoColors.red }]}>
              <Ionicons name="swap-vertical" size={24} color={LegoColors.white} />
            </View>
            <Text style={styles.sensorValue}>{deviceInfo.tilt.pitch}°</Text>
            <Text style={styles.sensorLabel}>Pitch</Text>
          </View>
        </View>
      </LegoCard>

      {/* Start/Stop Button */}
      <View style={styles.buttonContainer}>
        <LegoBrickButton
          onPress={handleToggleAi}
          title={isRunning ? 'Stop AI' : 'Start AI'}
          color={isRunning ? LegoColors.red : LegoColors.green}
          size="large"
          disabled={!isConnected}
          icon={
            <Ionicons
              name={isRunning ? 'stop' : 'play'}
              size={28}
              color={LegoColors.white}
            />
          }
        />
      </View>

      {/* AI Behavior */}
      <LegoCard color={LegoColors.yellow}>
        <Text style={styles.cardTitle}>HOW IT WORKS</Text>
        <View style={styles.behaviorList}>
          <View style={styles.behaviorItem}>
            <View style={[styles.behaviorDot, { backgroundColor: '#6435c9' }]} />
            <View style={styles.behaviorTextContainer}>
              <Text style={styles.behaviorTitle}>SEEK</Text>
              <Text style={styles.behaviorDesc}>Looking for path</Text>
            </View>
          </View>
          <View style={styles.behaviorItem}>
            <View style={[styles.behaviorDot, { backgroundColor: LegoColors.green }]} />
            <View style={styles.behaviorTextContainer}>
              <Text style={styles.behaviorTitle}>DRIVE</Text>
              <Text style={styles.behaviorDesc}>Moving forward</Text>
            </View>
          </View>
          <View style={styles.behaviorItem}>
            <View style={[styles.behaviorDot, { backgroundColor: LegoColors.orange }]} />
            <View style={styles.behaviorTextContainer}>
              <Text style={styles.behaviorTitle}>BACK</Text>
              <Text style={styles.behaviorDesc}>Obstacle detected</Text>
            </View>
          </View>
          <View style={styles.behaviorItem}>
            <View style={[styles.behaviorDot, { backgroundColor: LegoColors.blue }]} />
            <View style={styles.behaviorTextContainer}>
              <Text style={styles.behaviorTitle}>TURN</Text>
              <Text style={styles.behaviorDesc}>Finding new direction</Text>
            </View>
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
  hero: {
    alignItems: 'center',
    marginBottom: LegoSpacing.xl,
  },
  robotIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: LegoColors.mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: LegoColors.darkGray,
    marginBottom: LegoSpacing.md,
  },
  robotIconActive: {
    backgroundColor: LegoColors.yellow,
    borderColor: '#d4a900',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: LegoColors.black,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: LegoColors.darkGray,
    marginTop: 4,
    fontWeight: '500',
  },
  stateSection: {
    alignItems: 'center',
    marginBottom: LegoSpacing.xl,
  },
  stateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: LegoColors.darkGray,
    letterSpacing: 1,
    marginBottom: LegoSpacing.sm,
  },
  sensorCard: {
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
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sensorItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: LegoSpacing.lg,
  },
  sensorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LegoSpacing.xs,
  },
  sensorValue: {
    fontSize: 20,
    fontWeight: '900',
    color: LegoColors.black,
  },
  sensorLabel: {
    fontSize: 11,
    color: LegoColors.darkGray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: LegoSpacing.xl,
  },
  behaviorList: {
    gap: LegoSpacing.md,
  },
  behaviorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  behaviorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: LegoSpacing.md,
  },
  behaviorTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  behaviorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: LegoColors.black,
    letterSpacing: 0.5,
  },
  behaviorDesc: {
    fontSize: 13,
    color: LegoColors.darkGray,
    fontWeight: '500',
  },
});
