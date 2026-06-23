import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { AppData, DailyEntry, Habit, PartnerProfile, PartnerTask, UserProfile } from './types';
import { loadData, saveData } from './storage';
import { todayISO, uid } from '../lib/date';
import { scheduleDailyReminder, cancelAllReminders, configureForegroundHandler } from '../lib/notifications';

interface StoreContextValue {
  ready: boolean;
  habits: Habit[];
  entries: Record<string, DailyEntry>;
  favorites: string[];
  userProfile: UserProfile | null;
  partnerTasks: PartnerTask[];
  partnerProfile: PartnerProfile | null;

  getEntry: (date: string) => DailyEntry;
  toggleHabit: (date: string, habitId: string) => void;
  setLearning: (date: string, learning: string) => void;
  addHabit: (input: { name: string; icon: string; color: string; owner: 'me' | 'partner' }) => void;
  updateHabit: (id: string, patch: Partial<Pick<Habit, 'name' | 'icon' | 'color'>>) => void;
  removeHabit: (id: string) => void;
  toggleFavorite: (date: string) => void;
  isFavorite: (date: string) => boolean;

  setUserProfile: (profile: UserProfile) => void;
  updateReminderSettings: (enabled: boolean, time: string) => void;

  addPartnerTask: (name: string, difficulty: number, assignedByMe: boolean) => void;
  completePartnerTask: (id: string) => void;
  setPendingReview: (id: string, pending: boolean) => void;
  removePartnerTask: (id: string) => void;
  setPartnerProfile: (profile: PartnerProfile) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);
const EMPTY_DATA: AppData = {
  habits: [], entries: {}, favorites: [], userProfile: null,
  partnerTasks: [], partnerProfile: null,
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    configureForegroundHandler();
    let mounted = true;
    loadData().then((loaded) => {
      if (mounted) { setData(loaded); setReady(true); }
    });
    return () => { mounted = false; };
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveData(data), 250);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [data, ready]);

  const getEntry = useCallback(
    (date: string): DailyEntry =>
      data.entries[date] ?? { id: `pending-${date}`, date, habitCompletions: {}, learning: '' },
    [data.entries],
  );

  const withEntry = (entries: Record<string, DailyEntry>, date: string) => {
    if (entries[date]) return entries;
    return { ...entries, [date]: { id: uid(), date, habitCompletions: {}, learning: '' } };
  };

  const toggleHabit = useCallback((date: string, habitId: string) => {
    setData((prev) => {
      const entries = withEntry(prev.entries, date);
      const entry = entries[date];
      return {
        ...prev,
        entries: {
          ...entries,
          [date]: { ...entry, habitCompletions: { ...entry.habitCompletions, [habitId]: !entry.habitCompletions[habitId] } },
        },
      };
    });
  }, []);

  const setLearning = useCallback((date: string, learning: string) => {
    setData((prev) => {
      const entries = withEntry(prev.entries, date);
      const entry = entries[date];
      return { ...prev, entries: { ...entries, [date]: { ...entry, learning } } };
    });
  }, []);

  const addHabit = useCallback((input: { name: string; icon: string; color: string; owner: 'me' | 'partner' }) => {
    setData((prev) => ({
      ...prev,
      habits: [...prev.habits, { id: uid(), name: input.name.trim(), icon: input.icon, color: input.color, owner: input.owner, createdAt: new Date().toISOString() }],
    }));
  }, []);

  const updateHabit = useCallback((id: string, patch: Partial<Pick<Habit, 'name' | 'icon' | 'color'>>) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => h.id === id ? { ...h, ...patch, name: patch.name?.trim() ?? h.name } : h),
    }));
  }, []);

  const removeHabit = useCallback((id: string) => {
    setData((prev) => {
      const entries: Record<string, DailyEntry> = {};
      for (const [date, entry] of Object.entries(prev.entries)) {
        const { [id]: _removed, ...rest } = entry.habitCompletions;
        entries[date] = { ...entry, habitCompletions: rest };
      }
      return { ...prev, habits: prev.habits.filter((h) => h.id !== id), entries };
    });
  }, []);

  const toggleFavorite = useCallback((date: string) => {
    setData((prev) => {
      const has = prev.favorites.includes(date);
      return { ...prev, favorites: has ? prev.favorites.filter((d) => d !== date) : [date, ...prev.favorites] };
    });
  }, []);

  const isFavorite = useCallback((date: string) => data.favorites.includes(date), [data.favorites]);

  const setUserProfile = useCallback((profile: UserProfile) => {
    setData((prev) => ({ ...prev, userProfile: profile }));
    if (profile.reminderEnabled) {
      scheduleDailyReminder(profile.name, profile.reminderTime);
    }
  }, []);

  const updateReminderSettings = useCallback((enabled: boolean, time: string) => {
    setData((prev) => {
      if (!prev.userProfile) return prev;
      const userProfile: UserProfile = { ...prev.userProfile, reminderEnabled: enabled, reminderTime: time };
      if (enabled) { scheduleDailyReminder(userProfile.name, time); } else { cancelAllReminders(); }
      return { ...prev, userProfile };
    });
  }, []);

  const addPartnerTask = useCallback((name: string, difficulty: number, assignedByMe: boolean) => {
    setData((prev) => ({
      ...prev,
      partnerTasks: [
        ...prev.partnerTasks,
        { id: uid(), name: name.trim(), difficulty, completed: false, pendingReview: false, assignedByMe, createdAt: new Date().toISOString() },
      ],
    }));
  }, []);

  const completePartnerTask = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      partnerTasks: prev.partnerTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, pendingReview: false } : t),
    }));
  }, []);

  const setPendingReview = useCallback((id: string, pending: boolean) => {
    setData((prev) => ({
      ...prev,
      partnerTasks: prev.partnerTasks.map((t) => t.id === id ? { ...t, pendingReview: pending } : t),
    }));
  }, []);

  const removePartnerTask = useCallback((id: string) => {
    setData((prev) => ({ ...prev, partnerTasks: prev.partnerTasks.filter((t) => t.id !== id) }));
  }, []);

  const setPartnerProfile = useCallback((profile: PartnerProfile) => {
    setData((prev) => ({ ...prev, partnerProfile: profile }));
  }, []);

  const value = useMemo<StoreContextValue>(() => ({
    ready, habits: data.habits, entries: data.entries, favorites: data.favorites,
    userProfile: data.userProfile, partnerTasks: data.partnerTasks, partnerProfile: data.partnerProfile,
    getEntry, toggleHabit, setLearning, addHabit, updateHabit, removeHabit,
    toggleFavorite, isFavorite, setUserProfile, updateReminderSettings,
    addPartnerTask, completePartnerTask, setPendingReview, removePartnerTask, setPartnerProfile,
  }), [
    ready, data.habits, data.entries, data.favorites, data.userProfile,
    data.partnerTasks, data.partnerProfile,
    getEntry, toggleHabit, setLearning, addHabit, updateHabit, removeHabit,
    toggleFavorite, isFavorite, setUserProfile, updateReminderSettings,
    addPartnerTask, completePartnerTask, setPendingReview, removePartnerTask, setPartnerProfile,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}

export function useAppData(): AppData {
  const { habits, entries, favorites, userProfile, partnerTasks, partnerProfile } = useStore();
  return { habits, entries, favorites, userProfile, partnerTasks, partnerProfile };
}
