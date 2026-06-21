import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { Text } from './Text';

export function StreakBadge({ streak }: { streak: number }) {
  const label =
    streak <= 0
      ? 'Log today to start your streak'
      : `Day ${streak} of getting 1% better`;

  return (
    <View style={styles.badge}>
      <View style={styles.flame}>
        <Text style={styles.flameText}>🔥</Text>
      </View>
      <Text variant="bodyStrong" color={colors.dark}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  flame: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameText: {
    fontSize: 14,
    lineHeight: 18,
  },
});
