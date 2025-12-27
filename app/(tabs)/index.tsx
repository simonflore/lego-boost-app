import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoost } from '../../src/context/BoostContext';

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
      <View style={styles.header}>
        <Ionicons
          name="cube"
          size={80}
          color={isConnected ? '#21ba45' : '#2185d0'}
        />
        <Text style={styles.title}>LEGO Boost</Text>
        <Text style={styles.subtitle}>
          {isConnected ? 'Connected' : 'Not Connected'}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.connectButton,
          isConnected && styles.disconnectButton,
          isConnecting && styles.connectingButton,
        ]}
        onPress={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons
              name={isConnected ? 'close-circle' : 'bluetooth'}
              size={24}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {isConnected ? 'Disconnect' : 'Connect'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {isConnecting && (
        <Text style={styles.scanningText}>
          Scanning for LEGO Boost hub...{'\n'}
          Make sure your hub is turned on
        </Text>
      )}

      {deviceInfo.error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={24} color="#db2828" />
          <Text style={styles.errorText}>{deviceInfo.error}</Text>
        </View>
      ) : null}

      {isConnected && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Device Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Distance:</Text>
            <Text style={styles.infoValue}>{deviceInfo.distance} cm</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Color:</Text>
            <Text style={styles.infoValue}>{deviceInfo.color || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tilt:</Text>
            <Text style={styles.infoValue}>
              Roll: {deviceInfo.tilt.roll}° / Pitch: {deviceInfo.tilt.pitch}°
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Motor A:</Text>
            <Text style={styles.infoValue}>{deviceInfo.ports.A.angle}°</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Motor B:</Text>
            <Text style={styles.infoValue}>{deviceInfo.ports.B.angle}°</Text>
          </View>
        </View>
      )}

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>How to Connect</Text>
        <Text style={styles.helpText}>
          1. Turn on your LEGO Boost Move Hub{'\n'}
          2. Make sure Bluetooth is enabled on your device{'\n'}
          3. Press the Connect button above{'\n'}
          4. Wait for the connection to establish
        </Text>

        {Platform.OS === 'ios' && (
          <Text style={styles.noteText}>
            Note: This app requires a development build with Bluetooth support.
            It will not work in Expo Go.
          </Text>
        )}
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2185d0',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    minWidth: 200,
  },
  disconnectButton: {
    backgroundColor: '#db2828',
  },
  connectingButton: {
    backgroundColor: '#999',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scanningText: {
    marginTop: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6f6',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e0b4b4',
  },
  errorText: {
    color: '#db2828',
    marginLeft: 10,
    flex: 1,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    color: '#666',
    fontSize: 15,
  },
  infoValue: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
  helpContainer: {
    backgroundColor: '#e8f4fd',
    borderRadius: 10,
    padding: 20,
    marginTop: 30,
    width: '100%',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2185d0',
  },
  helpText: {
    color: '#555',
    lineHeight: 24,
  },
  noteText: {
    marginTop: 15,
    color: '#856404',
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 5,
    fontSize: 13,
  },
});
