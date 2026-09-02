import React from 'react';
import { Task, TaskStatus, Category } from '../../types';
import { formatTimeDisplay } from '../../utils/dateUtils';
import {
  Clock,
  CheckCircle2,
  Circle,
  MoreVertical,
  Plus,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Trash2,
} from 'lucide-react';

interface TaskKanbanProps {
  tasks: Task[];
  selectedDate: string;
  categories: Category[];
  onToggleStatus: (taskId: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddNewWithStatus: (status: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string; countColor: string }[] = [
  { id: 'todo', title: 'To Do', color: 'border-slate-700', countColor: 'bg-slate-800 text-slate-300' },
  { id: 'in_progress', title: 'In Progress', color: 'border-blue-500/40', countColor: 'bg-blue-500/20 text-blue-300' },
  { id: 'completed', title: 'Completed', color: 'border-brand-500/40', countColor: 'bg-brand-500/20 text-brand-300' },
];

export const TaskKanban: React.FC<TaskKanbanProps> = ({
  tasks,
  selectedDate,
  categories,
  onToggleStatus,
  onUpdateStatus,
  onEditTask,
  onDeleteTask,
  onAddNewWithStatus,
}) => {
  const dayTasks = tasks.filter((t) => t.date === selectedDate);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'low':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'medium':
      default:
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {COLUMNS.map((col) => {
        const colTasks = dayTasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className={`glass-panel rounded-3xl p-4 border ${col.color} flex flex-col min-h-[500px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{col.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${col.countColor}`}>
                  {colTasks.length}
                </span>
              </div>

              <button
                onClick={() => onAddNewWithStatus(col.id)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards */}
            <div className="space-y-3 flex-1">
              {colTasks.length === 0 ? (
                <div className="h-36 flex flex-col items-center justify-center text-slate-500 text-xs text-center border-2 border-dashed border-slate-800/80 rounded-2xl p-4">
                  <span>No tasks here</span>
                  <button
                    onClick={() => onAddNewWithStatus(col.id)}
                    className="mt-2 text-brand-400 hover:underline cursor-pointer"
                  >
                    + Create one
                  </button>
                </div>
              ) : (
                colTasks.map((task) => {
                  const category = categories.find((c) => c.id === task.category);
                  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition shadow-sm cursor-pointer group space-y-3"
                    >
                      {/* Priority and Time */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {task.startTime && (
                            <span className="flex items-center gap-1 font-mono text-slate-400">
                              <Clock className="w-3 h-3 text-brand-400" />
                              {formatTimeDisplay(task.startTime)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete "${task.title}"?`)) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-700/60 transition"
                            title="Delete task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4
                          className={`text-sm font-semibold text-white line-clamp-2 ${
                            task.status === 'completed' ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Subtasks Progress */}
                      {task.subtasks.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-500 rounded-full"
                              style={{
                                width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {completedSubtasks}/{task.subtasks.length}
                          </span>
                        </div>
                      )}

                      {/* Actions & Status Changers */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                        {/* Move Back */}
                        {col.id === 'in_progress' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(task.id, 'todo');
                            }}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                          >
                            <ArrowLeft className="w-3 h-3" /> To Do
                          </button>
                        ) : col.id === 'completed' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(task.id, 'in_progress');
                            }}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                          >
                            <ArrowLeft className="w-3 h-3" /> In Progress
                          </button>
                        ) : (
                          <span />
                        )}

                        {/* Move Forward */}
                        {col.id === 'todo' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(task.id, 'in_progress');
                            }}
                            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                          >
                            In Progress <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : col.id === 'in_progress' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(task.id, 'completed');
                            }}
                            className="flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold"
                          >
                            Done <CheckCircle2 className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-brand-400 font-medium">Completed ✓</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
