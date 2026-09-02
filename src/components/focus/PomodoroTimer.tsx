import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAudioNotification } from '../../context/AudioNotificationContext';
import { AmbientSoundType, Task, Habit } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  CloudRain,
  Radio,
  Sparkles,
  Coffee,
} from 'lucide-react';

interface PomodoroTimerProps {
  initialTask?: Task | null;
  initialHabit?: Habit | null;
}

type TimerMode = 'work' | 'short_break' | 'long_break';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ initialTask, initialHabit }) => {
  const { settings, tasks, habits, addFocusSession, incrementHabitValue } = useApp();
  const {
    playSound,
    playCelebration,
    ambientSound,
    setAmbientSound,
    ambientVolume,
    setAmbientVolume,
  } = useAudioNotification();

  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(settings.pomodoroWorkMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTask?.id || '');
  const [selectedHabitId, setSelectedHabitId] = useState<string>(initialHabit?.id || '');

  const totalDuration =
    mode === 'work'
      ? settings.pomodoroWorkMinutes * 60
      : mode === 'short_break'
      ? settings.pomodoroBreakMinutes * 60
      : settings.pomodoroLongBreakMinutes * 60;

  const intervalRef = useRef<number | null>(null);

  // Sync mode changes with time
  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'work') setTimeLeft(settings.pomodoroWorkMinutes * 60);
    if (newMode === 'short_break') setTimeLeft(settings.pomodoroBreakMinutes * 60);
    if (newMode === 'long_break') setTimeLeft(settings.pomodoroLongBreakMinutes * 60);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer Finished!
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            playSound('bell');
            playCelebration();

            // Record focus session
            const durationMins =
              mode === 'work'
                ? settings.pomodoroWorkMinutes
                : mode === 'short_break'
                ? settings.pomodoroBreakMinutes
                : settings.pomodoroLongBreakMinutes;

            addFocusSession({
              taskId: selectedTaskId || undefined,
              habitId: selectedHabitId || undefined,
              durationMinutes: durationMins,
              completed: true,
              timestamp: new Date().toISOString(),
              mode: mode === 'work' ? 'pomodoro' : mode,
            });

            // Increment habit if attached
            if (selectedHabitId && mode === 'work') {
              incrementHabitValue(selectedHabitId, durationMins);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, settings, playSound, playCelebration, addFocusSession, incrementHabitValue, selectedTaskId, selectedHabitId]);

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(settings.pomodoroWorkMinutes * 60);
    if (mode === 'short_break') setTimeLeft(settings.pomodoroBreakMinutes * 60);
    if (mode === 'long_break') setTimeLeft(settings.pomodoroLongBreakMinutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <Flame className="w-6 h-6 text-brand-400 fill-brand-400" />
          Focus & Pomodoro Studio
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep work blocks paired with synthesized ambient sounds and habit logging.
        </p>
      </div>

      {/* Main Timer Display Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mode Selector */}
        <div className="inline-flex p-1 bg-slate-900 border border-slate-700/80 rounded-2xl relative z-10">
          <button
            onClick={() => handleModeChange('work')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
              mode === 'work'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deep Focus ({settings.pomodoroWorkMinutes}m)
          </button>
          <button
            onClick={() => handleModeChange('short_break')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
              mode === 'short_break'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Short Break ({settings.pomodoroBreakMinutes}m)
          </button>
          <button
            onClick={() => handleModeChange('long_break')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
              mode === 'long_break'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Long Break ({settings.pomodoroLongBreakMinutes}m)
          </button>
        </div>

        {/* Big Digital Clock & Circular Progress */}
        <div className="relative z-10 py-4">
          <div className="text-7xl sm:text-8xl font-black text-white font-mono tracking-tighter drop-shadow-md">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="w-64 mx-auto h-2 bg-slate-800 rounded-full overflow-hidden mt-6 border border-slate-700/40">
            <div
              className="h-full bg-brand-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 relative z-10">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base shadow-lg transition transform active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30'
                : 'bg-brand-500 hover:bg-brand-600 text-slate-950 shadow-brand-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950" />}
            <span>{isRunning ? 'Pause Session' : 'Start Focus'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer border border-slate-700"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Task or Habit Attachment */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left relative z-10">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Attach to Task
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="">No task attached</option>
              {tasks
                .filter((t) => t.status !== 'completed')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Attach to Habit
            </label>
            <select
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="">No habit attached</option>
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title} ({h.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Synthesized Ambient Noise Engine */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Synthesized Ambient Background Sound
            </span>
          </div>

          {ambientSound !== 'none' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Volume:</span>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-24 accent-brand-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'none', label: 'Mute Audio', icon: VolumeX },
            { id: 'rain', label: 'Gentle Rain', icon: CloudRain },
            { id: 'binaural', label: 'Alpha Wave 10Hz', icon: Radio },
            { id: 'zen_drone', label: 'Tibetan Drone', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = ambientSound === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAmbientSound(item.id as AmbientSoundType)}
                className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'border-brand-500 bg-brand-500/15 text-brand-300 shadow'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
