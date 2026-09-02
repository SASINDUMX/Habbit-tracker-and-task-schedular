import React, { useState } from 'react';
import { Task, PriorityLevel, TaskStatus, Category, Goal, Subtask } from '../../types';
import { X, Check, Clock, Calendar, Plus, Trash2, Bell, AlertTriangle } from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  initialData?: Task | null;
  categories: Category[];
  goals: Goal[];
  defaultDate?: string;
  defaultTime?: string;
}

const PRIORITIES: { id: PriorityLevel; label: string; color: string }[] = [
  { id: 'low', label: 'Low', color: '#10b981' },
  { id: 'medium', label: 'Medium', color: '#3b82f6' },
  { id: 'high', label: 'High', color: '#f59e0b' },
  { id: 'urgent', label: 'Urgent', color: '#ef4444' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  goals,
  defaultDate,
  defaultTime,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || categories[0]?.id || 'focus');
  const [priority, setPriority] = useState<PriorityLevel>(initialData?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || 'todo');
  const [date, setDate] = useState(initialData?.date || defaultDate || getTodayString());
  const [startTime, setStartTime] = useState(initialData?.startTime || defaultTime || '09:00');
  const [endTime, setEndTime] = useState(initialData?.endTime || '10:00');
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(initialData?.isAlarmEnabled ?? true);
  const [goalId, setGoalId] = useState(initialData?.goalId || '');
  
  // Subtasks
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialData?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `st-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Calculate duration in minutes if times provided
    let durationMinutes: number | undefined = undefined;
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const startTotal = sh * 60 + sm;
      const endTotal = eh * 60 + em;
      if (endTotal > startTotal) {
        durationMinutes = endTotal - startTotal;
      }
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      durationMinutes,
      subtasks,
      goalId: goalId || undefined,
      isAlarmEnabled: isAlarmEnabled && !!startTime,
      reminderTime: isAlarmEnabled ? startTime : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialData ? 'Edit Task' : 'Schedule New Task'}
              </h2>
              <p className="text-xs text-slate-400">Plan time blocks, subtasks & priority</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Finish Product Roadmap, Design wireframes, Sprint planning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-brand-500 rounded-xl text-white text-sm outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add key deliverables, links, or notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 focus:border-brand-500 rounded-xl text-white text-sm outline-none resize-none transition"
            />
          </div>

          {/* Date & Time Blocks */}
          <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Alarm Trigger Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-400" />
                <span className="text-xs text-slate-300 font-medium">
                  Trigger Sound Alarm at Start Time
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAlarmEnabled(!isAlarmEnabled)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition duration-200 cursor-pointer ${
                  isAlarmEnabled ? 'bg-brand-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition" />
              </button>
            </div>
          </div>

          {/* Priority & Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none capitalize cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none capitalize cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Subtasks Checklist ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add subtask step..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 inline mr-1" />
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs"
                  >
                    <div
                      onClick={() => handleToggleSubtask(st.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => {}}
                        className="rounded accent-brand-500 cursor-pointer"
                      />
                      <span className={st.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {st.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Link to Goal */}
          {goals.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Link to Long-Term Goal (Optional)
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                <option value="">None (Independent Task)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {initialData ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
