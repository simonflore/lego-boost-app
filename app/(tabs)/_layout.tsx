import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';
import { View, Text, StyleSheet } from 'react-native';
import { LegoColors } from '../../src/theme/colors';
import { LegoStatusIndicator } from '../../src/components/LegoComponents';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Tab bar colours can be null in the new navigation types; Ionicons wants undefined.
const tabIcon = (name: IconName) =>
  function TabIcon({ color, size }: { color: unknown; size: number }) {
    return <Ionicons name={name} size={size} color={(color as string | null) ?? undefined} />;
  };

export default function TabLayout() {
  const { isConnected, deviceInfo } = useBoost();
  const battery = isConnected ? deviceInfo.battery : null;
  const batteryIcon =
    battery == null ? 'battery-full' : battery > 60 ? 'battery-full' : battery > 20 ? 'battery-half' : 'battery-dead';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: LegoColors.red,
        tabBarInactiveTintColor: LegoColors.mediumGray,
        tabBarStyle: {
          backgroundColor: LegoColors.white,
          borderTopWidth: 3,
          borderTopColor: LegoColors.lightGray,
          height: 88,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
        headerStyle: {
          backgroundColor: LegoColors.red,
          height: 100,
        },
        headerTintColor: LegoColors.white,
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 20,
          letterSpacing: 1,
        },
        headerRight: () => (
          <View style={styles.statusContainer}>
            {battery != null && (
              <View style={[styles.battery, battery <= 15 && styles.batteryLow]}>
                <Ionicons
                  name={batteryIcon}
                  size={18}
                  color={battery <= 15 ? LegoColors.black : LegoColors.white}
                />
                <Text style={[styles.batteryText, battery <= 15 && styles.batteryTextLow]}>
                  {battery}%
                </Text>
              </View>
            )}
            <LegoStatusIndicator connected={isConnected} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Connect',
          headerTitle: 'BOOST CONTROL',
          tabBarIcon: tabIcon('bluetooth'),
        }}
      />
      <Tabs.Screen
        name="control"
        options={{
          title: 'Control',
          headerTitle: 'CONTROL',
          tabBarIcon: tabIcon('game-controller'),
        }}
      />
      <Tabs.Screen
        name="gamepad"
        options={{
          title: 'Gamepad',
          headerTitle: 'GAMEPAD',
          tabBarIcon: tabIcon('game-controller'),
        }}
      />
      <Tabs.Screen
        name="motors"
        options={{
          title: 'Motors',
          headerTitle: 'MOTORS',
          tabBarIcon: tabIcon('cog'),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          headerTitle: 'AI MODE',
          tabBarIcon: tabIcon('flash'),
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Config',
          headerTitle: 'SETTINGS',
          tabBarIcon: tabIcon('settings'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  battery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  batteryLow: {
    backgroundColor: LegoColors.warning,
  },
  batteryText: {
    color: LegoColors.white,
    fontWeight: '800',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  batteryTextLow: {
    color: LegoColors.black,
  },
});
