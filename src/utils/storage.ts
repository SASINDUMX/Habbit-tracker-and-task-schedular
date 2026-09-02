import { Habit, HabitLog, Task, Goal, Reminder, Category, UserSettings, FocusSession } from '../types';
import { getInitialPresets, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './presets';
import { getTodayString } from './dateUtils';

const KEYS = {
  HABITS: 'orbit_habits_v1',
  LOGS: 'orbit_habit_logs_v1',
  TASKS: 'orbit_tasks_v1',
  GOALS: 'orbit_goals_v1',
  REMINDERS: 'orbit_reminders_v1',
  CATEGORIES: 'orbit_categories_v1',
  SETTINGS: 'orbit_settings_v1',
  FOCUS: 'orbit_focus_sessions_v1',
};

export function loadInitialData() {
  const presets = getInitialPresets();

  const habits: Habit[] = getItem(KEYS.HABITS, presets.habits);
  const rawLogs: HabitLog[] = getItem(KEYS.LOGS, []);
  
  // Seed sample logs if new user for nice visual demonstration
  let logs = rawLogs;
  if (logs.length === 0) {
    logs = generateSeedLogs(habits);
    saveItem(KEYS.LOGS, logs);
  }

  const tasks: Task[] = getItem(KEYS.TASKS, presets.tasks);
  const goals: Goal[] = getItem(KEYS.GOALS, presets.goals);
  const reminders: Reminder[] = getItem(KEYS.REMINDERS, presets.reminders);
  const categories: Category[] = getItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  const settings: UserSettings = getItem(KEYS.SETTINGS, DEFAULT_SETTINGS);
  const focusSessions: FocusSession[] = getItem(KEYS.FOCUS, []);

  return { habits, logs, tasks, goals, reminders, categories, settings, focusSessions };
}

function generateSeedLogs(habits: Habit[]): HabitLog[] {
  const logs: HabitLog[] = [];
  const today = new Date();
  
  // Generate realistic past 14 days activity
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    habits.forEach(h => {
      // 80% completion chance for demo
      const completed = Math.random() > 0.25;
      if (completed) {
        logs.push({
          id: `log-${h.id}-${dateStr}`,
          habitId: h.id,
          date: dateStr,
          completed: true,
          value: h.type === 'number' ? (h.targetValue || 1) : (h.type === 'timer' ? (h.targetValue || 30) : 1),
          loggedAt: new Date(d.setHours(9, 0, 0, 0)).toISOString(),
        });
      }
    });
  }
  return logs;
}

export function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving to localStorage [${key}]:`, err);
  }
}

export function exportBackupJSON(data: Record<string, unknown>): string {
  const exportPayload = {
    app: 'Orbit Life OS',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function downloadBackupFile(data: Record<string, unknown>) {
  const jsonStr = exportBackupJSON(data);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orbit-life-os-backup-${getTodayString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { KEYS };
