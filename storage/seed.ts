import { AppData, Habit } from './types';

export function createSeedData(): AppData {
  const habits: Habit[] = [
    { id: 'seed-move', name: 'Move my body', icon: 'walk-outline', color: '#F5C540', createdAt: new Date().toISOString() },
    { id: 'seed-read', name: 'Read 10 pages', icon: 'book-outline', color: '#7ECDC4', createdAt: new Date().toISOString() },
    { id: 'seed-water', name: 'Drink water', icon: 'water-outline', color: '#E8857A', createdAt: new Date().toISOString() },
  ];

  return {
    habits,
    entries: {},   // fresh start — Day 1
    favorites: [],
    userProfile: null,
  };
}
