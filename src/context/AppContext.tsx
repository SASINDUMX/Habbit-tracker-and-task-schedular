import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Habit,
  HabitLog,
  Task,
  Goal,
  Reminder,
  Category,
  UserSettings,
  FocusSession,
} from '../types';
import { loadInitialData, saveItem, KEYS, downloadBackupFile } from '../utils/storage';
import { getTodayString } from '../utils/dateUtils';

interface AppContextType {
  // Habits
  habits: Habit[];
  logs: HabitLog[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, dateStr?: string) => void;
  incrementHabitValue: (habitId: string, delta: number, dateStr?: string) => void;
  setHabitLogValue: (habitId: string, value: number, dateStr?: string) => void;
  getHabitLogForDate: (habitId: string, dateStr: string) => HabitLog | undefined;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  addMilestone: (goalId: string, title: string, targetDate?: string) => void;

  // Reminders & Alarms
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => Reminder;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Focus
  focusSessions: FocusSession[];
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void;

  // Settings & Storage
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetToDefaults: () => void;
  importBackupData: (jsonStr: string) => boolean;
  exportData: () => void;

  // UI state
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{
  children: React.ReactNode;
  onCelebration?: () => void;
}> = ({ children, onCelebration }) => {
  const initial = loadInitialData();

  const [habits, setHabits] = useState<Habit[]>(initial.habits);
  const [logs, setLogs] = useState<HabitLog[]>(initial.logs);
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [goals, setGoals] = useState<Goal[]>(initial.goals);
  const [reminders, setReminders] = useState<Reminder[]>(initial.reminders);
  const [categories, setCategories] = useState<Category[]>(initial.categories);
  const [settings, setSettings] = useState<UserSettings>(initial.settings);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(initial.focusSessions);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Persistence hooks
  useEffect(() => saveItem(KEYS.HABITS, habits), [habits]);
  useEffect(() => saveItem(KEYS.LOGS, logs), [logs]);
  useEffect(() => saveItem(KEYS.TASKS, tasks), [tasks]);
  useEffect(() => saveItem(KEYS.GOALS, goals), [goals]);
  useEffect(() => saveItem(KEYS.REMINDERS, reminders), [reminders]);
  useEffect(() => saveItem(KEYS.CATEGORIES, categories), [categories]);
  useEffect(() => saveItem(KEYS.SETTINGS, settings), [settings]);
  useEffect(() => saveItem(KEYS.FOCUS, focusSessions), [focusSessions]);

  // --- HABIT ACTIONS ---
  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>): Habit => {
    const newHabit: Habit = {
      ...habitData,
      id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [newHabit, ...prev]);

    // If habit has reminderTime, auto create a reminder
    if (newHabit.reminderTime) {
      addReminder({
        title: `Habit: ${newHabit.title}`,
        description: newHabit.description || 'Time to complete your habit!',
        type: 'habit_ping',
        time: newHabit.reminderTime,
        recurring: { type: 'daily' },
        sound: 'bell',
        enabled: true,
        sourceId: newHabit.id,
      });
    }

    return newHabit;
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setLogs((prev) => prev.filter((l) => l.habitId !== id));
    setReminders((prev) => prev.filter((r) => r.sourceId !== id));
  };

  const getHabitLogForDate = useCallback(
    (habitId: string, dateStr: string): HabitLog | undefined => {
      return logs.find((l) => l.habitId === habitId && l.date === dateStr);
    },
    [logs]
  );

  const toggleHabitCompletion = (habitId: string, dateStr: string = selectedDate) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    setLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.habitId === habitId && l.date === dateStr);
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const nextCompleted = !existing.completed;
        if (nextCompleted && onCelebration) onCelebration();
        const updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          completed: nextCompleted,
          value: nextCompleted ? (habit.targetValue || 1) : 0,
          loggedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        if (onCelebration) onCelebration();
        return [
          ...prev,
          {
            id: `log-${habitId}-${dateStr}`,
            habitId,
            date: dateStr,
            completed: true,
            value: habit.targetValue || 1,
            loggedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const incrementHabitValue = (habitId: string, delta: number, dateStr: string = selectedDate) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    setLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.habitId === habitId && l.date === dateStr);
      const target = habit.targetValue || 1;
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const nextVal = Math.max(0, (existing.value || 0) + delta);
        const nextCompleted = nextVal >= target;
        if (!existing.completed && nextCompleted && onCelebration) onCelebration();
        const updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          value: nextVal,
          completed: nextCompleted,
          loggedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        const nextVal = Math.max(0, delta);
        const nextCompleted = nextVal >= target;
        if (nextCompleted && onCelebration) onCelebration();
        return [
          ...prev,
          {
            id: `log-${habitId}-${dateStr}`,
            habitId,
            date: dateStr,
            value: nextVal,
            completed: nextCompleted,
            loggedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const setHabitLogValue = (habitId: string, value: number, dateStr: string = selectedDate) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    setLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.habitId === habitId && l.date === dateStr);
      const target = habit.targetValue || 1;
      const nextCompleted = value >= target;
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        if (!existing.completed && nextCompleted && onCelebration) onCelebration();
        const updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          value,
          completed: nextCompleted,
          loggedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        if (nextCompleted && onCelebration) onCelebration();
        return [
          ...prev,
          {
            id: `log-${habitId}-${dateStr}`,
            habitId,
            date: dateStr,
            value,
            completed: nextCompleted,
            loggedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  // --- TASK ACTIONS ---
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);

    // Create task alarm/reminder if time is set
    if (newTask.isAlarmEnabled && newTask.startTime) {
      addReminder({
        title: `Task Alert: ${newTask.title}`,
        description: newTask.description || `Scheduled for ${newTask.startTime}`,
        type: 'task_alert',
        time: newTask.startTime,
        date: newTask.date,
        sound: 'energetic',
        enabled: true,
        sourceId: newTask.id,
      });
    }

    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.status === 'completed' && t.status !== 'completed') {
            updated.completedAt = new Date().toISOString();
            if (onCelebration) onCelebration();
          }
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setReminders((prev) => prev.filter((r) => r.sourceId !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isDone = t.status === 'completed';
          if (!isDone && onCelebration) onCelebration();
          return {
            ...t,
            status: isDone ? 'todo' : 'completed',
            completedAt: isDone ? undefined : new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allDone = newSubtasks.length > 0 && newSubtasks.every((st) => st.completed);
          return {
            ...t,
            subtasks: newSubtasks,
            status: allDone ? 'completed' : t.status,
          };
        }
        return t;
      })
    );
  };

  // --- GOAL ACTIONS ---
  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>): Goal => {
    const newGoal: Goal = {
      ...goalData,
      id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [newGoal, ...prev]);
    return newGoal;
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const nextMilestones = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          const allDone = nextMilestones.every((m) => m.completed);
          if (nextMilestones.find((m) => m.id === milestoneId)?.completed && onCelebration) {
            onCelebration();
          }
          return {
            ...g,
            milestones: nextMilestones,
            status: allDone ? 'completed' : g.status,
          };
        }
        return g;
      })
    );
  };

  const addMilestone = (goalId: string, title: string, targetDate?: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return {
            ...g,
            milestones: [
              ...g.milestones,
              {
                id: `m-${Date.now()}`,
                title,
                completed: false,
                targetDate,
              },
            ],
          };
        }
        return g;
      })
    );
  };

  // --- REMINDERS & ALARMS ---
  const addReminder = (remData: Omit<Reminder, 'id' | 'createdAt'>): Reminder => {
    const newRem: Reminder = {
      ...remData,
      id: `r-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newRem, ...prev]);
    return newRem;
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  // --- CATEGORIES ---
  const addCategory = (catData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // --- FOCUS ---
  const addFocusSession = (sessionData: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...sessionData,
      id: `f-${Date.now()}`,
    };
    setFocusSessions((prev) => [newSession, ...prev]);
  };

  // --- SETTINGS & EXPORT/IMPORT ---
  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    localStorage.clear();
    window.location.reload();
  };

  const exportData = () => {
    downloadBackupFile({
      habits,
      logs,
      tasks,
      goals,
      reminders,
      categories,
      settings,
      focusSessions,
    });
  };

  const importBackupData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      const data = parsed.data || parsed;
      if (data.habits) setHabits(data.habits);
      if (data.logs) setLogs(data.logs);
      if (data.tasks) setTasks(data.tasks);
      if (data.goals) setGoals(data.goals);
      if (data.reminders) setReminders(data.reminders);
      if (data.categories) setCategories(data.categories);
      if (data.settings) setSettings(data.settings);
      if (data.focusSessions) setFocusSessions(data.focusSessions);
      return true;
    } catch (err) {
      console.error('Failed to import backup:', err);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        habits,
        logs,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
        incrementHabitValue,
        setHabitLogValue,
        getHabitLogForDate,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleSubtask,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleMilestone,
        addMilestone,
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminder,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        focusSessions,
        addFocusSession,
        settings,
        updateSettings,
        resetToDefaults,
        importBackupData,
        exportData,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
