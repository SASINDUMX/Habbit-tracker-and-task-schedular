import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateHabitStats, getPastNDays, formatDisplayDate } from '../../utils/dateUtils';
import { IconRenderer } from '../common/IconRenderer';
import {
  TrendingUp,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  Calendar,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { habits, logs, tasks, goals, focusSessions, categories } = useApp();

  // Calculate Overall Discipline Score (0 to 100)
  const statsSummary = useMemo(() => {
    if (habits.length === 0) return { overallRate: 0, bestStreak: 0, totalLogs: 0 };

    let totalRate = 0;
    let highestStreak = 0;

    habits.forEach((h) => {
      const stats = calculateHabitStats(h, logs);
      totalRate += stats.completionRate;
      if (stats.longestStreak > highestStreak) highestStreak = stats.longestStreak;
    });

    const overallRate = Math.round(totalRate / habits.length);
    const totalLogs = logs.filter((l) => l.completed).length;

    return { overallRate, bestStreak: highestStreak, totalLogs };
  }, [habits, logs]);

  // Total Focus Minutes
  const totalFocusMinutes = useMemo(() => {
    return focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [focusSessions]);

  // Past 7 Days Trend
  const past7Days = useMemo(() => getPastNDays(7), []);
  const dailyTrends = useMemo(() => {
    return past7Days.map((d) => {
      const dayLogs = logs.filter((l) => l.date === d && l.completed);
      const dayTasks = tasks.filter((t) => t.date === d && t.status === 'completed');
      return {
        date: d,
        display: formatDisplayDate(d),
        habitsDone: dayLogs.length,
        tasksDone: dayTasks.length,
      };
    });
  }, [past7Days, logs, tasks]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          Performance Analytics & Insights
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review habits consistency, completed focus blocks, and progress metrics.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Discipline Score
            </span>
            <div className="text-3xl font-extrabold text-white mt-1 font-mono">
              {statsSummary.overallRate}%
            </div>
            <span className="text-[11px] text-brand-400 mt-0.5 inline-block">Overall completion</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              All-Time Best Streak
            </span>
            <div className="text-3xl font-extrabold text-white mt-1 font-mono">
              {statsSummary.bestStreak} <span className="text-sm font-normal text-slate-400">days</span>
            </div>
            <span className="text-[11px] text-amber-400 mt-0.5 inline-block">Peak consistency</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-amber-400" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Deep Work
            </span>
            <div className="text-3xl font-extrabold text-white mt-1 font-mono">
              {Math.round(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
            </div>
            <span className="text-[11px] text-blue-400 mt-0.5 inline-block">
              {focusSessions.length} recorded blocks
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Habits Logged
            </span>
            <div className="text-3xl font-extrabold text-white mt-1 font-mono">
              {statsSummary.totalLogs}
            </div>
            <span className="text-[11px] text-purple-400 mt-0.5 inline-block">Lifetime check-ins</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 7-Day Performance Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-400" />
          Past 7 Days Output Overview
        </h3>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {dailyTrends.map((d) => {
            const maxVal = Math.max(1, ...dailyTrends.map((item) => item.habitsDone + item.tasksDone));
            const heightPercent = Math.min(100, Math.round(((d.habitsDone + d.tasksDone) / maxVal) * 100));

            return (
              <div key={d.date} className="flex flex-col items-center gap-2">
                <div className="text-xs font-bold text-white font-mono">
                  {d.habitsDone + d.tasksDone}
                </div>

                {/* Vertical Bar */}
                <div className="w-full max-w-[40px] h-36 bg-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-end p-1 border border-slate-700/40">
                  <div
                    className="w-full bg-brand-500 rounded-lg transition-all duration-500 shadow-sm shadow-brand-500/40"
                    style={{ height: `${Math.max(12, heightPercent)}%` }}
                  />
                </div>

                <div className="text-[10px] text-slate-400 font-semibold text-center truncate w-full">
                  {d.display.split(',')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit Consistency Leaderboard */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Habit Consistency Breakdown
        </h3>

        <div className="space-y-3">
          {habits.map((habit) => {
            const stats = calculateHabitStats(habit, logs);
            return (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: `${habit.color}25`, color: habit.color }}
                  >
                    <IconRenderer name={habit.icon} size={18} color={habit.color} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{habit.title}</h4>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {habit.timeOfDay} • {habit.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-bold text-amber-400 font-mono flex items-center justify-end gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{stats.currentStreak}d</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Best: {stats.longestStreak}d
                    </span>
                  </div>

                  <div className="text-right w-24">
                    <div className="font-bold text-brand-400 font-mono text-sm">
                      {stats.completionRate}%
                    </div>
                    <span className="text-[10px] text-slate-400">Consistency</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
