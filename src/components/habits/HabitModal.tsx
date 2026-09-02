import React, { useState, useEffect } from 'react';
import { Habit, HabitType, TimeOfDay, Category, Goal } from '../../types';
import { IconRenderer, AVAILABLE_ICONS, PRESET_COLORS } from '../common/IconRenderer';
import { X, Check, Clock, Sparkles } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  initialData?: Habit | null;
  categories: Category[];
  goals: Goal[];
}

const DAYS_OF_WEEK = [
  { label: 'Sun', day: 0 },
  { label: 'Mon', day: 1 },
  { label: 'Tue', day: 2 },
  { label: 'Wed', day: 3 },
  { label: 'Thu', day: 4 },
  { label: 'Fri', day: 5 },
  { label: 'Sat', day: 6 },
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  goals,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || categories[0]?.id || 'habits');
  const [color, setColor] = useState(initialData?.color || PRESET_COLORS[0]);
  const [icon, setIcon] = useState(initialData?.icon || 'Sparkles');
  const [type, setType] = useState<HabitType>(initialData?.type || 'boolean');
  const [targetValue, setTargetValue] = useState<number>(initialData?.targetValue || (initialData?.type === 'timer' ? 30 : 8));
  const [unit, setUnit] = useState(initialData?.unit || 'times');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(initialData?.timeOfDay || 'morning');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'specific_days'>(
    initialData?.frequency.type === 'specific_days' ? 'specific_days' : 'daily'
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialData?.frequency.days || [1, 2, 3, 4, 5]
  );
  const [hasReminder, setHasReminder] = useState(!!initialData?.reminderTime);
  const [reminderTime, setReminderTime] = useState(initialData?.reminderTime || '08:00');
  const [goalId, setGoalId] = useState(initialData?.goalId || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      color,
      icon,
      type,
      targetValue: type === 'boolean' ? undefined : Number(targetValue),
      unit: type === 'boolean' ? undefined : unit,
      frequency: {
        type: frequencyType,
        days: frequencyType === 'specific_days' ? selectedDays : undefined,
      },
      timeOfDay,
      reminderTime: hasReminder ? reminderTime : undefined,
      goalId: goalId || undefined,
    });
    onClose();
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
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
      aria-labelledby="habit-modal-title"
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
              <h2 id="habit-modal-title" className="text-xl font-bold text-white">
                {initialData ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <p className="text-xs text-slate-400">Design your daily routine & tracking rules</p>
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
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Read 20 Pages, Drink 2L Water, Morning Meditation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-brand-500 rounded-xl text-white text-sm outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Why or How? (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Right after making morning coffee"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-brand-500 rounded-xl text-white text-sm outline-none transition"
            />
          </div>

          {/* Habit Tracking Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Tracking Metric Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'boolean', label: 'Done / Not Done', desc: 'Simple checkbox' },
                { id: 'number', label: 'Numeric Goal', desc: 'Quantity target (ml, pages)' },
                { id: 'timer', label: 'Time Duration', desc: 'Minutes target' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id as HabitType);
                    if (t.id === 'timer') {
                      setUnit('mins');
                      setTargetValue(30);
                    } else if (t.id === 'number') {
                      setUnit('times');
                      setTargetValue(5);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    type === t.id
                      ? 'border-brand-500 bg-brand-500/10 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200">{t.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Numeric Target Settings */}
          {type !== 'boolean' && (
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Value</label>
                <input
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Unit Label</label>
                <input
                  type="text"
                  placeholder="e.g. ml, pages, mins, km"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none"
                />
              </div>
            </div>
          )}

          {/* Category & Time of Day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none cursor-pointer"
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
                Routine Section
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none capitalize cursor-pointer"
              >
                <option value="morning">Morning Routine</option>
                <option value="afternoon">Afternoon Focus</option>
                <option value="evening">Evening Wind-Down</option>
                <option value="anytime">Anytime / All Day</option>
              </select>
            </div>
          </div>

          {/* Frequency */}
          <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Frequency
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setFrequencyType('daily')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                    frequencyType === 'daily'
                      ? 'bg-brand-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  Every Day
                </button>
                <button
                  type="button"
                  onClick={() => setFrequencyType('specific_days')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                    frequencyType === 'specific_days'
                      ? 'bg-brand-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  Specific Days
                </button>
              </div>
            </div>

            {frequencyType === 'specific_days' && (
              <div className="flex justify-between gap-1 pt-1">
                {DAYS_OF_WEEK.map(({ label, day }) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedDays.includes(day)
                        ? 'bg-brand-500 text-slate-950 shadow'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color & Icon Pickers */}
          <div className="space-y-3 p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Color Theme
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
                Icon Selector
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
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

          {/* Optional Reminder Alarm */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-brand-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Daily Alarm Reminder</div>
                <div className="text-[10px] text-slate-400">Play audio chime & popup at fixed time</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasReminder && (
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white outline-none cursor-pointer"
                />
              )}
              <button
                type="button"
                onClick={() => setHasReminder(!hasReminder)}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition duration-200 cursor-pointer ${
                  hasReminder ? 'bg-brand-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition" />
              </button>
            </div>
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
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none cursor-pointer"
              >
                <option value="">None (Independent Habit)</option>
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
              {initialData ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
