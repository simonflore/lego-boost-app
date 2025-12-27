import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';
import { View, StyleSheet } from 'react-native';
import { LegoColors } from '../../src/theme/colors';
import { LegoStatusIndicator } from '../../src/components/LegoComponents';

export default function TabLayout() {
  const { isConnected } = useBoost();

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
            <LegoStatusIndicator connected={isConnected} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Connect',
          headerTitle: 'LEGO BOOST',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bluetooth" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="control"
        options={{
          title: 'Control',
          headerTitle: 'CONTROL',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="motors"
        options={{
          title: 'Motors',
          headerTitle: 'MOTORS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          headerTitle: 'AI MODE',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Config',
          headerTitle: 'SETTINGS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    marginRight: 20,
  },
});
