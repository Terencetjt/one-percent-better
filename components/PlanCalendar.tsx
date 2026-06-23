import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { DatePromise } from '../storage/types';
import { buildMonthMatrix, monthName, todayISO, WEEKDAY_LABELS } from '../lib/date';

interface PlanCalendarProps {
  year: number;
  month: number;
  datePlans: Record<string, DatePromise[]>;
  selectedDate: string;
  onSelectDay: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function PlanCalendar({
  year, month, datePlans, selectedDate, onSelectDay, onPrevMonth, onNextMonth,
}: PlanCalendarProps) {
  const weeks = useMemo(() => buildMonthMatrix(year, month), [year, month]);
  const today = todayISO();

  return (
    <View style={styles.wrap}>
      {/* Month navigation */}
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} style={styles.navBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={18} color="#5C67EE" />
        </Pressable>
        <Text style={styles.monthLabel}>{monthName(month)} {year}</Text>
        <Pressable onPress={onNextMonth} style={styles.navBtn} hitSlop={10}>
          <Ionicons name="chevron-forward" size={18} color="#5C67EE" />
        </Pressable>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((d, i) => (
          <View key={i} style={styles.cell}>
            <Text style={styles.weekLabel}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((date, di) => {
            if (!date) return <View key={di} style={styles.cell} />;
            const isToday = date === today;
            const isSelected = date === selectedDate;
            const hasPlans = (datePlans[date]?.length ?? 0) > 0;
            const dayNum = Number(date.slice(8, 10));

            return (
              <Pressable
                key={di}
                style={styles.cell}
                onPress={() => onSelectDay(date)}
              >
                <View style={[
                  styles.day,
                  isSelected && styles.daySelected,
                  isToday && !isSelected && styles.dayToday,
                ]}>
                  <Text style={[
                    styles.dayNum,
                    isSelected && styles.dayNumSelected,
                    isToday && !isSelected && styles.dayNumToday,
                  ]}>
                    {dayNum}
                  </Text>
                </View>
                {hasPlans && !isSelected && (
                  <View style={styles.dot} />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EEF0FD',
    alignItems: 'center', justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 17, fontWeight: '700', color: '#1A1A2E',
  },
  weekRow: { flexDirection: 'row' },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 3,
    gap: 3,
  },
  weekLabel: {
    fontSize: 11, fontWeight: '700',
    color: '#9A9AB0', letterSpacing: 0.5,
    textAlign: 'center',
    paddingVertical: 6,
  },
  day: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  daySelected: { backgroundColor: '#5C67EE' },
  dayToday: { borderWidth: 2, borderColor: '#5C67EE' },
  dayNum: { fontSize: 14, fontWeight: '500', color: '#1A1A2E' },
  dayNumSelected: { color: '#FFFFFF', fontWeight: '700' },
  dayNumToday: { color: '#5C67EE', fontWeight: '700' },
  dot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#2EC4C4',
  },
});
