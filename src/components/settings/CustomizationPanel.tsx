import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useAudioNotification } from '../../context/AudioNotificationContext';
import { SoundType } from '../../types';
import { AVAILABLE_ICONS, PRESET_COLORS, IconRenderer } from '../common/IconRenderer';
import {
  Palette,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  FolderPlus,
  Trash2,
  Check,
  ShieldAlert,
} from 'lucide-react';

export const CustomizationPanel: React.FC = () => {
  const { theme, setTheme, themesList } = useTheme();
  const {
    settings,
    updateSettings,
    categories,
    addCategory,
    deleteCategory,
    exportData,
    importBackupData,
    resetToDefaults,
  } = useApp();

  const { playSound, soundVolume, setSoundVolume, soundEnabled, setSoundEnabled } =
    useAudioNotification();

  // Category creator state
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      icon: newCatIcon,
    });
    setNewCatName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupData(content);
        if (success) {
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          Settings & Customization
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Personalize themes, custom sound alerts, habit tags, and manage local data backups.
        </p>
      </div>

      {/* Theme Picker */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-brand-400" />
          Visual Theme Suite
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {themesList.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3.5 rounded-2xl border text-left transition transform hover:scale-[1.02] cursor-pointer flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
                style={{ backgroundColor: isSelected ? undefined : t.bgPreview }}
              >
                <div className="flex items-center justify-between">
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.accentColor }} />
                  {isSelected && <Check className="w-4 h-4 text-brand-400 stroke-[3]" />}
                </div>

                <div>
                  <div className="text-xs font-bold text-white">{t.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{t.id} mode</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timer & Focus Configurations */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-400" />
          Focus & Pomodoro Timer Durations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-semibold">
              Work Focus Duration (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={settings.pomodoroWorkMinutes}
              onChange={(e) => updateSettings({ pomodoroWorkMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-semibold">
              Short Break (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.pomodoroBreakMinutes}
              onChange={(e) => updateSettings({ pomodoroBreakMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-semibold">
              Long Break (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.pomodoroLongBreakMinutes}
              onChange={(e) => updateSettings({ pomodoroLongBreakMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Custom Categories & Tags Manager */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FolderPlus className="w-4 h-4 text-brand-400" />
          Categories & Tags
        </h3>

        {/* Existing Categories List */}
        <div className="flex flex-wrap gap-2.5">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
            >
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: `${c.color}30`, color: c.color }}
              >
                <IconRenderer name={c.icon} size={12} color={c.color} />
              </div>
              <span className="font-medium">{c.name}</span>
              {categories.length > 1 && (
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="text-slate-500 hover:text-red-400 transition ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Create Category Form */}
        <form onSubmit={handleAddCategory} className="pt-3 border-t border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-300">Add New Category</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Category name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none"
            />

            {/* Colors */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setNewCatColor(col)}
                  className={`w-6 h-6 rounded-full shrink-0 transition ${
                    newCatColor === col ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              + Create Category
            </button>
          </div>
        </form>
      </div>

      {/* Data Backup, Export & Factory Reset */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-brand-400" />
          Data Portability & Offline Backup
        </h3>
        <p className="text-xs text-slate-400">
          All your habits, schedules, and logs are stored locally on your device for complete privacy.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-brand-400" />
            Export JSON Backup
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            Restore From Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data back to initial defaults?')) {
                resetToDefaults();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/30 transition cursor-pointer ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default Templates
          </button>
        </div>
      </div>
    </div>
  );
};
