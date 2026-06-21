import React, { useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { HexGrid } from '../../components/HexGrid';
import { StreakBadge } from '../../components/StreakBadge';
import { SectionLabel } from '../../components/SectionLabel';
import { EmptyState } from '../../components/EmptyState';
import { Card } from '../../components/Card';
import { useStore } from '../../storage/store';
import { currentStreak, completedCount } from '../../lib/stats';
import { prettyLong, todayISO } from '../../lib/date';
import { colors, radii, spacing, typography } from '../../theme/tokens';

function greeting(name: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name} ☀️`;
  if (h < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name} 🌙`;
}

export default function TodayScreen() {
  const { habits, entries, getEntry, toggleHabit, setLearning, userProfile } = useStore();
  const today = todayISO();
  const entry = getEntry(today);

  const streak = useMemo(() => currentStreak(entries), [entries]);
  const done = completedCount(entry, habits);
  const allDone = habits.length > 0 && done === habits.length;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="label">{prettyLong(today).toUpperCase()}</Text>
        {userProfile ? (
          <Text variant="display">{greeting(userProfile.name)}</Text>
        ) : (
          <Text variant="display">Today</Text>
        )}
      </View>

      <StreakBadge streak={streak} />

      {/* Habits */}
      <View>
        <SectionLabel
          trailing={habits.length > 0
            ? <Text variant="caption">{done}/{habits.length} done</Text>
            : undefined}
        >
          Your tracks
        </SectionLabel>

        {habits.length === 0 ? (
          <Card>
            <EmptyState
              icon="leaf-outline"
              title="No tracks yet"
              message="Head to the Tracks tab to add the first habit you want to grow."
            />
          </Card>
        ) : (
          <HexGrid
            habits={habits}
            entry={entry}
            entries={entries}
            onToggle={(habitId) => toggleHabit(today, habitId)}
          />
        )}

        {allDone ? (
          <Animated.View entering={FadeIn.duration(400)} style={styles.celebrate}>
            <Text style={styles.celebrateEmoji}>✨</Text>
            <Text variant="bodyStrong" color={colors.accentDeep}>
              Every track complete — that's today's 1%.
            </Text>
          </Animated.View>
        ) : null}
      </View>

      {/* Learning */}
      <View>
        <SectionLabel>Today's learning</SectionLabel>
        <View style={styles.learningCard}>
          <View style={styles.learningHeader}>
            <Ionicons name="pencil-outline" size={16} color={colors.onDark} />
            <Text variant="bodyStrong" color={colors.onDark} style={styles.flex}>
              What's one thing you learned today?
            </Text>
          </View>
          <TextInput
            value={entry.learning}
            onChangeText={(text) => setLearning(today, text)}
            placeholder="A small insight, a reflection, a noticing…"
            placeholderTextColor="rgba(250,250,247,0.4)"
            multiline
            style={styles.input}
            textAlignVertical="top"
          />
          <View style={styles.autosave}>
            <Ionicons name="cloud-done-outline" size={13} color="rgba(250,250,247,0.5)" />
            <Text style={styles.autosaveText}>Saved automatically</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  celebrate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  celebrateEmoji: { fontSize: 18 },
  flex: { flex: 1 },
  learningCard: {
    backgroundColor: colors.dark,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  learningHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    minHeight: 100,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.onDark,
    backgroundColor: colors.darkMuted,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  autosave: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  autosaveText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    color: 'rgba(250,250,247,0.45)',
  },
});
