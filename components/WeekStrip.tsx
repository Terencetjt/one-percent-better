import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getWeekDates(): Date[] {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface WeekStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function WeekStrip({ selectedDate, onSelectDate }: WeekStripProps) {
  const today = toISO(new Date());
  const weekDates = getWeekDates();

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {weekDates.map((date, idx) => {
          const iso = toISO(date);
          const isSelected = iso === selectedDate;
          const isToday = iso === today;
          const isFuture = iso > today;

          return (
            <Pressable
              key={iso}
              onPress={() => !isFuture && onSelectDate(iso)}
              style={styles.dayCol}
            >
              <Text style={[styles.label, isFuture && styles.faint]}>
                {DAY_LABELS[idx]}
              </Text>
              <View style={[
                styles.circle,
                isSelected && styles.circleSelected,
                isToday && !isSelected && styles.circleToday,
              ]}>
                <Text style={[
                  styles.num,
                  isSelected && styles.numSelected,
                  isFuture && !isSelected && styles.faint,
                ]}>
                  {date.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    gap: 4,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A8A9A',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
  },
  circleSelected: {
    backgroundColor: '#5C67EE',
    borderColor: '#5C67EE',
  },
  circleToday: {
    borderColor: '#5C67EE',
    borderWidth: 2,
  },
  num: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  numSelected: {
    color: '#FFFFFF',
  },
  faint: {
    color: '#C8C8D8',
  },
});
