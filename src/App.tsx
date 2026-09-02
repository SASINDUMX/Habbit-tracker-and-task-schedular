import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { AudioNotificationProvider } from './context/AudioNotificationContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { HabitList } from './components/habits/HabitList';
import { TaskManager } from './components/tasks/TaskManager';
import { GoalList } from './components/goals/GoalList';
import { ReminderCenter } from './components/reminders/ReminderCenter';
import { PomodoroTimer } from './components/focus/PomodoroTimer';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { CustomizationPanel } from './components/settings/CustomizationPanel';
import { AlarmTriggerModal } from './components/reminders/AlarmTriggerModal';
import { Habit, Task } from './types';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('habits');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Focus context transfer
  const [focusHabit, setFocusHabit] = useState<Habit | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  const handleStartHabitFocus = (habit: Habit) => {
    setFocusHabit(habit);
    setActiveTab('focus');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Alarm Sound Trigger Modal (fires when any scheduled alarm alerts) */}
      <AlarmTriggerModal />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'habits' && <HabitList onStartFocus={handleStartHabitFocus} />}
            {activeTab === 'tasks' && <TaskManager />}
            {activeTab === 'goals' && <GoalList />}
            {activeTab === 'reminders' && <ReminderCenter />}
            {activeTab === 'focus' && (
              <PomodoroTimer initialHabit={focusHabit} initialTask={focusTask} />
            )}
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            {activeTab === 'settings' && <CustomizationPanel />}
          </div>
        </main>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const { reminders, settings } = useApp();

  return (
    <AudioNotificationProvider
      reminders={reminders}
      initialVolume={settings.alarmVolume}
      initialSoundEnabled={settings.soundEnabled}
    >
      <MainLayout />
    </AudioNotificationProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}
