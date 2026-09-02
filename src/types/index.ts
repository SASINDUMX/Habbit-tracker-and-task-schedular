export type HabitType = 'boolean' | 'number' | 'timer';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type SoundType = 'bell' | 'zen' | 'synth' | 'energetic' | 'radar' | 'gentle';
export type AmbientSoundType = 'none' | 'whitenoise' | 'rain' | 'binaural' | 'zen_drone' | 'cafe';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface FrequencyConfig {
  type: 'daily' | 'weekly' | 'specific_days' | 'interval';
  days?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  targetPerWeek?: number;
  intervalDays?: number;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: string;
  color: string;
  icon: string;
  type: HabitType;
  targetValue?: number;
  unit?: string;
  frequency: FrequencyConfig;
  timeOfDay: TimeOfDay;
  reminderTime?: string; // "08:30"
  goalId?: string;
  createdAt: string;
  archived?: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value?: number;
  notes?: string;
  loggedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: PriorityLevel;
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm e.g. "09:00"
  endTime?: string; // HH:mm e.g. "10:30"
  durationMinutes?: number;
  subtasks: Subtask[];
  goalId?: string;
  habitId?: string;
  reminderTime?: string;
  isAlarmEnabled?: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  color: string;
  icon: string;
  targetDate?: string;
  status: 'active' | 'completed' | 'paused';
  milestones: Milestone[];
  linkedHabitIds?: string[];
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  type: 'alarm' | 'reminder' | 'habit_ping' | 'task_alert';
  time: string; // HH:mm or ISO date
  date?: string; // YYYY-MM-DD
  recurring?: {
    type: 'daily' | 'interval' | 'specific_days';
    intervalMinutes?: number;
    days?: number[];
  };
  sound: SoundType;
  enabled: boolean;
  sourceId?: string; // Habit ID or Task ID
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  habitId?: string;
  durationMinutes: number;
  completed: boolean;
  timestamp: string;
  mode: 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch';
}

export type ThemeMode = 
  | 'oled'
  | 'dark'
  | 'cyberpunk'
  | 'emerald'
  | 'sunset'
  | 'retro'
  | 'light'
  | 'synthwave';

export interface UserSettings {
  theme: ThemeMode;
  soundEnabled: boolean;
  alarmVolume: number; // 0.0 to 1.0
  defaultAlarmSound: SoundType;
  notificationsEnabled: boolean;
  weekStartsOnMonday: boolean;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  ambientSound: AmbientSoundType;
  ambientVolume: number;
}
