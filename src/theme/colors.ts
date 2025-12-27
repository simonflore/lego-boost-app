/**
 * Classic LEGO Color Palette
 */

export const LegoColors = {
  // Primary LEGO colors
  red: '#E3000B',
  yellow: '#FFD700',
  blue: '#0055BF',
  green: '#237841',
  orange: '#FF6D00',

  // Neutrals
  black: '#1B1B1B',
  white: '#FFFFFF',
  lightGray: '#E4E4E4',
  mediumGray: '#9C9C9C',
  darkGray: '#4D4D4D',

  // Background
  background: '#F7F7F7',
  cardBackground: '#FFFFFF',

  // Status colors
  success: '#237841',  // LEGO green
  error: '#E3000B',    // LEGO red
  warning: '#FFD700',  // LEGO yellow
  info: '#0055BF',     // LEGO blue

  // LED colors (matching LEGO Boost LED)
  ledOff: '#1B1B1B',
  ledPink: '#FF69B4',
  ledPurple: '#8A2BE2',
  ledBlue: '#0055BF',
  ledLightBlue: '#00A8E8',
  ledCyan: '#00CED1',
  ledGreen: '#237841',
  ledYellow: '#FFD700',
  ledOrange: '#FF6D00',
  ledRed: '#E3000B',
  ledWhite: '#FFFFFF',
};

export const LegoSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const LegoBorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  brick: 16,  // Like rounded LEGO brick corners
};

export const LegoShadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  brick: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 6,
  },
};
