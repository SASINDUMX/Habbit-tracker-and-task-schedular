import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import { TaskTimeline } from './TaskTimeline';
import { TaskKanban } from './TaskKanban';
import { TaskCalendar } from './TaskCalendar';
import { TaskModal } from './TaskModal';
import { formatDisplayDate, getTodayString } from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  Clock,
  Kanban,
  Plus,
  Filter,
  CheckCircle2,
  Layers,
} from 'lucide-react';

type TaskViewMode = 'timeline' | 'kanban' | 'calendar';

export const TaskManager: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    selectedDate,
    setSelectedDate,
    categories,
    goals,
  } = useApp();

  const [viewMode, setViewMode] = useState<TaskViewMode>('timeline');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultSlotTime, setDefaultSlotTime] = useState<string | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');

  const isToday = selectedDate === getTodayString();

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultSlotTime(undefined);
    setIsModalOpen(true);
  };

  const handleAddNew = (timeStr?: string, status?: TaskStatus, dateStr?: string) => {
    setEditingTask(null);
    setDefaultSlotTime(timeStr);
    if (status) setDefaultStatus(status);
    if (dateStr) setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleSave = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Clock className="w-6 h-6" />
            </div>
            Task Scheduler & Time-Blocker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visual 24h timeline planning, drag-and-drop Kanban, and monthly agendas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="p-1 bg-slate-900 border border-slate-700/80 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-brand-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Timeline
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-brand-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-brand-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar
            </button>
          </div>

          {/* Date Picker (Timeline & Kanban) */}
          {viewMode !== 'calendar' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs text-slate-300">
              <CalendarIcon className="w-4 h-4 text-brand-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer text-xs"
              />
              {!isToday && (
                <button
                  onClick={() => setSelectedDate(getTodayString())}
                  className="px-2 py-0.5 rounded-lg bg-brand-500/20 text-brand-400 font-semibold hover:bg-brand-500/30 transition cursor-pointer"
                >
                  Today
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => handleAddNew()}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule Task
          </button>
        </div>
      </div>

      {/* Active View Component */}
      {viewMode === 'timeline' && (
        <TaskTimeline
          tasks={tasks}
          selectedDate={selectedDate}
          categories={categories}
          onToggleStatus={toggleTaskStatus}
          onEditTask={handleEditTask}
          onScheduleSlot={(timeStr) => handleAddNew(timeStr)}
          onDeleteTask={deleteTask}
        />
      )}

      {viewMode === 'kanban' && (
        <TaskKanban
          tasks={tasks}
          selectedDate={selectedDate}
          categories={categories}
          onToggleStatus={toggleTaskStatus}
          onUpdateStatus={handleUpdateStatus}
          onEditTask={handleEditTask}
          onDeleteTask={deleteTask}
          onAddNewWithStatus={(st) => handleAddNew(undefined, st)}
        />
      )}

      {viewMode === 'calendar' && (
        <TaskCalendar
          tasks={tasks}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onToggleStatus={toggleTaskStatus}
          onEditTask={handleEditTask}
          onAddNewTask={(dateStr) => handleAddNew(undefined, 'todo', dateStr)}
          onDeleteTask={deleteTask}
        />
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onDelete={deleteTask}
          initialData={editingTask}
          categories={categories}
          goals={goals}
          defaultDate={selectedDate}
          defaultTime={defaultSlotTime}
        />
      )}
    </div>
  );
};
