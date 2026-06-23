import { AppData, Habit } from './types';

export function createSeedData(): AppData {
  const habits: Habit[] = [
    { id: 'seed-move', name: 'Move my body', icon: 'walk-outline', color: '#7ECDC4', createdAt: new Date().toISOString() },
    { id: 'seed-read', name: 'Read 10 pages', icon: 'book-outline', color: '#A47AD4', createdAt: new Date().toISOString() },
    { id: 'seed-water', name: 'Drink water', icon: 'water-outline', color: '#7EB3D4', createdAt: new Date().toISOString() },
  ];

  return {
    habits,
    entries: {},
    favorites: [],
    userProfile: null,
    partnerTasks: [],
    partnerProfile: null,
  };
}
