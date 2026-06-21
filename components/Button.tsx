import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';
import { Text } from './Text';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
}: ButtonProps) {
  const palette = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg },
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon ? (
            <Ionicons name={icon} size={18} color={palette.fg} style={styles.icon} />
          ) : null}
          <Text variant="bodyStrong" color={palette.fg}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const VARIANTS = {
  // Dark near-black pill — matches the Habithive "How are you today?" bar style
  primary: { bg: colors.dark, fg: colors.onDark },
  secondary: { bg: colors.accentSoft, fg: colors.accentDeep },
  ghost: { bg: 'transparent', fg: colors.dark },
  danger: { bg: 'transparent', fg: colors.danger },
} as const;

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.80, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
  icon: { marginRight: 2 },
});
