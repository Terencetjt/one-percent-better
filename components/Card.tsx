import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme/tokens';

interface CardProps extends ViewProps {
  inset?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function Card({ inset, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[styles.base, inset ? styles.inset : styles.raised, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  raised: {
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  inset: {
    backgroundColor: colors.surfaceAlt,
  },
});
