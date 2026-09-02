import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Reminder, SoundType, AmbientSoundType } from '../types';
import { playSynthesizedSound, playCompletionPop, startAmbientSound, stopAmbientSound, updateAmbientVolume } from '../utils/soundSynthesizer';
import confetti from 'canvas-confetti';

interface AudioNotificationContextType {
  hasNotificationPermission: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  playSound: (sound: SoundType) => void;
  playCelebration: () => void;
  activeAlarm: Reminder | null;
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

  const playSound = useCallback((sound: SoundType) => {
    if (!soundEnabled) return;
    playSynthesizedSound(sound, soundVolume);
  }, [soundEnabled, soundVolume]);

  const playCelebration = useCallback(() => {
    if (soundEnabled) {
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

  const triggerAlarm = useCallback((reminder: Reminder) => {
    setActiveAlarm(reminder);
    playSound(reminder.sound || 'bell');

    // Also trigger repeating chime while alarm is active
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = window.setInterval(() => {
      playSound(reminder.sound || 'bell');
    }, 4000);

    // Trigger System Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ ${reminder.title}`, {
          body: reminder.description || 'Time for your scheduled routine or task!',
          icon: '/favicon.svg',
          requireInteraction: true,
        });
      } catch {
        // ignore
      }
    }
  }, [playSound]);

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
    const snoozeTimeStr = `${String(snoozeTarget.getHours()).padStart(2, '0')}:${String(snoozeTarget.getMinutes()).padStart(2, '0')}`;
    
    // Temporarily register a snoozed alert key
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

  // Check reminders every 10 seconds against current time
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayDateStr = now.toISOString().split('T')[0];
      const dayOfWeek = now.getDay();

      reminders.forEach((r) => {
        if (!r.enabled) return;

        // Form unique key for today to avoid double firing within the same minute
        const triggerKey = `${r.id}-${todayDateStr}-${currentHHMM}`;
        if (triggeredSetRef.current.has(triggerKey)) return;

        // Check if date or day matches
        if (r.date && r.date !== todayDateStr) return;

        if (r.recurring?.type === 'specific_days' && r.recurring.days) {
          if (!r.recurring.days.includes(dayOfWeek)) return;
        }

        if (r.time === currentHHMM) {
          triggeredSetRef.current.add(triggerKey);
          triggerAlarm(r);
        }
      });
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 10000);
    return () => clearInterval(interval);
  }, [reminders, triggerAlarm]);

  // Ambient sound controller
  const setAmbientSound = (type: AmbientSoundType) => {
    setAmbientSoundState(type);
    if (type === 'none') {
      stopAmbientSound();
    } else {
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
