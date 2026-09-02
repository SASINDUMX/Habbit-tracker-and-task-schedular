import React, { useMemo } from 'react';
import { HabitLog, Habit } from '../../types';
import { getPastNDays, formatDisplayDate } from '../../utils/dateUtils';

interface HabitHeatmapProps {
  logs: HabitLog[];
  habits: Habit[];
  daysCount?: number;
  highlightHabitId?: string;
}

export const HabitHeatmap: React.FC<HabitHeatmapProps> = ({
  logs,
  habits,
  daysCount = 90,
  highlightHabitId,
}) => {
  const dates = useMemo(() => getPastNDays(daysCount), [daysCount]);

  // Aggregate completion map
  const activityMap = useMemo(() => {
    const map = new Map<string, { completed: number; total: number }>();

    dates.forEach((d) => {
      const activeHabits = highlightHabitId
        ? habits.filter((h) => h.id === highlightHabitId)
        : habits;

      const dateLogs = logs.filter((l) => l.date === d && (highlightHabitId ? l.habitId === highlightHabitId : true));
      const completedCount = dateLogs.filter((l) => l.completed).length;

      map.set(d, {
        completed: completedCount,
        total: activeHabits.length || 1,
      });
    });

    return map;
  }, [dates, logs, habits, highlightHabitId]);

  const getColorIntensity = (completed: number, total: number) => {
    if (completed === 0 || total === 0) return 'bg-slate-800/80 border-slate-700/50';
    const ratio = completed / total;
    if (ratio <= 0.25) return 'bg-brand-900 border-brand-700/40 text-brand-300';
    if (ratio <= 0.5) return 'bg-brand-700 border-brand-500/40 text-brand-200';
    if (ratio <= 0.75) return 'bg-brand-500 border-brand-400 text-slate-950';
    return 'bg-brand-400 border-brand-300 shadow-sm shadow-brand-500/50 text-slate-950';
  };

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {highlightHabitId ? 'Habit Consistency History' : 'Overall Consistency Heatmap'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Past {daysCount} days activity matrix</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
          <div className="w-3 h-3 rounded bg-brand-900 border border-brand-700" />
          <div className="w-3 h-3 rounded bg-brand-700 border border-brand-500" />
          <div className="w-3 h-3 rounded bg-brand-500" />
          <div className="w-3 h-3 rounded bg-brand-400 shadow-sm shadow-brand-500" />
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-full">
          {dates.map((dateStr) => {
            const data = activityMap.get(dateStr) || { completed: 0, total: 1 };
            const intensityClass = getColorIntensity(data.completed, data.total);

            return (
              <div
                key={dateStr}
                title={`${formatDisplayDate(dateStr)}: ${data.completed} / ${data.total} habits completed`}
                className={`w-3.5 h-3.5 rounded-md border transition-all duration-150 hover:scale-125 hover:z-10 cursor-pointer ${intensityClass}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
