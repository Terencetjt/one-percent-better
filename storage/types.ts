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
  reminderTime: string;
  reminderEnabled: boolean;
  createdAt: string;
}

export interface PartnerTask {
  id: string;
  name: string;
  difficulty: number;  // 1–5
  completed: boolean;
  pendingReview: boolean;
  assignedByMe: boolean; // true = I assigned to partner; false = partner assigned to me
  createdAt: string;
}

export interface PartnerProfile {
  myCode: string;
  partnerName: string | null;
  coins: number;
}

export interface AppData {
  habits: Habit[];
  entries: Record<string, DailyEntry>;
  favorites: string[];
  userProfile: UserProfile | null;
  partnerTasks: PartnerTask[];
  partnerProfile: PartnerProfile | null;
}
