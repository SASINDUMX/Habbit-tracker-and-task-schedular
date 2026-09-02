import React from 'react';
import { useAudioNotification } from '../../context/AudioNotificationContext';
import { useApp } from '../../context/AppContext';
import { Bell, Clock, CheckCircle2, X } from 'lucide-react';
import { formatTimeDisplay } from '../../utils/dateUtils';

export const AlarmTriggerModal: React.FC = () => {
  const { activeAlarm, dismissAlarm, snoozeAlarm } = useAudioNotification();
  const { toggleHabitCompletion, toggleTaskStatus } = useApp();

  if (!activeAlarm) return null;

  const handleCompleteAndDismiss = () => {
    if (activeAlarm.sourceId) {
      if (activeAlarm.sourceId.startsWith('h-')) {
        toggleHabitCompletion(activeAlarm.sourceId);
      } else if (activeAlarm.sourceId.startsWith('t-')) {
        toggleTaskStatus(activeAlarm.sourceId);
      }
    }
    dismissAlarm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-brand-500/40 bg-slate-900/95 p-8 shadow-2xl shadow-brand-500/20 text-center">
        {/* Glowing Pulsing Ring */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        {/* Bell Animation */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-lg shadow-brand-500/20 animate-bounce">
          <Bell className="w-12 h-12 text-brand-400 animate-ring-alarm" />
        </div>

        <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/30 rounded-full">
          Scheduled Alarm Alert
        </span>

        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
          {activeAlarm.title}
        </h3>

        {activeAlarm.description && (
          <p className="text-sm text-slate-300 mb-6 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            {activeAlarm.description}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-8">
          <Clock className="w-4 h-4" />
          <span>Scheduled at {formatTimeDisplay(activeAlarm.time)}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCompleteAndDismiss}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-slate-950 font-semibold rounded-2xl shadow-lg shadow-brand-500/30 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            Mark Complete & Dismiss
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => snoozeAlarm(5)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              Snooze 5 min
            </button>
            <button
              onClick={() => snoozeAlarm(10)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              Snooze 10 min
            </button>
          </div>

          <button
            onClick={dismissAlarm}
            className="flex items-center justify-center gap-1 py-2 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer mt-1"
          >
            <X className="w-4 h-4" />
            Dismiss Alert
          </button>
        </div>
      </div>
    </div>
  );
};
