import { AppData, DailyEntry, Habit } from './types';
import { addDaysISO, todayISO, uid } from '../lib/date';

export function createSeedData(): AppData {
  const today = todayISO();

  const habits: Habit[] = [
    { id: 'seed-move', name: 'Move my body', icon: 'walk-outline', color: '#F5C540', createdAt: new Date().toISOString() },
    { id: 'seed-read', name: 'Read 10 pages', icon: 'book-outline', color: '#7ECDC4', createdAt: new Date().toISOString() },
    { id: 'seed-water', name: 'Drink water', icon: 'water-outline', color: '#E8857A', createdAt: new Date().toISOString() },
  ];

  const habitIds = habits.map((h) => h.id);
  const pastLearnings = [
    'Small steps still move the needle — I did the 10-minute version and it counted.',
    'Reading before bed settled my mind more than scrolling ever did.',
    'I notice I drink more water when the bottle is already on my desk.',
    'Consistency beats intensity. A quiet, ordinary day still added up.',
    'Starting is the hardest part; momentum took over once I began.',
    'Rest is part of the work, not a break from it.',
  ];

  const entries: Record<string, DailyEntry> = {};
  for (let i = 1; i <= 6; i++) {
    const date = addDaysISO(today, -i);
    const completions: Record<string, boolean> = {};
    habitIds.forEach((id, idx) => {
      completions[id] = !(i === 4 && idx === 2) && !(i === 6 && idx === 1);
    });
    entries[date] = { id: uid(), date, habitCompletions: completions, learning: pastLearnings[i - 1] ?? '' };
  }

  return {
    habits,
    entries,
    favorites: [addDaysISO(today, -1), addDaysISO(today, -4)],
    userProfile: null, // forces onboarding on first run
  };
}
