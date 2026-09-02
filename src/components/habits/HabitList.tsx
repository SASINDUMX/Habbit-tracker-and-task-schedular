import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Habit, TimeOfDay } from '../../types';
import { HabitCard } from './HabitCard';
import { HabitHeatmap } from './HabitHeatmap';
import { HabitModal } from './HabitModal';
import { formatDisplayDate, getTodayString } from '../../utils/dateUtils';
import {
  Sparkles,
  Plus,
  Calendar,
  Flame,
  CheckCircle2,
  Filter,
  Sun,
  Sunrise,
  Sunset,
  Clock,
} from 'lucide-react';

interface HabitListProps {
  onStartFocus?: (habit: Habit) => void;
}

export const HabitList: React.FC<HabitListProps> = ({ onStartFocus }) => {
  const {
    habits,
    logs,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    incrementHabitValue,
    getHabitLogForDate,
    selectedDate,
    setSelectedDate,
    categories,
    goals,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TimeOfDay | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const isToday = selectedDate === getTodayString();

  // Filter habits
  const filteredHabits = habits.filter((h) => {
    if (activeTab !== 'all' && h.timeOfDay !== activeTab) return false;
    if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;
    return true;
  });

  // Calculate day completion stats
  const completedTodayCount = habits.filter((h) => {
    const log = getHabitLogForDate(h.id, selectedDate);
    return log?.completed;
  }).length;

  const totalHabits = habits.length;
  const dayCompletionPercent =
    totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, data);
    } else {
      addHabit(data);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Day Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            Daily Habit Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build discipline with routines, numeric trackers, and visual streaks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker Control */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-brand-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer text-xs"
            />
            {!isToday && (
              <button
                onClick={() => setSelectedDate(getTodayString())}
                className="px-2 py-0.5 rounded-lg bg-brand-500/20 text-brand-400 font-semibold hover:bg-brand-500/30 transition cursor-pointer"
              >
                Today
              </button>
            )}
          </div>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Habit
          </button>
        </div>
      </div>

      {/* Progress & Quick Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isToday ? 'Today' : formatDisplayDate(selectedDate)} Progress
            </span>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {completedTodayCount} <span className="text-sm font-normal text-slate-400">/ {totalHabits} done</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-brand-400 text-sm font-mono">
            {dayCompletionPercent}%
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Routine
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              {habits.filter((h) => h.timeOfDay === 'morning').length} Morning •{' '}
              {habits.filter((h) => h.timeOfDay === 'evening').length} Night
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Historical Completions
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              {logs.filter((l) => l.completed).length} Total Logs
            </div>
          </div>
        </div>
      </div>

      {/* Routine Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800">
        {/* Time of Day Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Habits', icon: Clock },
            { id: 'morning', label: 'Morning', icon: Sunrise },
            { id: 'afternoon', label: 'Afternoon', icon: Sun },
            { id: 'evening', label: 'Evening', icon: Sunset },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TimeOfDay | 'all')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
          <p className="font-semibold text-white">No habits found in this view</p>
          <p className="text-xs text-slate-500 mt-1">
            Click &quot;New Habit&quot; to create one or adjust your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              log={getHabitLogForDate(habit.id, selectedDate)}
              allLogs={logs}
              onToggle={(id) => toggleHabitCompletion(id, selectedDate)}
              onIncrement={(id, delta) => incrementHabitValue(id, delta, selectedDate)}
              onEdit={handleEdit}
              onDelete={deleteHabit}
              onStartFocus={onStartFocus}
            />
          ))}
        </div>
      )}

      {/* Consistency Heatmap */}
      <div className="pt-2">
        <HabitHeatmap logs={logs} habits={habits} daysCount={90} />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <HabitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingHabit}
          categories={categories}
          goals={goals}
        />
      )}
    </div>
  );
};
