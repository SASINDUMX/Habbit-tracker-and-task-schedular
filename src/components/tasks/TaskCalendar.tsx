import React, { useState } from 'react';
import { Task } from '../../types';
import { getMonthDays, formatDisplayDate, getTodayString } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

interface TaskCalendarProps {
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onToggleStatus: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onAddNewTask: (dateStr: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  selectedDate,
  onSelectDate,
  onToggleStatus,
  onEditTask,
  onAddNewTask,
  onDeleteTask,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthDays = getMonthDays(year, month);

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Day tasks
  const selectedDayTasks = tasks.filter((t) => t.date === selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid (2 Cols on Large) */}
      <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-400" />
            {format(currentMonthDate, 'MMMM yyyy')}
          </h3>

          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonthDate(new Date())}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 py-1 border-b border-slate-800">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before month start */}
          {Array.from({ length: monthDays[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 rounded-2xl bg-slate-900/40 opacity-20" />
          ))}

          {monthDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === getTodayString();
            const dayTasks = tasks.filter((t) => t.date === dateStr);
            const completedCount = dayTasks.filter((t) => t.status === 'completed').length;

            return (
              <div
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`h-22 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-500 bg-brand-500/10 shadow-md'
                    : isToday
                    ? 'border-blue-500/50 bg-blue-500/5 hover:border-slate-600'
                    : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isSelected
                        ? 'text-brand-400'
                        : isToday
                        ? 'text-blue-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300">
                      {completedCount}/{dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Mini Task indicators */}
                <div className="space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className="text-[10px] truncate px-1 rounded bg-slate-800/80 text-slate-300"
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[9px] text-slate-400 pl-0.5">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Task List (Side Panel) */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h4 className="text-sm font-bold text-white">
              {formatDisplayDate(selectedDate)}
            </h4>
            <span className="text-xs text-slate-400">
              {selectedDayTasks.length} tasks scheduled
            </span>
          </div>

          <button
            onClick={() => onAddNewTask(selectedDate)}
            className="px-3 py-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-xl transition cursor-pointer"
          >
            + Add Task
          </button>
        </div>

        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          {selectedDayTasks.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs text-center">
              <span>No tasks for this day</span>
              <button
                onClick={() => onAddNewTask(selectedDate)}
                className="mt-2 text-brand-400 hover:underline cursor-pointer"
              >
                Schedule one now
              </button>
            </div>
          ) : (
            selectedDayTasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(task.id);
                        }}
                        className="text-slate-400 hover:text-brand-400 transition"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-brand-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <h5
                        className={`text-xs font-semibold text-white ${
                          isDone ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900">
                        {task.priority}
                      </span>
                      {onDeleteTask && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${task.title}"?`)) {
                              onDeleteTask(task.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 transition"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {task.startTime && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-brand-400" />
                      <span>
                        {task.startTime}
                        {task.endTime ? ` - ${task.endTime}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
