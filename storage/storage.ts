import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from './types';
import { createSeedData } from './seed';

const STORAGE_KEY = 'one-percent-better/v1';

/**
 * Thin persistence layer over AsyncStorage. On web, AsyncStorage is backed by
 * localStorage, so the same code path keeps data across reloads everywhere.
 */
export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createSeedData();
      await saveData(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    // Defensive defaults in case the stored shape predates a field.
    return {
      habits: parsed.habits ?? [],
      entries: parsed.entries ?? {},
      favorites: parsed.favorites ?? [],
      userProfile: parsed.userProfile ?? null,
    };
  } catch (err) {
    // If storage is corrupt or unavailable, fall back to a fresh seed rather
    // than crashing the app.
    console.warn('Failed to load data, reseeding:', err);
    return createSeedData();
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save data:', err);
  }
}

export async function clearData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear data:', err);
  }
}
