import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function useHaptics() {
  const isHapticsAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

  const lightImpact = () => {
    if (isHapticsAvailable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const mediumImpact = () => {
    if (isHapticsAvailable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const heavyImpact = () => {
    if (isHapticsAvailable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const success = () => {
    if (isHapticsAvailable) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const warning = () => {
    if (isHapticsAvailable) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const error = () => {
    if (isHapticsAvailable) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const selection = () => {
    if (isHapticsAvailable) {
      Haptics.selectionAsync();
    }
  };

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    success,
    warning,
    error,
    selection,
  };
}
