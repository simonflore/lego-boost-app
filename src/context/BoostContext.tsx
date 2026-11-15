import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { legoBoostService } from '../services/LegoBoostService';
import {
  BoostConfiguration,
  ControlMode,
  DEFAULT_CONFIGURATION,
  DeviceInfo,
  createDeviceInfo,
} from '../types/lego-boost';
import { RobotModel, RobotModelId, getRobotModel } from '../models/robotModels';

const STORAGE_KEY = 'boost.configuration.v1';

interface BoostContextType {
  isConnected: boolean;
  isConnecting: boolean;
  deviceInfo: DeviceInfo;
  controlMode: ControlMode;
  configuration: BoostConfiguration;
  model: RobotModel;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  setControlMode: (mode: ControlMode) => void;
  updateConfiguration: (config: Partial<BoostConfiguration>) => void;
  selectModel: (id: RobotModelId) => void;
  boost: typeof legoBoostService;
}

const BoostContext = createContext<BoostContextType | undefined>(undefined);

export function BoostProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(legoBoostService.isConnected);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(createDeviceInfo);
  const [controlMode, setControlMode] = useState<ControlMode>(ControlMode.Click);
  const [configuration, setConfiguration] = useState<BoostConfiguration>(DEFAULT_CONFIGURATION);

  useEffect(() => {
    const unsubConnection = legoBoostService.onConnectionChange(setIsConnected);
    const unsubDeviceInfo = legoBoostService.onDeviceInfoChange(setDeviceInfo);
    return () => {
      unsubConnection();
      unsubDeviceInfo();
    };
  }, []);

  // Restore saved settings once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!raw) return;
        const saved = { ...DEFAULT_CONFIGURATION, ...JSON.parse(raw) } as BoostConfiguration;
        setConfiguration(saved);
        legoBoostService.updateConfiguration(saved);
      })
      .catch(error => console.warn('Could not load settings:', error));
  }, []);

  const updateConfiguration = useCallback((config: Partial<BoostConfiguration>) => {
    setConfiguration(prev => {
      const next = { ...prev, ...config };
      legoBoostService.updateConfiguration(next);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(error =>
        console.warn('Could not save settings:', error)
      );
      return next;
    });
  }, []);

  const selectModel = useCallback(
    (id: RobotModelId) => {
      const model = getRobotModel(id);
      updateConfiguration({
        modelId: model.id,
        leftMotor: model.leftMotor,
        rightMotor: model.rightMotor,
        invertDrive: model.invertDrive,
      });
    },
    [updateConfiguration]
  );

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      return await legoBoostService.connect();
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => legoBoostService.disconnect(), []);

  const value = useMemo<BoostContextType>(
    () => ({
      isConnected,
      isConnecting,
      deviceInfo,
      controlMode,
      configuration,
      model: getRobotModel(configuration.modelId),
      connect,
      disconnect,
      setControlMode,
      updateConfiguration,
      selectModel,
      boost: legoBoostService,
    }),
    [isConnected, isConnecting, deviceInfo, controlMode, configuration, connect, disconnect, updateConfiguration, selectModel]
  );

  return <BoostContext.Provider value={value}>{children}</BoostContext.Provider>;
}

export function useBoost(): BoostContextType {
  const context = useContext(BoostContext);
  if (context === undefined) {
    throw new Error('useBoost must be used within a BoostProvider');
  }
  return context;
}
