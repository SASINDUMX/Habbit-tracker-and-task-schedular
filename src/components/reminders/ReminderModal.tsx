import React, { useState, useEffect } from 'react';
import { Reminder, SoundType } from '../../types';
import { useAudioNotification } from '../../context/AudioNotificationContext';
import { X, Volume2, Bell, Clock, Calendar, Check } from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  initialData?: Reminder | null;
}

const SOUND_OPTIONS: { id: SoundType; name: string; description: string }[] = [
  { id: 'bell', name: 'Melodic Chime', description: 'Harmonic 4-note bell' },
  { id: 'zen', name: 'Zen Singing Bowl', description: 'Deep resonant Tibetan bowl' },
  { id: 'synth', name: 'Cyberpunk Synth', description: 'Futuristic sweep chord' },
  { id: 'energetic', name: 'Energetic Alarm', description: 'Rapid 3-tone burst' },
  { id: 'radar', name: 'Sonar Ping', description: 'Subtle radar frequency' },
  { id: 'gentle', name: 'Gentle Pluck', description: 'Warm acoustic marimba' },
];

const DAYS_OF_WEEK = [
  { label: 'S', day: 0 },
  { label: 'M', day: 1 },
  { label: 'T', day: 2 },
  { label: 'W', day: 3 },
  { label: 'T', day: 4 },
  { label: 'F', day: 5 },
  { label: 'S', day: 6 },
];

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { playSound } = useAudioNotification();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [time, setTime] = useState(initialData?.time || '08:00');
  const [date, setDate] = useState(initialData?.date || getTodayString());
  const [isRecurring, setIsRecurring] = useState(!!initialData?.recurring);
  const [recurringType, setRecurringType] = useState<'daily' | 'specific_days'>(
    initialData?.recurring?.type === 'specific_days' ? 'specific_days' : 'daily'
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialData?.recurring?.days || [1, 2, 3, 4, 5]
  );
  const [sound, setSound] = useState<SoundType>(initialData?.sound || 'bell');
  const [type, setType] = useState<'alarm' | 'reminder'>(initialData?.type === 'alarm' ? 'alarm' : 'reminder');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      time,
      date: isRecurring ? undefined : date,
      recurring: isRecurring
        ? {
            type: recurringType,
            days: recurringType === 'specific_days' ? selectedDays : undefined,
          }
        : undefined,
      sound,
      type,
      enabled: true,
      sourceId: initialData?.sourceId,
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

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <Bell className="w-5 h-5" />
            </div>
            <h2 id="reminder-modal-title" className="text-xl font-bold">
              {initialData ? 'Edit Reminder / Alarm' : 'Create Reminder / Alarm'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Drink Water, Morning Kickoff, Focus Sprint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-brand-500 rounded-xl text-white text-sm outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Add extra instructions or tips"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-brand-500 rounded-xl text-white text-sm outline-none transition"
            />
          </div>

          {/* Time & Alert Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Time
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-brand-500 rounded-xl text-white text-sm outline-none transition cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Alert Mode
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setType('alarm')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    type === 'alarm'
                      ? 'bg-brand-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Alarm
                </button>
                <button
                  type="button"
                  onClick={() => setType('reminder')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    type === 'reminder'
                      ? 'bg-brand-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Chime
                </button>
              </div>
            </div>
          </div>

          {/* Recurring Options */}
          <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">Repeat Alert</span>
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
                  isRecurring ? 'bg-brand-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition" />
              </button>
            </div>

            {!isRecurring ? (
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Specific Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none"
                />
              </div>
            ) : (
              <div className="space-y-2 pt-1 border-t border-slate-700/50">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRecurringType('daily')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition cursor-pointer ${
                      recurringType === 'daily'
                        ? 'bg-slate-700 text-brand-400 border border-brand-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Every Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurringType('specific_days')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition cursor-pointer ${
                      recurringType === 'specific_days'
                        ? 'bg-slate-700 text-brand-400 border border-brand-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Custom Days
                  </button>
                </div>

                {recurringType === 'specific_days' && (
                  <div className="flex justify-between gap-1 pt-2">
                    {DAYS_OF_WEEK.map(({ label, day }) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                          selectedDays.includes(day)
                            ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sound Selector with Preview */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Alarm Sound Chime
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SOUND_OPTIONS.map((snd) => (
                <div
                  key={snd.id}
                  onClick={() => setSound(snd.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    sound === snd.id
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate">{snd.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{snd.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound(snd.id);
                    }}
                    title="Preview Sound"
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-brand-500 hover:text-slate-950 text-slate-300 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
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
              {initialData ? 'Save Changes' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
