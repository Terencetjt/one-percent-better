import { Platform } from 'react-native';

/**
 * Design tokens — warm, playful, Habithive-inspired aesthetic.
 * Cream background, golden accent, dark bars, hexagonal motif.
 */

export const colors = {
  // Surfaces
  background: '#F5F0EB',   // warm sand/cream
  surface: '#FAFAF7',      // card face
  surfaceAlt: '#EDE8E2',   // inset wells

  // Accent — golden yellow (the signature hue)
  accent: '#F5C540',
  accentSoft: '#FEF5D4',
  accentDeep: '#B8931A',

  // Dark elements — near-black bars & buttons
  dark: '#1C1C1E',
  darkMuted: '#3A3A3C',

  // Text
  text: '#1A1A1A',
  textMuted: '#4A4550',
  textFaint: '#9A9590',

  // Lines
  border: '#E8E2D8',
  borderStrong: '#D4CCC0',

  // Semantic
  success: '#7ECDC4',
  warning: '#F5C540',
  danger: '#E8857A',

  // On-surface text
  onAccent: '#1A1A1A',  // dark text on golden bg
  onDark: '#FAFAF7',    // light text on near-black

  // Shadow
  shadow: '#2C2218',
} as const;

/**
 * Habit color palette — warm, vibrant, clearly distinguishable.
 * All sit harmoniously on the cream background.
 */
export const habitPalette = [
  '#F5C540',  // golden yellow
  '#E8857A',  // coral / salmon
  '#7ECDC4',  // teal / mint
  '#B4D4A8',  // sage green
  '#C4A8D4',  // soft lavender
  '#F5A857',  // warm orange
  '#A8C4D4',  // dusty blue
  '#E8B4A8',  // warm rose
] as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

const serif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

const sans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

export const typography = {
  serif,
  sans,
  display: {
    fontFamily: serif,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
    color: colors.text,
  },
  title: {
    fontFamily: serif,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700' as const,
    color: colors.text,
  },
  heading: {
    fontFamily: serif,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  // Large bold number used inside hex cards
  number: {
    fontFamily: sans,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800' as const,
    color: colors.text,
  },
  body: {
    fontFamily: sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    color: colors.textMuted,
  },
  bodyStrong: {
    fontFamily: sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    color: colors.text,
  },
  caption: {
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    color: colors.textFaint,
  },
  label: {
    fontFamily: sans,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    color: colors.textFaint,
  },
} as const;

export const shadows = {
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 3,
  },
  raised: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export const theme = { colors, habitPalette, spacing, radii, typography, shadows } as const;
export type Theme = typeof theme;
export default theme;
