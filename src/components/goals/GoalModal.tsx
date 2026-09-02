import React, { useState, useEffect } from 'react';
import { Goal, Category, Milestone, Habit } from '../../types';
import { IconRenderer, AVAILABLE_ICONS, PRESET_COLORS } from '../common/IconRenderer';
import { X, Check, Target, Plus, Trash2, Calendar } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Omit<Goal, 'id' | 'createdAt'>) => void;
  initialData?: Goal | null;
  categories: Category[];
  habits: Habit[];
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  habits,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || categories[0]?.id || 'focus');
  const [color, setColor] = useState(initialData?.color || PRESET_COLORS[1]);
  const [icon, setIcon] = useState(initialData?.icon || 'Target');
  const [targetDate, setTargetDate] = useState(initialData?.targetDate || '');
  const [status, setStatus] = useState<'active' | 'completed' | 'paused'>(initialData?.status || 'active');
  const [linkedHabitIds, setLinkedHabitIds] = useState<string[]>(initialData?.linkedHabitIds || []);

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>(initialData?.milestones || []);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestones([
      ...milestones,
      {
        id: `m-${Date.now()}`,
        title: newMilestoneTitle.trim(),
        completed: false,
      },
    ]);
    setNewMilestoneTitle('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const toggleLinkedHabit = (habitId: string) => {
    setLinkedHabitIds((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      color,
      icon,
      targetDate: targetDate || undefined,
      status,
      milestones,
      linkedHabitIds,
    });
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
              style={{ backgroundColor: `${color}25`, color, border: `1px solid ${color}50` }}
            >
              <IconRenderer name={icon} size={20} color={color} />
            </div>
            <div>
              <h2 id="goal-modal-title" className="text-xl font-bold text-white">
                {initialData ? 'Edit Goal' : 'Create Long-Term Goal'}
              </h2>
              <p className="text-xs text-slate-400">Define milestones & link daily routines</p>
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
              Goal Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Full-Stack Architecture, Run a Half Marathon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-brand-500 rounded-xl text-white text-sm outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Purpose & Motivation (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Why is this goal important to you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 focus:border-brand-500 rounded-xl text-white text-sm outline-none resize-none transition"
            />
          </div>

          {/* Target Date & Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none cursor-pointer"
              />
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
                onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'paused')}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Color & Icon Pickers */}
          <div className="space-y-3 p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                      color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Icon
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {AVAILABLE_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      icon === iconName
                        ? 'bg-brand-500 text-slate-950 shadow'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <IconRenderer name={iconName} size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Milestones Builder */}
          <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              Key Results & Milestones ({milestones.filter((m) => m.completed).length}/{milestones.length})
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add major milestone..."
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMilestone();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 inline mr-1" />
                Add
              </button>
            </div>

            {milestones.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={m.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {m.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(m.id)}
                      className="text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Link Existing Habits to this Goal */}
          {habits.length > 0 && (
            <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                Link Daily Habits (Their consistency powers this goal)
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {habits.map((h) => {
                  const isLinked = linkedHabitIds.includes(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleLinkedHabit(h.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        isLinked
                          ? 'bg-brand-500 text-slate-950 font-bold shadow'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <IconRenderer name={h.icon} size={14} />
                      <span>{h.title}</span>
                    </button>
                  );
                })}
              </div>
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
              {initialData ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
