import React, { useState } from 'react';
import { Goal, Habit, HabitLog } from '../../types';
import { IconRenderer } from '../common/IconRenderer';
import { calculateHabitStats } from '../../utils/dateUtils';
import {
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit2,
  Trash2,
  Sparkles,
  Flame,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
  allHabits: Habit[];
  allLogs: HabitLog[];
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  allHabits,
  allLogs,
  onToggleMilestone,
  onEditGoal,
  onDeleteGoal,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Milestones progress
  const totalMilestones = goal.milestones.length;
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  // Linked habits consistency
  const linkedHabits = allHabits.filter((h) => goal.linkedHabitIds?.includes(h.id));
  let habitProgress = 0;
  if (linkedHabits.length > 0) {
    const totalRate = linkedHabits.reduce((acc, h) => {
      const stats = calculateHabitStats(h, allLogs);
      return acc + stats.completionRate;
    }, 0);
    habitProgress = Math.round(totalRate / linkedHabits.length);
  }

  // Combined weighted progress
  let overallProgress = 0;
  if (totalMilestones > 0 && linkedHabits.length > 0) {
    overallProgress = Math.round(milestoneProgress * 0.6 + habitProgress * 0.4);
  } else if (totalMilestones > 0) {
    overallProgress = Math.round(milestoneProgress);
  } else if (linkedHabits.length > 0) {
    overallProgress = habitProgress;
  }

  // Target date calculations
  let daysRemainingText = '';
  if (goal.targetDate) {
    try {
      const target = parseISO(goal.targetDate);
      const diff = differenceInDays(target, new Date());
      if (diff > 0) {
        daysRemainingText = `${diff} days remaining`;
      } else if (diff === 0) {
        daysRemainingText = 'Due today!';
      } else {
        daysRemainingText = `${Math.abs(diff)} days overdue`;
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-slate-700/80 transition shadow-lg space-y-4">
      {/* Top Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
            style={{ backgroundColor: `${goal.color}25`, color: goal.color, border: `1px solid ${goal.color}40` }}
          >
            <IconRenderer name={goal.icon} size={24} color={goal.color} />
          </div>

          <div>
            <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
              {goal.title}
            </h3>
            {goal.targetDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                <span>Target: {format(parseISO(goal.targetDate), 'MMM d, yyyy')}</span>
                {daysRemainingText && (
                  <span className="text-[11px] font-semibold text-brand-400 font-mono">
                    ({daysRemainingText})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-30 w-32 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl py-1 text-xs text-slate-300">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEditGoal(goal);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Goal
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteGoal(goal.id);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-red-400 flex items-center gap-2 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {goal.description && (
        <p className="text-xs text-slate-300 line-clamp-2 bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
          {goal.description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Overall Progress</span>
          <span className="font-bold text-brand-400 font-mono text-sm">{overallProgress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overallProgress}%`,
              backgroundColor: goal.color || '#22c55e',
            }}
          />
        </div>
      </div>

      {/* Milestones Checklist */}
      {goal.milestones.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Milestones ({completedMilestones}/{totalMilestones})
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {goal.milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => onToggleMilestone(goal.id, m.id)}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 text-xs text-slate-200 transition cursor-pointer"
              >
                <button
                  type="button"
                  className="text-slate-400 hover:text-brand-400 transition"
                >
                  {m.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-400" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <span className={m.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                  {m.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked Habits Chips */}
      {linkedHabits.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Fueling Habits
          </span>
          <div className="flex flex-wrap gap-1.5">
            {linkedHabits.map((h) => {
              const stats = calculateHabitStats(h, allLogs);
              return (
                <div
                  key={h.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300"
                >
                  <IconRenderer name={h.icon} size={12} color={h.color} />
                  <span className="font-medium truncate max-w-[120px]">{h.title}</span>
                  <span className="text-[10px] font-mono text-brand-400">
                    {stats.completionRate}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
