import React, { useMemo } from 'react';
import { Task, Category } from '../../types';
import { formatTimeDisplay, getTodayString } from '../../utils/dateUtils';
import { Clock, CheckCircle2, Circle, AlertCircle, Plus } from 'lucide-react';

interface TaskTimelineProps {
  tasks: Task[];
  selectedDate: string;
  categories: Category[];
  onToggleStatus: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onScheduleSlot: (timeStr: string) => void;
}

const START_HOUR = 6; // 06:00 AM
const END_HOUR = 23;  // 11:00 PM
const TOTAL_HOURS = END_HOUR - START_HOUR + 1;
const HOUR_HEIGHT = 70; // 70px per hour

export const TaskTimeline: React.FC<TaskTimelineProps> = ({
  tasks,
  selectedDate,
  categories,
  onToggleStatus,
  onEditTask,
  onScheduleSlot,
}) => {
  const isToday = selectedDate === getTodayString();

  // Current time position indicator
  const currentMinutesOffset = useMemo(() => {
    if (!isToday) return null;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours < START_HOUR || hours > END_HOUR) return null;
    return (hours - START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
  }, [isToday]);

  // Tasks for this date
  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const scheduledTasks = dayTasks.filter((t) => t.startTime);
  const unscheduledTasks = dayTasks.filter((t) => !t.startTime);

  // Calculate task block style
  const getTaskStyle = (task: Task) => {
    if (!task.startTime) return null;
    const [hStr, mStr] = task.startTime.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);

    const startTotalHours = h + m / 60;
    if (startTotalHours < START_HOUR || startTotalHours > END_HOUR + 1) return null;

    const top = (startTotalHours - START_HOUR) * HOUR_HEIGHT;

    let durationHours = 1;
    if (task.endTime) {
      const [ehStr, emStr] = task.endTime.split(':');
      const eh = parseInt(ehStr, 10);
      const em = parseInt(emStr || '0', 10);
      const endTotal = eh + em / 60;
      if (endTotal > startTotalHours) {
        durationHours = endTotal - startTotalHours;
      }
    } else if (task.durationMinutes) {
      durationHours = task.durationMinutes / 60;
    }

    const height = Math.max(34, durationHours * HOUR_HEIGHT);
    return { top, height };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-500/15 border-red-500/30 text-red-200';
      case 'high':
        return 'border-l-amber-500 bg-amber-500/15 border-amber-500/30 text-amber-200';
      case 'low':
        return 'border-l-emerald-500 bg-emerald-500/15 border-emerald-500/30 text-emerald-200';
      case 'medium':
      default:
        return 'border-l-brand-500 bg-brand-500/15 border-brand-500/30 text-brand-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Unscheduled Tasks Bar */}
      {unscheduledTasks.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Unscheduled Tasks ({unscheduledTasks.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {unscheduledTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onEditTask(task)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition cursor-pointer"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(task.id);
                  }}
                  className="text-slate-400 hover:text-brand-400"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                </button>
                <span className={task.status === 'completed' ? 'line-through text-slate-500' : ''}>
                  {task.title}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.5 rounded bg-slate-900 capitalize">
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Timeline Grid */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" />
            24-Hour Time-Block Schedule
          </h3>
          <span className="text-xs text-slate-400">Click any hour slot to schedule a task</span>
        </div>

        <div className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
          {/* Hour grid lines */}
          {Array.from({ length: TOTAL_HOURS }).map((_, idx) => {
            const hour = START_HOUR + idx;
            const hourDisplay = `${String(hour).padStart(2, '0')}:00`;
            const top = idx * HOUR_HEIGHT;

            return (
              <div
                key={hour}
                style={{ top }}
                onClick={() => onScheduleSlot(hourDisplay)}
                className="absolute left-0 right-0 h-[70px] border-t border-slate-800/80 flex items-start group hover:bg-brand-500/5 transition cursor-pointer"
              >
                <div className="w-14 shrink-0 text-xs font-mono text-slate-500 -mt-2.5 select-none pl-1">
                  {formatTimeDisplay(hourDisplay)}
                </div>
                <div className="flex-1 h-full relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 flex items-center gap-1 text-[11px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md transition">
                    <Plus className="w-3 h-3" />
                    <span>Block {hourDisplay}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Current Time Indicator Red Line */}
          {currentMinutesOffset !== null && (
            <div
              style={{ top: currentMinutesOffset }}
              className="absolute left-12 right-0 flex items-center pointer-events-none z-20"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-md shadow-red-500 -ml-1.5 animate-pulse" />
              <div className="flex-1 h-[2px] bg-red-500 shadow-sm shadow-red-500" />
            </div>
          )}

          {/* Scheduled Task Blocks */}
          <div className="absolute left-16 right-2 top-0 bottom-0 pointer-events-none">
            {scheduledTasks.map((task) => {
              const style = getTaskStyle(task);
              if (!style) return null;

              const isDone = task.status === 'completed';
              const priorityClass = getPriorityColor(task.priority);

              return (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  style={{
                    top: style.top,
                    height: style.height,
                  }}
                  className={`absolute left-0 right-0 p-3 rounded-2xl border border-l-4 backdrop-blur-md shadow-md transition-all pointer-events-auto cursor-pointer flex flex-col justify-between overflow-hidden group ${priorityClass} ${
                    isDone ? 'opacity-50 grayscale' : 'hover:scale-[1.008] hover:z-10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(task.id);
                        }}
                        className="text-white hover:text-brand-300 transition shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-brand-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div className="font-semibold text-xs text-white truncate">
                        <span className={isDone ? 'line-through text-slate-400' : ''}>
                          {task.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded-lg border border-slate-700/40">
                      <span>{task.startTime}</span>
                      {task.endTime && <span>- {task.endTime}</span>}
                    </div>
                  </div>

                  {style.height > 50 && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      {task.description ? (
                        <p className="line-clamp-1 text-slate-300">{task.description}</p>
                      ) : (
                        <span />
                      )}
                      {task.subtasks.length > 0 && (
                        <span className="font-mono bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-300 ml-auto">
                          {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
