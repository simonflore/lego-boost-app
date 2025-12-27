import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LegoColors, LegoBorderRadius, LegoShadow, LegoSpacing } from '../theme/colors';

interface LegoBrickButtonProps {
  onPress: () => void;
  title: string;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function LegoBrickButton({
  onPress,
  title,
  color = LegoColors.red,
  textColor = LegoColors.white,
  disabled = false,
  size = 'medium',
  style,
  icon,
}: LegoBrickButtonProps) {
  const sizeStyles = {
    small: { paddingVertical: 10, paddingHorizontal: 16 },
    medium: { paddingVertical: 14, paddingHorizontal: 24 },
    large: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const fontSizes = {
    small: 14,
    medium: 16,
    large: 20,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.brickButton,
        sizeStyles[size],
        { backgroundColor: disabled ? LegoColors.mediumGray : color },
        style,
      ]}
    >
      {/* Stud decoration */}
      <View style={[styles.studRow, { backgroundColor: disabled ? LegoColors.mediumGray : color }]}>
        <View style={[styles.stud, { borderColor: disabled ? LegoColors.darkGray : shadeColor(color, -20) }]} />
        <View style={[styles.stud, { borderColor: disabled ? LegoColors.darkGray : shadeColor(color, -20) }]} />
      </View>
      <View style={styles.buttonContent}>
        {icon}
        <Text style={[
          styles.brickButtonText,
          { color: textColor, fontSize: fontSizes[size], marginLeft: icon ? 8 : 0 }
        ]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface LegoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  color?: string;
}

export function LegoCard({ children, style, color }: LegoCardProps) {
  return (
    <View style={[
      styles.card,
      color ? { borderLeftColor: color, borderLeftWidth: 6 } : null,
      style
    ]}>
      {children}
    </View>
  );
}

interface LegoHeaderProps {
  title: string;
  subtitle?: string;
  color?: string;
}

export function LegoHeader({ title, subtitle, color = LegoColors.red }: LegoHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={[styles.headerAccent, { backgroundColor: color }]} />
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
  );
}

interface LegoStudButtonProps {
  onPress: () => void;
  onPressOut?: () => void;
  color?: string;
  size?: number;
  children?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export function LegoStudButton({
  onPress,
  onPressOut,
  color = LegoColors.blue,
  size = 70,
  children,
  disabled = false,
  style,
}: LegoStudButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressOut={onPressOut}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.studButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: disabled ? LegoColors.mediumGray : color,
          borderColor: disabled ? LegoColors.darkGray : shadeColor(color, -30),
        },
        style,
      ]}
    >
      <View style={[
        styles.studButtonInner,
        {
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: (size * 0.7) / 2,
          backgroundColor: disabled ? LegoColors.mediumGray : shadeColor(color, 10),
        }
      ]}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

interface LegoBadgeProps {
  color: string;
  label: string;
  icon?: React.ReactNode;
}

export function LegoBadge({ color, label, icon }: LegoBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      {icon}
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

interface LegoStatusIndicatorProps {
  connected: boolean;
}

export function LegoStatusIndicator({ connected }: LegoStatusIndicatorProps) {
  return (
    <View style={[
      styles.statusIndicator,
      { backgroundColor: connected ? LegoColors.green : LegoColors.red }
    ]}>
      <View style={styles.statusInner} />
    </View>
  );
}

// Helper function to shade colors
function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

const styles = StyleSheet.create({
  brickButton: {
    borderRadius: LegoBorderRadius.brick,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    position: 'relative',
    overflow: 'visible',
  },
  studRow: {
    position: 'absolute',
    top: -8,
    flexDirection: 'row',
    gap: 12,
  },
  stud: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brickButtonText: {
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: LegoColors.cardBackground,
    borderRadius: LegoBorderRadius.brick,
    padding: LegoSpacing.lg,
    ...LegoShadow.medium,
    borderWidth: 3,
    borderColor: LegoColors.lightGray,
  },
  header: {
    marginBottom: LegoSpacing.lg,
  },
  headerAccent: {
    width: 60,
    height: 6,
    borderRadius: 3,
    marginBottom: LegoSpacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: LegoColors.black,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: LegoColors.darkGray,
    marginTop: 4,
  },
  studButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    ...LegoShadow.brick,
  },
  studButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  badgeText: {
    color: LegoColors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  statusInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
