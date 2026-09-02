import React from 'react';
import { Habit, HabitLog } from '../../types';
import { IconRenderer } from '../common/IconRenderer';
import { calculateHabitStats, formatTimeDisplay } from '../../utils/dateUtils';
import {
  Flame,
  Check,
  Plus,
  Minus,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Play,
} from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  allLogs: HabitLog[];
  onToggle: (habitId: string) => void;
  onIncrement: (habitId: string, delta: number) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onStartFocus?: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  allLogs,
  onToggle,
  onIncrement,
  onEdit,
  onDelete,
  onStartFocus,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const stats = calculateHabitStats(habit, allLogs);

  const isCompleted = !!log?.completed;
  const currentValue = log?.value || 0;
  const targetValue = habit.targetValue || 1;
  const progressPercent = Math.min(100, Math.round((currentValue / targetValue) * 100));

  return (
    <div
      className={`relative glass-panel rounded-3xl p-5 border transition-all duration-200 ${
        isCompleted
          ? 'border-brand-500/40 bg-slate-900/90 shadow-lg shadow-brand-500/5'
          : 'border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Custom Icon with Habit Color */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform"
            style={{ backgroundColor: `${habit.color}25`, color: habit.color, border: `1px solid ${habit.color}40` }}
          >
            <IconRenderer name={habit.icon} size={22} color={habit.color} />
          </div>

          <div>
            <h3 className="font-bold text-white text-base tracking-tight line-clamp-1">
              {habit.title}
            </h3>
            {habit.description && (
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        {/* Streak & Menu */}
        <div className="flex items-center gap-2">
          {stats.currentStreak > 0 && (
            <div
              title={`Current streak: ${stats.currentStreak} days (Best: ${stats.longestStreak} days)`}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold font-mono"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{stats.currentStreak}</span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-30 w-36 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl py-1.5 text-xs text-slate-300">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(habit);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Habit
                  </button>
                  {habit.type === 'timer' && onStartFocus && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onStartFocus(habit);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-brand-400 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Start Focus
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(habit.id);
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
      </div>

        {/* Info Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[11px]">
        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 capitalize">
          {habit.timeOfDay}
        </span>
        {habit.reminderTime && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Clock className="w-3 h-3" />
            {formatTimeDisplay(habit.reminderTime)}
          </span>
        )}
        <span className="text-slate-500 ml-auto font-mono">
          {stats.completionRate}% Consistency
        </span>
      </div>

      {/* Habit Interaction Controls */}
      {habit.type === 'boolean' ? (
        <button
          onClick={() => onToggle(habit.id)}
          className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 cursor-pointer ${
            isCompleted
              ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/30'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700'
          }`}
        >
          <Check className={`w-5 h-5 ${isCompleted ? 'stroke-[3]' : 'text-slate-400'}`} />
          <span>{isCompleted ? 'Completed Today!' : 'Mark as Done'}</span>
        </button>
      ) : (
        <div className="space-y-2.5">
          {/* Progress Bar & Value Display */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Progress: <strong className="text-white font-mono">{currentValue}</strong> / {targetValue} {habit.unit || ''}
            </span>
            <span className="font-bold text-brand-400 font-mono">{progressPercent}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: habit.color || '#22c55e',
              }}
            />
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onIncrement(habit.id, -(habit.type === 'timer' ? 15 : habit.targetValue && habit.targetValue > 100 ? 250 : 1))}
              disabled={currentValue <= 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>

            <button
              onClick={() => onToggle(habit.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isCompleted
                  ? 'bg-brand-500 text-slate-950 shadow'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isCompleted ? 'Target Reached' : 'Complete Target'}</span>
            </button>

            <button
              onClick={() => onIncrement(habit.id, habit.type === 'timer' ? 15 : habit.targetValue && habit.targetValue > 100 ? 250 : 1)}
              className="p-2 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
