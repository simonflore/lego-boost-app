import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';

export default function AiScreen() {
  const { isConnected, boost, deviceInfo } = useBoost();
  const [isRunning, setIsRunning] = useState(false);
  const [currentState, setCurrentState] = useState<string>('Stopped');

  useEffect(() => {
    // Update state from control data
    const interval = setInterval(() => {
      if (isRunning) {
        setCurrentState(boost.controlData.state || 'Unknown');
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    // Stop AI when leaving screen
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

  const getStateColor = (state: string): string => {
    switch (state) {
      case 'Drive':
        return '#21ba45';
      case 'Back':
        return '#f2711c';
      case 'Turn':
        return '#2185d0';
      case 'Seek':
        return '#6435c9';
      case 'Manual':
        return '#767676';
      default:
        return '#333';
    }
  };

  const getStateIcon = (state: string): string => {
    switch (state) {
      case 'Drive':
        return 'arrow-up-circle';
      case 'Back':
        return 'arrow-down-circle';
      case 'Turn':
        return 'refresh-circle';
      case 'Seek':
        return 'search-circle';
      default:
        return 'pause-circle';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!isConnected && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#856404" />
          <Text style={styles.warningText}>Connect to LEGO Boost to use AI mode</Text>
        </View>
      )}

      <View style={styles.header}>
        <Ionicons
          name="flash"
          size={60}
          color={isRunning ? '#fbbd08' : '#ccc'}
        />
        <Text style={styles.title}>Autonomous Mode</Text>
        <Text style={styles.subtitle}>
          Robot automatically avoids obstacles
        </Text>
      </View>

      {/* Current State Display */}
      <View style={styles.stateContainer}>
        <Text style={styles.stateLabel}>Current State</Text>
        <View
          style={[
            styles.stateBadge,
            { backgroundColor: getStateColor(currentState) },
          ]}
        >
          <Ionicons
            name={getStateIcon(currentState) as any}
            size={24}
            color="#fff"
          />
          <Text style={styles.stateText}>{currentState}</Text>
        </View>
      </View>

      {/* Sensor Data */}
      <View style={styles.sensorContainer}>
        <Text style={styles.sectionTitle}>Sensor Data</Text>

        <View style={styles.sensorRow}>
          <View style={styles.sensorItem}>
            <Ionicons name="resize" size={24} color="#2185d0" />
            <Text style={styles.sensorLabel}>Distance</Text>
            <Text style={styles.sensorValue}>{deviceInfo.distance} cm</Text>
          </View>

          <View style={styles.sensorItem}>
            <Ionicons name="color-palette" size={24} color="#2185d0" />
            <Text style={styles.sensorLabel}>Color</Text>
            <Text style={styles.sensorValue}>{deviceInfo.color || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.sensorRow}>
          <View style={styles.sensorItem}>
            <Ionicons name="sync" size={24} color="#2185d0" />
            <Text style={styles.sensorLabel}>Roll</Text>
            <Text style={styles.sensorValue}>{deviceInfo.tilt.roll}°</Text>
          </View>

          <View style={styles.sensorItem}>
            <Ionicons name="swap-vertical" size={24} color="#2185d0" />
            <Text style={styles.sensorLabel}>Pitch</Text>
            <Text style={styles.sensorValue}>{deviceInfo.tilt.pitch}°</Text>
          </View>
        </View>
      </View>

      {/* Start/Stop Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isRunning ? styles.stopButton : styles.startButton,
          !isConnected && styles.disabledButton,
        ]}
        onPress={handleToggleAi}
        disabled={!isConnected}
      >
        <Ionicons
          name={isRunning ? 'stop' : 'play'}
          size={28}
          color="#fff"
        />
        <Text style={styles.actionButtonText}>
          {isRunning ? 'Stop AI' : 'Start AI'}
        </Text>
      </TouchableOpacity>

      {/* AI Behavior Description */}
      <View style={styles.helpBox}>
        <Text style={styles.helpTitle}>How AI Mode Works</Text>
        <Text style={styles.helpText}>
          <Text style={styles.stateHighlight}>Seek:</Text> Looking for path{'\n'}
          <Text style={styles.stateHighlight}>Drive:</Text> Moving forward{'\n'}
          <Text style={styles.stateHighlight}>Back:</Text> Obstacle detected, reversing{'\n'}
          <Text style={styles.stateHighlight}>Turn:</Text> Finding new direction
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    color: '#856404',
    marginLeft: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  stateContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  stateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  stateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  sensorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  sensorItem: {
    alignItems: 'center',
    flex: 1,
  },
  sensorLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  sensorValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 25,
  },
  startButton: {
    backgroundColor: '#21ba45',
  },
  stopButton: {
    backgroundColor: '#db2828',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
  },
  helpBox: {
    backgroundColor: '#e8f4fd',
    borderRadius: 10,
    padding: 15,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2185d0',
    marginBottom: 10,
  },
  helpText: {
    color: '#555',
    lineHeight: 24,
  },
  stateHighlight: {
    fontWeight: '600',
    color: '#333',
  },
});
