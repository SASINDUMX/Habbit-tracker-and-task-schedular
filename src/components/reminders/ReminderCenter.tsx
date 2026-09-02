import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAudioNotification } from '../../context/AudioNotificationContext';
import { Reminder } from '../../types';
import { ReminderModal } from './ReminderModal';
import { formatTimeDisplay } from '../../utils/dateUtils';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Volume2,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const ReminderCenter: React.FC = () => {
  const { reminders, addReminder, updateReminder, deleteReminder, toggleReminder } = useApp();
  const {
    hasNotificationPermission,
    requestNotificationPermission,
    playSound,
    triggerTestAlarm,
    soundVolume,
    setSoundVolume,
    soundEnabled,
    setSoundEnabled,
  } = useAudioNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const handleEdit = (r: Reminder) => {
    setEditingReminder(r);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<Reminder, 'id' | 'createdAt'>) => {
    if (editingReminder) {
      updateReminder(editingReminder.id, data);
    } else {
      addReminder(data);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Bell className="w-6 h-6" />
            </div>
            Alarms & Reminders Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Custom scheduled alarms, recurring habit reminders, and browser audio alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerTestAlarm}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs rounded-xl transition cursor-pointer"
            title="Preview the full alarm alert modal and audio chime right now"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            Test Alarm Alert
          </button>

          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Alarm
          </button>
        </div>
      </div>

      {/* Permission & Sound Settings Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Browser Permission Card */}
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                hasNotificationPermission
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {hasNotificationPermission ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                Browser Desktop Notifications
              </div>
              <div className="text-xs text-slate-400">
                {hasNotificationPermission
                  ? 'System alerts enabled & active'
                  : 'Enable desktop notifications for background tabs'}
              </div>
            </div>
          </div>

          {!hasNotificationPermission && (
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg transition cursor-pointer shrink-0"
            >
              Grant Permission
            </button>
          )}
        </div>

        {/* Audio Volume & Toggle Card */}
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl transition cursor-pointer ${
                soundEnabled
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div>
              <div className="text-sm font-semibold text-white">Master Sound Engine</div>
              <div className="text-xs text-slate-400">
                {soundEnabled ? 'Synthesized Web Audio enabled' : 'Muted'}
              </div>
            </div>
          </div>

          {soundEnabled && (
            <div className="flex items-center gap-2 w-32">
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={soundVolume}
                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <span className="text-xs text-slate-400 w-8 text-right">
                {Math.round(soundVolume * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
            <p className="font-semibold text-white">No active alarms or reminders</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Add New Alarm&quot; to configure your daily time alerts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className={`glass-panel p-5 rounded-2xl transition-all duration-200 border ${
                  rem.enabled
                    ? 'border-slate-700/80 hover:border-slate-600'
                    : 'border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                        rem.type === 'alarm'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : rem.type === 'habit_ping'
                          ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {rem.type === 'alarm' ? 'Alarm' : rem.type === 'habit_ping' ? 'Habit Ping' : 'Reminder'}
                    </span>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleReminder(rem.id)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition duration-200 cursor-pointer ${
                      rem.enabled ? 'bg-brand-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition" />
                  </button>
                </div>

                {/* Main Time & Title */}
                <div className="mb-3">
                  <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5 font-mono">
                    {formatTimeDisplay(rem.time)}
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 mt-1 line-clamp-1">
                    {rem.title}
                  </h3>
                  {rem.description && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {rem.description}
                    </p>
                  )}
                </div>

                {/* Schedule Info */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {rem.recurring
                      ? rem.recurring.type === 'daily'
                        ? 'Repeats Daily'
                        : 'Custom Days'
                      : rem.date
                      ? `Once on ${rem.date}`
                      : 'One-off'}
                  </span>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <button
                    onClick={() => playSound(rem.sound || 'bell')}
                    className="flex items-center gap-1 text-slate-400 hover:text-brand-400 transition cursor-pointer"
                    title="Test play audio chime"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Sound</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(rem)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteReminder(rem.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ReminderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingReminder}
        />
      )}
    </div>
  );
};
