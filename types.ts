
export type MoodType = 'grateful' | 'happy' | 'calm' | 'proud' | 'loved' | 'hopeful' | 'sad' | 'anxious' | 'neutral' | string;

export interface CustomMood {
  id: string;
  label: string;
  color: string;
  iconName: string;
}

export interface DiaryEntry {
  id: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  title: string;
  content: {
    event: string;
    feeling: string; // This is now the "Mood Description"
    evidence: string; // This can be "Evidence" or "Pain" depending on context
  };
  image?: string; // Base64 string
  tags: string[];
  mood: MoodType; // Kept for legacy, but derived from score now
  moodScore: number; // 0-100
  aiResponse?: string;
  favorite?: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  userName: string;
  reminderEnabled: boolean;
  reminderTime: string;
  customMoods: CustomMood[];
  customTags: string[];
  lastBackupDate: number;
}

export interface DailyQuote {
  text: string;
  author?: string;
}

export type ViewState = 'write' | 'history' | 'stats' | 'settings';
