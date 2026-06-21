import { AppData, DailyEntry, Habit } from '../storage/types';
import { addDaysISO, todayISO } from './date';

function dayHasProgress(entry: DailyEntry | undefined): boolean {
  if (!entry) return false;
  return Object.values(entry.habitCompletions).some(Boolean);
}

export function currentStreak(entries: Record<string, DailyEntry>): number {
  const today = todayISO();
  let cursor = today;
  if (!dayHasProgress(entries[today])) {
    cursor = addDaysISO(today, -1);
  }
  let streak = 0;
  while (dayHasProgress(entries[cursor])) {
    streak += 1;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

/** Consecutive-day streak for a single habit. */
export function habitStreak(
  habitId: string,
  entries: Record<string, DailyEntry>,
): number {
  const today = todayISO();
  let cursor = today;
  if (!entries[today]?.habitCompletions[habitId]) {
    cursor = addDaysISO(today, -1);
  }
  let streak = 0;
  while (entries[cursor]?.habitCompletions[habitId]) {
    streak += 1;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

export function completionRate(data: AppData, windowDays = 30): number {
  const { habits, entries } = data;
  if (habits.length === 0) return 0;
  const today = todayISO();
  let completed = 0;
  let possible = 0;
  for (let i = 0; i < windowDays; i++) {
    const date = addDaysISO(today, -i);
    const entry = entries[date];
    for (const habit of habits) {
      if (habit.createdAt.slice(0, 10) > date) continue;
      possible += 1;
      if (entry?.habitCompletions[habit.id]) completed += 1;
    }
  }
  if (possible === 0) return 0;
  return Math.round((completed / possible) * 100);
}

export function totalLearnings(entries: Record<string, DailyEntry>): number {
  return Object.values(entries).filter((e) => e.learning.trim().length > 0).length;
}

export function completedCount(
  entry: DailyEntry | undefined,
  habits: Habit[],
): number {
  if (!entry) return 0;
  return habits.reduce((n, h) => n + (entry.habitCompletions[h.id] ? 1 : 0), 0);
}
