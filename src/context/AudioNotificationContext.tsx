import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Reminder, SoundType, AmbientSoundType } from '../types';
import {
  playSynthesizedSound,
  playCompletionPop,
  startAmbientSound,
  stopAmbientSound,
  updateAmbientVolume,
  unlockAudioContext,
} from '../utils/soundSynthesizer';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

interface AudioNotificationContextType {
  hasNotificationPermission: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  playSound: (sound: SoundType) => void;
  playCelebration: () => void;
  activeAlarm: Reminder | null;
  triggerAlarm: (reminder: Reminder) => void;
  triggerTestAlarm: () => void;
  dismissAlarm: () => void;
  snoozeAlarm: (minutes: number) => void;
  ambientSound: AmbientSoundType;
  setAmbientSound: (sound: AmbientSoundType) => void;
  ambientVolume: number;
  setAmbientVolume: (vol: number) => void;
  soundVolume: number;
  setSoundVolume: (vol: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const AudioNotificationContext = createContext<AudioNotificationContextType | undefined>(undefined);

export const AudioNotificationProvider: React.FC<{
  children: React.ReactNode;
  reminders: Reminder[];
  initialVolume?: number;
  initialSoundEnabled?: boolean;
}> = ({ children, reminders, initialVolume = 0.7, initialSoundEnabled = true }) => {
  const [hasNotificationPermission, setHasPermission] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const [activeAlarm, setActiveAlarm] = useState<Reminder | null>(null);
  const [soundVolume, setSoundVolume] = useState<number>(initialVolume);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialSoundEnabled);
  const [ambientSound, setAmbientSoundState] = useState<AmbientSoundType>('none');
  const [ambientVolume, setAmbientVolState] = useState<number>(0.3);

  const triggeredSetRef = useRef<Set<string>>(new Set());
  const alarmIntervalRef = useRef<number | null>(null);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      return granted;
    } catch {
      return false;
    }
  };

  const playSound = useCallback(
    (sound: SoundType) => {
      if (!soundEnabled) return;
      unlockAudioContext();
      playSynthesizedSound(sound, soundVolume);
    },
    [soundEnabled, soundVolume]
  );

  const playCelebration = useCallback(() => {
    if (soundEnabled) {
      unlockAudioContext();
      playCompletionPop(soundVolume);
    }
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // ignore
    }
  }, [soundEnabled, soundVolume]);

  const triggerAlarm = useCallback(
    (reminder: Reminder) => {
      unlockAudioContext();
      setActiveAlarm(reminder);
      playSound(reminder.sound || 'bell');

      // Loop chime every 3.5 seconds while alarm is active
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = window.setInterval(() => {
        playSound(reminder.sound || 'bell');
      }, 3500);

      // Trigger System Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`⏰ ${reminder.title}`, {
            body: reminder.description || 'Time for your scheduled routine or task!',
            icon: '/pwa-192x192.png',
            requireInteraction: true,
          });
        } catch {
          // ignore
        }
      }
    },
    [playSound]
  );

  const triggerTestAlarm = useCallback(() => {
    const testReminder: Reminder = {
      id: `test-${Date.now()}`,
      title: 'Test Alarm (Preview)',
      description: 'Your alarm sound, snooze controls, and notification are working perfectly!',
      type: 'alarm',
      time: format(new Date(), 'HH:mm'),
      sound: 'bell',
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    triggerAlarm(testReminder);
  }, [triggerAlarm]);

  const dismissAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setActiveAlarm(null);
  };

  const snoozeAlarm = (minutes: number) => {
    if (!activeAlarm) return;
    const snoozeTarget = new Date(Date.now() + minutes * 60 * 1000);
    const snoozeTimeStr = `${String(snoozeTarget.getHours()).padStart(2, '0')}:${String(
      snoozeTarget.getMinutes()
    ).padStart(2, '0')}`;

    const snoozedReminder: Reminder = {
      ...activeAlarm,
      id: `snooze-${Date.now()}`,
      time: snoozeTimeStr,
      description: `(Snoozed for ${minutes}m) ${activeAlarm.description || ''}`,
    };

    dismissAlarm();
    setTimeout(() => {
      triggerAlarm(snoozedReminder);
    }, minutes * 60 * 1000);
  };

  // Check reminders every 2.5 seconds against local device time
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const localTodayStr = format(now, 'yyyy-MM-dd'); // Local date, not UTC!
      const nowH = now.getHours();
      const nowM = now.getMinutes();
      const dayOfWeek = now.getDay();

      reminders.forEach((r) => {
        if (!r.enabled || !r.time) return;

        // Parse reminder time (supports "07:30" or "7:30")
        const timeParts = r.time.split(':').map((s) => parseInt(s.trim(), 10));
        if (timeParts.length < 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) return;
        const remH = timeParts[0];
        const remM = timeParts[1];

        // Key to prevent double firing in the same minute
        const triggerKey = `${r.id}-${localTodayStr}-${remH}-${remM}`;
        if (triggeredSetRef.current.has(triggerKey)) return;

        // 1. One-off date check
        if (r.date && r.date !== localTodayStr) return;

        // 2. Specific days check
        if (r.recurring?.type === 'specific_days' && r.recurring.days) {
          if (!r.recurring.days.includes(dayOfWeek)) return;
        }

        // 3. Time comparison
        if (remH === nowH && remM === nowM) {
          triggeredSetRef.current.add(triggerKey);
          triggerAlarm(r);
        }
      });
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 2500); // 2.5s ticker
    return () => clearInterval(interval);
  }, [reminders, triggerAlarm]);

  // Ambient sound controller
  const setAmbientSound = (type: AmbientSoundType) => {
    setAmbientSoundState(type);
    if (type === 'none') {
      stopAmbientSound();
    } else {
      unlockAudioContext();
      startAmbientSound(type, ambientVolume);
    }
  };

  const setAmbientVolume = (vol: number) => {
    setAmbientVolState(vol);
    updateAmbientVolume(vol);
  };

  return (
    <AudioNotificationContext.Provider
      value={{
        hasNotificationPermission,
        requestNotificationPermission,
        playSound,
        playCelebration,
        activeAlarm,
        triggerAlarm,
        triggerTestAlarm,
        dismissAlarm,
        snoozeAlarm,
        ambientSound,
        setAmbientSound,
        ambientVolume,
        setAmbientVolume,
        soundVolume,
        setSoundVolume,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </AudioNotificationContext.Provider>
  );
};

export function useAudioNotification() {
  const context = useContext(AudioNotificationContext);
  if (!context) {
    throw new Error('useAudioNotification must be used within AudioNotificationProvider');
  }
  return context;
}
