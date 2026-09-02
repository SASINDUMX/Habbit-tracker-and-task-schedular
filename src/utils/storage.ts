import { Habit, HabitLog, Task, Goal, Reminder, Category, UserSettings, FocusSession } from '../types';
import { getInitialPresets, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './presets';
import { getTodayString } from './dateUtils';
import { format } from 'date-fns';

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

const DB_NAME = 'orbit_os_db';
const DB_VERSION = 1;
const STORE_NAME = 'orbit_store';

// Initialize native IndexedDB
function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Mirror writes asynchronously to IndexedDB
function mirrorToIndexedDB(key: string, value: unknown): void {
  openIndexedDB().then((db) => {
    if (!db) return;
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
    } catch (err) {
      console.warn(`IndexedDB mirror write failed for [${key}]:`, err);
    }
  });
}

export function loadInitialData() {
  const presets = getInitialPresets();

  const habits: Habit[] = getItem(KEYS.HABITS, presets.habits);
  const rawLogs: HabitLog[] = getItem(KEYS.LOGS, []);

  // Seed sample logs if brand new user for realistic heatmaps
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

  // Generate realistic past 14 days activity using local date strings
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = format(d, 'yyyy-MM-dd');

    habits.forEach((h) => {
      const completed = Math.random() > 0.25;
      if (completed) {
        logs.push({
          id: `log-${h.id}-${dateStr}`,
          habitId: h.id,
          date: dateStr,
          completed: true,
          value: h.type === 'number' ? h.targetValue || 1 : h.type === 'timer' ? h.targetValue || 30 : 1,
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
    console.warn(`LocalStorage quota exceeded or write failed for [${key}]:`, err);
  }
  // Also mirror to IndexedDB in background
  mirrorToIndexedDB(key, value);
}

export function exportBackupJSON(data: Record<string, unknown>): string {
  const exportPayload = {
    app: 'Orbit Life OS',
    version: '1.1.0',
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
