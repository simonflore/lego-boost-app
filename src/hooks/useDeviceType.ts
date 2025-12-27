import { useWindowDimensions, Platform } from 'react-native';

export type DeviceType = 'phone' | 'tablet';
export type Orientation = 'portrait' | 'landscape';

interface DeviceInfo {
  deviceType: DeviceType;
  orientation: Orientation;
  isTablet: boolean;
  isPhone: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  width: number;
  height: number;
  // Responsive column counts
  columns: 1 | 2 | 3 | 4;
  // Content max width for tablets
  contentMaxWidth: number;
  // Control sizes
  studButtonSize: number;
  cardPadding: number;
}

export function useDeviceType(): DeviceInfo {
  const { width, height } = useWindowDimensions();

  // Determine if tablet based on screen size
  // iPad Mini: 768x1024, iPad: 810x1080, iPad Pro: 1024x1366+
  const isTablet = Math.min(width, height) >= 600;
  const isPhone = !isTablet;

  const isLandscape = width > height;
  const isPortrait = !isLandscape;

  const deviceType: DeviceType = isTablet ? 'tablet' : 'phone';
  const orientation: Orientation = isLandscape ? 'landscape' : 'portrait';

  // Determine column count based on device and orientation
  let columns: 1 | 2 | 3 | 4 = 1;
  if (isTablet) {
    columns = isLandscape ? 3 : 2;
  } else {
    columns = isLandscape ? 2 : 1;
  }

  // Content max width for tablets (center content)
  const contentMaxWidth = isTablet ? 700 : width;

  // Responsive control sizes
  const studButtonSize = isTablet ? 90 : 70;
  const cardPadding = isTablet ? 28 : 20;

  return {
    deviceType,
    orientation,
    isTablet,
    isPhone,
    isLandscape,
    isPortrait,
    width,
    height,
    columns,
    contentMaxWidth,
    studButtonSize,
    cardPadding,
  };
}
