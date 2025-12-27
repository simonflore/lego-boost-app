import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { isConnected } = useBoost();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2185d0',
        tabBarInactiveTintColor: '#666',
        headerStyle: {
          backgroundColor: '#2185d0',
        },
        headerTintColor: '#fff',
        headerRight: () => (
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#21ba45' : '#db2828' }
            ]} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Connect',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bluetooth" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="control"
        options={{
          title: 'Control',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="motors"
        options={{
          title: 'Motors',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI Mode',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Config',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  statusIndicator: {
    marginRight: 15,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
