import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Calendar } from '../../components/Calendar';
import { StatsStrip } from '../../components/StatsStrip';
import { SectionLabel } from '../../components/SectionLabel';
import { EmptyState } from '../../components/EmptyState';
import { useStore, useAppData } from '../../storage/store';
import { completionRate, currentStreak, totalLearnings, completedCount } from '../../lib/stats';
import { fromISODate, prettyMedium, todayISO } from '../../lib/date';
import { colors, radii, spacing } from '../../theme/tokens';

export default function DashboardScreen() {
  const { habits, entries, getEntry, toggleFavorite, isFavorite, favorites } = useStore();
  const data = useAppData();
  const today = todayISO();
  const todayDate = fromISODate(today);

  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const stats = useMemo(() => ({
    streak: currentStreak(entries),
    rate: completionRate(data),
    learnings: totalLearnings(entries),
  }), [entries, data]);

  const goPrev = () =>
    setViewMonth((m) => { if (m === 0) { setViewYear((y) => y - 1); return 11; } return m - 1; });
  const goNext = () =>
    setViewMonth((m) => { if (m === 11) { setViewYear((y) => y + 1); return 0; } return m + 1; });

  const selectedEntry = getEntry(selectedDate);
  const selectedDone = completedCount(selectedEntry, habits);

  const topLearnings = useMemo(
    () =>
      favorites
        .map((date) => entries[date])
        .filter((e): e is NonNullable<typeof e> => !!e && e.learning.trim().length > 0)
        .slice(0, 5),
    [favorites, entries],
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="label">YOUR PROGRESS</Text>
        <Text variant="display">Dashboard</Text>
      </View>

      <StatsStrip
        stats={[
          { label: 'Streak', value: `${stats.streak}d` },
          { label: 'Completion', value: `${stats.rate}%` },
          { label: 'Learnings', value: `${stats.learnings}` },
        ]}
      />

      <Card>
        <Calendar
          year={viewYear}
          month={viewMonth}
          entries={entries}
          habits={habits}
          selectedDate={selectedDate}
          onSelectDay={setSelectedDate}
          onPrevMonth={goPrev}
          onNextMonth={goNext}
        />
      </Card>

      {/* Selected day detail */}
      <Animated.View key={selectedDate} entering={FadeIn.duration(280)}>
        <Card>
          <View style={styles.detailHeader}>
            <View style={styles.flex}>
              <Text variant="label">{selectedDate === today ? 'TODAY' : 'SELECTED DAY'}</Text>
              <Text variant="heading">{prettyMedium(selectedDate)}</Text>
            </View>
            <Pressable
              accessibilityLabel={isFavorite(selectedDate) ? 'Remove from Top 5' : 'Add to Top 5'}
              accessibilityRole="button"
              onPress={() => toggleFavorite(selectedDate)}
              hitSlop={8}
              disabled={selectedEntry.learning.trim().length === 0}
              style={({ pressed }) => [
                styles.star,
                pressed && { opacity: 0.6 },
                selectedEntry.learning.trim().length === 0 && { opacity: 0.3 },
              ]}
            >
              <Ionicons
                name={isFavorite(selectedDate) ? 'star' : 'star-outline'}
                size={22}
                color={isFavorite(selectedDate) ? colors.accent : colors.textFaint}
              />
            </Pressable>
          </View>

          <View style={styles.dayMeta}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.accent} />
            <Text variant="caption">
              {habits.length > 0
                ? `${selectedDone} of ${habits.length} tracks completed`
                : 'No tracks to complete'}
            </Text>
          </View>

          {selectedEntry.learning.trim().length > 0 ? (
            <View style={styles.learningWell}>
              <Text variant="body" color={colors.text}>"{selectedEntry.learning}"</Text>
            </View>
          ) : (
            <Text variant="body" color={colors.textFaint} style={styles.noLearning}>
              No learning recorded for this day.
            </Text>
          )}
        </Card>
      </Animated.View>

      {/* Top 5 Learnings */}
      <View>
        <SectionLabel>Top 5 Learnings</SectionLabel>
        {topLearnings.length === 0 ? (
          <Card>
            <EmptyState
              icon="star-outline"
              title="Curate your favorites"
              message="Tap a day on the calendar, then the star, to pin its learning here."
            />
          </Card>
        ) : (
          <View style={styles.topList}>
            {topLearnings.map((e, i) => (
              <Animated.View key={e.date} layout={Layout.springify()}>
                <Card style={styles.topCard}>
                  <View style={styles.rank}>
                    <Text variant="bodyStrong" color={colors.dark}>{i + 1}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text variant="body" color={colors.text}>"{e.learning}"</Text>
                    <Text variant="caption" style={styles.topDate}>{prettyMedium(e.date)}</Text>
                  </View>
                  <Pressable
                    accessibilityLabel="Remove from Top 5"
                    accessibilityRole="button"
                    onPress={() => toggleFavorite(e.date)}
                    hitSlop={8}
                    style={({ pressed }) => pressed && { opacity: 0.6 }}
                  >
                    <Ionicons name="star" size={18} color={colors.accent} />
                  </Pressable>
                </Card>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  flex: { flex: 1 },
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  star: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  learningWell: {
    marginTop: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  noLearning: { marginTop: spacing.md, fontStyle: 'italic' },
  topList: { gap: spacing.sm },
  topCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rank: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topDate: { marginTop: spacing.xs },
});
