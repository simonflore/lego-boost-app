import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { legoBoostService } from '../services/LegoBoostService';
import { DeviceInfo, BoostConfiguration, ControlMode, DEFAULT_DEVICE_INFO } from '../types/lego-boost';

interface BoostContextType {
  isConnected: boolean;
  deviceInfo: DeviceInfo;
  controlMode: ControlMode;
  isConnecting: boolean;
  configuration: BoostConfiguration;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  setControlMode: (mode: ControlMode) => void;
  updateConfiguration: (config: Partial<BoostConfiguration>) => void;
  boost: typeof legoBoostService;
}

const BoostContext = createContext<BoostContextType | undefined>(undefined);

interface BoostProviderProps {
  children: ReactNode;
}

export function BoostProvider({ children }: BoostProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(DEFAULT_DEVICE_INFO);
  const [controlMode, setControlMode] = useState<ControlMode>(ControlMode.Click);
  const [configuration, setConfiguration] = useState<BoostConfiguration>({
    leftMotor: 'A',
    rightMotor: 'B',
    driveFinetune: 1,
    turnFinetune: 1,
  });

  useEffect(() => {
    // Subscribe to connection changes
    const unsubConnection = legoBoostService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Subscribe to device info updates
    const unsubDeviceInfo = legoBoostService.onDeviceInfoChange((info) => {
      setDeviceInfo({ ...info });
    });

    return () => {
      unsubConnection();
      unsubDeviceInfo();
    };
  }, []);

  const connect = async (): Promise<boolean> => {
    setIsConnecting(true);
    try {
      const success = await legoBoostService.connect(configuration);
      return success;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    await legoBoostService.disconnect();
  };

  const updateConfiguration = (config: Partial<BoostConfiguration>) => {
    const newConfig = { ...configuration, ...config };
    setConfiguration(newConfig);
    legoBoostService.updateConfiguration(config);
  };

  const value: BoostContextType = {
    isConnected,
    deviceInfo,
    controlMode,
    isConnecting,
    configuration,
    connect,
    disconnect,
    setControlMode,
    updateConfiguration,
    boost: legoBoostService,
  };

  return (
    <BoostContext.Provider value={value}>
      {children}
    </BoostContext.Provider>
  );
}

export function useBoost(): BoostContextType {
  const context = useContext(BoostContext);
  if (context === undefined) {
    throw new Error('useBoost must be used within a BoostProvider');
  }
  return context;
}
