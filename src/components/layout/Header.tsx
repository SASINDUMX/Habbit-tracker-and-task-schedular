import React, { useState, useEffect } from 'react';
import { useAudioNotification } from '../../context/AudioNotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Volume2, VolumeX, Palette, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { soundEnabled, setSoundEnabled } = useAudioNotification();
  const { theme, setTheme, themesList } = useTheme();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextTheme = () => {
    const currentIdx = themesList.findIndex((t) => t.id === theme);
    const nextIdx = (currentIdx + 1) % themesList.length;
    setTheme(themesList[nextIdx].id);
  };

  return (
    <header className="h-16 glass-panel border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live Clock & Date */}
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <Clock className="w-4 h-4 text-brand-400 hidden sm:inline" />
          <span className="font-mono font-bold text-white text-sm">
            {format(currentTime, 'HH:mm:ss')}
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline font-medium text-slate-400">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Theme Cycle Button */}
        <button
          onClick={nextTheme}
          title={`Theme: ${theme}. Click to switch theme`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5 text-brand-400" />
          <span className="capitalize hidden sm:inline">{theme}</span>
        </button>

        {/* Master Sound Button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute Alarms & Chimes' : 'Enable Alarms & Chimes'}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            soundEnabled
              ? 'bg-brand-500/15 border-brand-500/30 text-brand-400'
              : 'bg-slate-800 border-slate-700 text-slate-500'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
