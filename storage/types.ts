export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface DailyEntry {
  id: string;
  date: string;
  habitCompletions: Record<string, boolean>;
  learning: string;
}

export interface UserProfile {
  name: string;
  /** "HH:MM" 24-hour format, e.g. "21:00". */
  reminderTime: string;
  reminderEnabled: boolean;
  createdAt: string;
}

export interface AppData {
  habits: Habit[];
  entries: Record<string, DailyEntry>;
  favorites: string[];
  userProfile: UserProfile | null;
}
