import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';
import { LegoColors, LegoSpacing, LegoBorderRadius } from '../../src/theme/colors';
import { LegoBrickButton, LegoCard, LegoHeader } from '../../src/components/LegoComponents';

export default function ConnectScreen() {
  const { isConnected, isConnecting, deviceInfo, connect, disconnect } = useBoost();

  const handleConnect = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={[styles.iconContainer, isConnected && styles.iconConnected]}>
          <Ionicons
            name="cube"
            size={64}
            color={LegoColors.white}
          />
        </View>
        <Text style={styles.statusText}>
          {isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
        </Text>
        <View style={[styles.statusBar, isConnected && styles.statusBarConnected]} />
      </View>

      {/* Connect Button */}
      <View style={styles.buttonContainer}>
        {isConnecting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={LegoColors.red} size="large" />
            <Text style={styles.loadingText}>SCANNING FOR HUB...</Text>
          </View>
        ) : (
          <LegoBrickButton
            onPress={handleConnect}
            title={isConnected ? 'Disconnect' : 'Connect'}
            color={isConnected ? LegoColors.darkGray : LegoColors.blue}
            size="large"
            icon={
              <Ionicons
                name={isConnected ? 'close' : 'bluetooth'}
                size={24}
                color={LegoColors.white}
              />
            }
          />
        )}
      </View>

      {/* Error Message */}
      {deviceInfo.error ? (
        <LegoCard color={LegoColors.red} style={styles.errorCard}>
          <View style={styles.errorContent}>
            <Ionicons name="warning" size={24} color={LegoColors.red} />
            <Text style={styles.errorText}>{deviceInfo.error}</Text>
          </View>
        </LegoCard>
      ) : null}

      {/* Device Info */}
      {isConnected && (
        <LegoCard color={LegoColors.green} style={styles.infoCard}>
          <Text style={styles.cardTitle}>DEVICE INFO</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: LegoColors.blue }]}>
                <Ionicons name="resize" size={20} color={LegoColors.white} />
              </View>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>{deviceInfo.distance} cm</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: LegoColors.orange }]}>
                <Ionicons name="color-palette" size={20} color={LegoColors.white} />
              </View>
              <Text style={styles.infoLabel}>Color</Text>
              <Text style={styles.infoValue}>{deviceInfo.color || 'N/A'}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: LegoColors.green }]}>
                <Ionicons name="sync" size={20} color={LegoColors.white} />
              </View>
              <Text style={styles.infoLabel}>Roll</Text>
              <Text style={styles.infoValue}>{deviceInfo.tilt.roll}°</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: LegoColors.red }]}>
                <Ionicons name="swap-vertical" size={20} color={LegoColors.white} />
              </View>
              <Text style={styles.infoLabel}>Pitch</Text>
              <Text style={styles.infoValue}>{deviceInfo.tilt.pitch}°</Text>
            </View>
          </View>

          <View style={styles.motorInfo}>
            <View style={styles.motorRow}>
              <Text style={styles.motorLabel}>Motor A</Text>
              <Text style={styles.motorValue}>{deviceInfo.ports.A.angle}°</Text>
            </View>
            <View style={styles.motorRow}>
              <Text style={styles.motorLabel}>Motor B</Text>
              <Text style={styles.motorValue}>{deviceInfo.ports.B.angle}°</Text>
            </View>
          </View>
        </LegoCard>
      )}

      {/* Instructions */}
      <LegoCard color={LegoColors.yellow} style={styles.helpCard}>
        <Text style={styles.cardTitle}>HOW TO CONNECT</Text>
        <View style={styles.stepList}>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={styles.stepText}>Turn on your LEGO Boost Move Hub</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <Text style={styles.stepText}>Enable Bluetooth on your device</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <Text style={styles.stepText}>Press the Connect button above</Text>
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
  hero: {
    alignItems: 'center',
    marginBottom: LegoSpacing.xl,
    marginTop: LegoSpacing.md,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: LegoColors.mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: LegoColors.darkGray,
    marginBottom: LegoSpacing.md,
  },
  iconConnected: {
    backgroundColor: LegoColors.green,
    borderColor: '#1a5c32',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '900',
    color: LegoColors.black,
    letterSpacing: 2,
  },
  statusBar: {
    width: 100,
    height: 6,
    borderRadius: 3,
    backgroundColor: LegoColors.mediumGray,
    marginTop: LegoSpacing.sm,
  },
  statusBarConnected: {
    backgroundColor: LegoColors.green,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: LegoSpacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: LegoSpacing.lg,
  },
  loadingText: {
    marginTop: LegoSpacing.md,
    fontSize: 14,
    fontWeight: '700',
    color: LegoColors.darkGray,
    letterSpacing: 1,
  },
  errorCard: {
    marginBottom: LegoSpacing.lg,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    marginLeft: LegoSpacing.md,
    color: LegoColors.red,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: LegoSpacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: LegoColors.black,
    letterSpacing: 1,
    marginBottom: LegoSpacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -LegoSpacing.xs,
  },
  infoItem: {
    width: '50%',
    padding: LegoSpacing.xs,
    alignItems: 'center',
    marginBottom: LegoSpacing.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LegoSpacing.xs,
  },
  infoLabel: {
    fontSize: 12,
    color: LegoColors.darkGray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '800',
    color: LegoColors.black,
  },
  motorInfo: {
    borderTopWidth: 2,
    borderTopColor: LegoColors.lightGray,
    paddingTop: LegoSpacing.md,
    marginTop: LegoSpacing.sm,
  },
  motorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: LegoSpacing.xs,
  },
  motorLabel: {
    fontSize: 14,
    color: LegoColors.darkGray,
    fontWeight: '700',
  },
  motorValue: {
    fontSize: 14,
    fontWeight: '800',
    color: LegoColors.black,
  },
  helpCard: {
    marginBottom: LegoSpacing.lg,
  },
  stepList: {
    gap: LegoSpacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: LegoColors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: LegoSpacing.md,
    borderWidth: 2,
    borderColor: '#d4a900',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '900',
    color: LegoColors.black,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: LegoColors.darkGray,
    fontWeight: '600',
  },
});
