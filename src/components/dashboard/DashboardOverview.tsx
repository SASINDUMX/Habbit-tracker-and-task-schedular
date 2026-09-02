import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAudioNotification } from '../../context/AudioNotificationContext';
import { usePwa } from '../../context/PwaContext';
import { Habit, Task, Goal, Reminder } from '../../types';
import { formatDisplayDate, getTodayString, formatTimeDisplay } from '../../utils/dateUtils';
import { IconRenderer } from '../common/IconRenderer';
import {
  Sparkles,
  Clock,
  Target,
  Bell,
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Calendar,
  Zap,
  ArrowRight,
  TrendingUp,
  X,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigateTab: (tab: 'habits' | 'tasks' | 'goals' | 'reminders' | 'focus' | 'analytics' | 'settings') => void;
  onStartFocusHabit: (habit: Habit) => void;
}

interface WidgetVisibility {
  habits: boolean;
  tasks: boolean;
  focus: boolean;
  alarms: boolean;
  goals: boolean;
  analytics: boolean;
}

const DEFAULT_WIDGETS: WidgetVisibility = {
  habits: true,
  tasks: true,
  focus: true,
  alarms: true,
  goals: true,
  analytics: true,
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onStartFocusHabit,
}) => {
  const {
    habits,
    logs,
    tasks,
    goals,
    reminders,
    toggleHabitCompletion,
    incrementHabitValue,
    getHabitLogForDate,
    toggleTaskStatus,
    toggleReminder,
    settings,
    selectedDate,
  } = useApp();

  const { playSound, playCelebration } = useAudioNotification();
  const { isInstallable, isInstalled, installApp, isIOS } = usePwa();

  // Widget settings
  const [widgets, setWidgets] = useState<WidgetVisibility>(() => {
    try {
      const saved = localStorage.getItem('orbit_dashboard_widgets');
      return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });
  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState(false);

  const toggleWidget = (key: keyof WidgetVisibility) => {
    const next = { ...widgets, [key]: !widgets[key] };
    setWidgets(next);
    localStorage.setItem('orbit_dashboard_widgets', JSON.stringify(next));
  };

  // Mini Focus Widget State
  const [miniTimerRunning, setMiniTimerRunning] = useState(false);
  const [miniTimeLeft, setMiniTimeLeft] = useState(settings.pomodoroWorkMinutes * 60);

  React.useEffect(() => {
    let timer: number | null = null;
    if (miniTimerRunning) {
      timer = window.setInterval(() => {
        setMiniTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer!);
            setMiniTimerRunning(false);
            playSound('bell');
            playCelebration();
            return settings.pomodoroWorkMinutes * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [miniTimerRunning, settings.pomodoroWorkMinutes, playSound, playCelebration]);

  const todayStr = getTodayString();
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const pendingTasks = todayTasks.filter((t) => t.status !== 'completed');
  const completedHabitsToday = habits.filter((h) => getHabitLogForDate(h.id, todayStr)?.completed).length;

  const miniMinutes = Math.floor(miniTimeLeft / 60);
  const miniSeconds = miniTimeLeft % 60;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top Welcome Bar & Customize Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/30 font-mono">
              Life Command Center
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">
              {formatDisplayDate(todayStr)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Good Day, Commander.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {completedHabitsToday} of {habits.length} habits done • {pendingTasks.length} tasks scheduled for today
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Install App Button */}
          {!isInstalled && (
            <button
              onClick={installApp}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition transform active:scale-95 cursor-pointer animate-pulse"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install App</span>
            </button>
          )}

          {/* Customize Widgets Button */}
          <button
            onClick={() => setShowWidgetCustomizer(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-brand-400" />
            <span className="hidden sm:inline">Customize Widgets</span>
          </button>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. TODAY'S HABITS QUICK CHECKLIST WIDGET */}
        {widgets.habits && (
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Daily Habits</h3>
                </div>
                <button
                  onClick={() => onNavigateTab('habits')}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Habit Items */}
              <div className="space-y-2.5 mt-3 max-h-60 overflow-y-auto pr-1">
                {habits.slice(0, 5).map((habit) => {
                  const log = getHabitLogForDate(habit.id, todayStr);
                  const isDone = !!log?.completed;

                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => toggleHabitCompletion(habit.id, todayStr)}
                          className="text-slate-400 hover:text-brand-400 transition shrink-0 cursor-pointer"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-brand-400" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <span className={`font-semibold text-white truncate ${isDone ? 'line-through text-slate-500' : ''}`}>
                          {habit.title}
                        </span>
                      </div>

                      {habit.type === 'number' ? (
                        <div className="flex items-center gap-1 shrink-0 font-mono text-[11px] text-slate-300">
                          <button
                            onClick={() => incrementHabitValue(habit.id, habit.targetValue && habit.targetValue > 100 ? 250 : 1, todayStr)}
                            className="p-1 rounded-lg bg-slate-700 hover:bg-brand-500 hover:text-slate-950 transition"
                          >
                            +
                          </button>
                          <span>{log?.value || 0}/{habit.targetValue}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 capitalize bg-slate-900 px-2 py-0.5 rounded-md">
                          {habit.timeOfDay}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Completion Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{completedHabitsToday}/{habits.length} completed</span>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${habits.length > 0 ? (completedHabitsToday / habits.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. TODAY'S TASKS & AGENDA WIDGET */}
        {widgets.tasks && (
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Today&apos;s Schedule</h3>
                </div>
                <button
                  onClick={() => onNavigateTab('tasks')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  24h Timeline <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5 mt-3 max-h-60 overflow-y-auto pr-1">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    <span>No tasks scheduled today.</span>
                    <button
                      onClick={() => onNavigateTab('tasks')}
                      className="block mx-auto mt-2 text-brand-400 hover:underline"
                    >
                      + Add a task
                    </button>
                  </div>
                ) : (
                  todayTasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className="text-slate-400 hover:text-brand-400 transition shrink-0 cursor-pointer"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-brand-400" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <span className={`font-semibold text-white truncate ${isDone ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                          </span>
                        </div>

                        {task.startTime && (
                          <span className="text-[10px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded-md shrink-0">
                            {formatTimeDisplay(task.startTime)}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>{pendingTasks.length} tasks remaining</span>
            </div>
          </div>
        )}

        {/* 3. MINI FOCUS POMODORO WIDGET */}
        {widgets.focus && (
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Flame className="w-4 h-4 fill-amber-400" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Quick Focus Block</h3>
                </div>
                <button
                  onClick={() => onNavigateTab('focus')}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  Open Studio <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Digital Countdown */}
              <div className="text-center py-5">
                <div className="text-5xl font-black text-white font-mono tracking-tighter">
                  {String(miniMinutes).padStart(2, '0')}:{String(miniSeconds).padStart(2, '0')}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                  {miniTimerRunning ? 'Session in progress' : 'Ready to focus'}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setMiniTimerRunning(!miniTimerRunning)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  miniTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-brand-500 hover:bg-brand-600 text-slate-950'
                }`}
              >
                {miniTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                <span>{miniTimerRunning ? 'Pause' : 'Start Focus'}</span>
              </button>

              <button
                onClick={() => {
                  setMiniTimerRunning(false);
                  setMiniTimeLeft(settings.pomodoroWorkMinutes * 60);
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 4. ACTIVE ALARMS & REMINDERS WIDGET */}
        {widgets.alarms && (
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Alarms & Alerts</h3>
                </div>
                <button
                  onClick={() => onNavigateTab('reminders')}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  Manage <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5 mt-3 max-h-60 overflow-y-auto pr-1">
                {reminders.slice(0, 4).map((rem) => (
                  <div
                    key={rem.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs ${
                      rem.enabled ? '' : 'opacity-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white truncate max-w-[150px]">
                        {rem.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatTimeDisplay(rem.time)}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleReminder(rem.id)}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                        rem.enabled ? 'bg-brand-500 justify-end' : 'bg-slate-700 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>{reminders.filter((r) => r.enabled).length} alarms active</span>
            </div>
          </div>
        )}

        {/* 5. GOAL PROGRESS HIGHLIGHTS WIDGET */}
        {widgets.goals && (
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Active Goals</h3>
                </div>
                <button
                  onClick={() => onNavigateTab('goals')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3 mt-3 max-h-60 overflow-y-auto pr-1">
                {goals.slice(0, 3).map((g) => {
                  const completedM = g.milestones.filter((m) => m.completed).length;
                  const percent = g.milestones.length > 0 ? Math.round((completedM / g.milestones.length) * 100) : 50;

                  return (
                    <div key={g.id} className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white truncate max-w-[170px]">{g.title}</span>
                        <span className="font-bold text-brand-400 font-mono">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${percent}%`, backgroundColor: g.color || '#22c55e' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>{goals.length} goals underway</span>
            </div>
          </div>
        )}

        {/* 6. DISCIPLINE & STREAK METRICS WIDGET */}
        {widgets.analytics && (
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Consistency Matrix</h3>
                </div>
                <button
                  onClick={() => onNavigateTab('analytics')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  Analytics <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-2xl font-black text-brand-400 font-mono">
                    {Math.round((completedHabitsToday / (habits.length || 1)) * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Today&apos;s Rate</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-2xl font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5 fill-amber-400" />
                    <span>Active</span>
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Streaks Active</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>Overall discipline tracking</span>
            </div>
          </div>
        )}
      </div>

      {/* WIDGET CUSTOMIZER MODAL */}
      {showWidgetCustomizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-base text-white">Customize Dashboard Widgets</h3>
              </div>
              <button
                onClick={() => setShowWidgetCustomizer(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Choose which widget cards appear on your main Command Center screen:
            </p>

            <div className="space-y-2 pt-1">
              {[
                { id: 'habits', label: 'Daily Habits Checklist', icon: Sparkles },
                { id: 'tasks', label: 'Today&apos;s Schedule & Tasks', icon: Clock },
                { id: 'focus', label: 'Quick Focus Pomodoro Timer', icon: Flame },
                { id: 'alarms', label: 'Active Alarms & Reminders', icon: Bell },
                { id: 'goals', label: 'Goal Progress & Milestones', icon: Target },
                { id: 'analytics', label: 'Consistency & Discipline Matrix', icon: TrendingUp },
              ].map((item) => {
                const key = item.id as keyof WidgetVisibility;
                const isVisible = widgets[key];
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleWidget(key)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-brand-400" />
                      <span className="font-semibold text-white">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      {isVisible ? (
                        <span className="flex items-center gap-1 text-brand-400 font-semibold">
                          <Eye className="w-4 h-4" /> Visible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500">
                          <EyeOff className="w-4 h-4" /> Hidden
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowWidgetCustomizer(false)}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer mt-2"
            >
              Done Customizing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
