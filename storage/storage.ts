import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { AppData } from './types';
import { createSeedData } from './seed';

const STORAGE_KEY = 'one-percent-better/v2';
const DEVICE_ID_KEY = 'one-percent-better/device-id';

async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function parseLocal(raw: string): AppData {
  const parsed = JSON.parse(raw) as Partial<AppData>;
  return {
    habits: parsed.habits ?? [],
    entries: parsed.entries ?? {},
    favorites: parsed.favorites ?? [],
    userProfile: parsed.userProfile ?? null,
  };
}

async function loadLocal(): Promise<AppData | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? parseLocal(raw) : null;
  } catch {
    return null;
  }
}

async function saveLocal(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Local save failed:', err);
  }
}

async function loadCloud(deviceId: string): Promise<AppData | null> {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('habits, entries, favorites, user_profile')
      .eq('device_id', deviceId)
      .single();

    if (error || !data) return null;

    return {
      habits: (data.habits as AppData['habits']) ?? [],
      entries: (data.entries as AppData['entries']) ?? {},
      favorites: (data.favorites as AppData['favorites']) ?? [],
      userProfile: (data.user_profile as AppData['userProfile']) ?? null,
    };
  } catch {
    return null;
  }
}

async function saveCloud(deviceId: string, data: AppData): Promise<void> {
  try {
    await supabase.from('app_data').upsert({
      device_id: deviceId,
      habits: data.habits,
      entries: data.entries,
      favorites: data.favorites,
      user_profile: data.userProfile,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Cloud sync failed:', err);
  }
}

export async function loadData(): Promise<AppData> {
  const deviceId = await getDeviceId();

  // Fast path: use local cache if it exists
  const local = await loadLocal();
  if (local) return local;

  // No local data (fresh install / cleared storage) — try to restore from cloud
  const cloud = await loadCloud(deviceId);
  if (cloud) {
    await saveLocal(cloud);
    return cloud;
  }

  // Brand new user — seed and persist
  const seeded = createSeedData();
  await saveLocal(seeded);
  saveCloud(deviceId, seeded); // fire-and-forget
  return seeded;
}

export async function saveData(data: AppData): Promise<void> {
  const deviceId = await getDeviceId();
  // Write locally first (instant), then sync to cloud in background
  await saveLocal(data);
  saveCloud(deviceId, data); // non-blocking
}

export async function clearData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear data:', err);
  }
}
