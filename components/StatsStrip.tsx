import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { Text } from './Text';

interface Stat { label: string; value: string }

export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <View style={styles.strip}>
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.cell}>
            <Text style={styles.value}>{s.value}</Text>
            <Text variant="label">{s.label.toUpperCase()}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: undefined,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.accent,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: spacing.xs,
    backgroundColor: colors.darkMuted,
  },
});
