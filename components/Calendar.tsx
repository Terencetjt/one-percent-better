import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';
import { DailyEntry, Habit } from '../storage/types';
import { buildMonthMatrix, monthName, todayISO, WEEKDAY_LABELS } from '../lib/date';
import { Text } from './Text';

interface CalendarProps {
  year: number;
  month: number;
  entries: Record<string, DailyEntry>;
  habits: Habit[];
  selectedDate: string | null;
  onSelectDay: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

type DayStatus = 'none' | 'partial' | 'full';

function statusFor(entry: DailyEntry | undefined, habitCount: number): DayStatus {
  if (!entry || habitCount === 0) return 'none';
  const done = Object.values(entry.habitCompletions).filter(Boolean).length;
  if (done === 0) return 'none';
  return done >= habitCount ? 'full' : 'partial';
}

export function Calendar({
  year, month, entries, habits, selectedDate, onSelectDay, onPrevMonth, onNextMonth,
}: CalendarProps) {
  const weeks = useMemo(() => buildMonthMatrix(year, month), [year, month]);
  const today = todayISO();

  return (
    <View>
      {/* Month navigation */}
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Previous month"
          accessibilityRole="button"
          onPress={onPrevMonth}
          hitSlop={10}
          style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.onDark} />
        </Pressable>
        <Text variant="heading" color={colors.text}>
          {monthName(month)} {year}
        </Text>
        <Pressable
          accessibilityLabel="Next month"
          accessibilityRole="button"
          onPress={onNextMonth}
          hitSlop={10}
          style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.onDark} />
        </Pressable>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((d, i) => (
          <View key={i} style={styles.cell}>
            <Text variant="label" align="center">{d}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((date, di) => {
            if (!date) return <View key={di} style={styles.cell} />;
            const status = statusFor(entries[date], habits.length);
            const isToday = date === today;
            const isSelected = date === selectedDate;
            const isFuture = date > today;
            const dayNum = Number(date.slice(8, 10));

            return (
              <View key={di} style={styles.cell}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onSelectDay(date)}
                  disabled={isFuture}
                  style={({ pressed }) => [
                    styles.day,
                    status === 'full' && styles.dayFull,
                    status === 'partial' && styles.dayPartial,
                    isSelected && styles.daySelected,
                    isToday && status === 'none' && styles.dayToday,
                    isFuture && styles.dayFuture,
                    pressed && !isFuture && styles.dayPressed,
                  ]}
                >
                  <Text
                    variant="bodyStrong"
                    color={
                      status === 'full'
                        ? colors.dark
                        : isFuture
                        ? colors.textFaint
                        : colors.text
                    }
                  >
                    {dayNum}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem swatch={<View style={[styles.dot, styles.dayFull]} />} label="All done" />
        <LegendItem swatch={<View style={[styles.dot, styles.dayPartial]} />} label="Partial" />
        <LegendItem swatch={<View style={[styles.dot, styles.dayToday]} />} label="Today" />
      </View>
    </View>
  );
}

function LegendItem({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <View style={styles.legendItem}>
      {swatch}
      <Text variant="caption">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  weekRow: { flexDirection: 'row' },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  day: {
    width: '88%',
    aspectRatio: 1,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayFull: { backgroundColor: colors.accent },
  dayPartial: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  dayToday: {
    borderWidth: 2,
    borderColor: colors.dark,
    borderStyle: 'dashed',
  },
  daySelected: {
    borderWidth: 2.5,
    borderColor: colors.danger,
  },
  dayFuture: { opacity: 0.35 },
  dayPressed: { opacity: 0.65 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: radii.pill,
  },
});
