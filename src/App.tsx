import React, { useState, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { AudioNotificationProvider } from './context/AudioNotificationContext';
import { PwaProvider } from './context/PwaContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AlarmTriggerModal } from './components/reminders/AlarmTriggerModal';
import { IOSInstallModal } from './components/common/IOSInstallModal';
import { ScreenLoader } from './components/common/ScreenLoader';
import { Habit, Task } from './types';

// Code-split screens with dynamic imports to minimize initial bundle size
const DashboardOverview = lazy(() =>
  import('./components/dashboard/DashboardOverview').then((m) => ({ default: m.DashboardOverview }))
);
const HabitList = lazy(() =>
  import('./components/habits/HabitList').then((m) => ({ default: m.HabitList }))
);
const TaskManager = lazy(() =>
  import('./components/tasks/TaskManager').then((m) => ({ default: m.TaskManager }))
);
const GoalList = lazy(() =>
  import('./components/goals/GoalList').then((m) => ({ default: m.GoalList }))
);
const ReminderCenter = lazy(() =>
  import('./components/reminders/ReminderCenter').then((m) => ({ default: m.ReminderCenter }))
);
const PomodoroTimer = lazy(() =>
  import('./components/focus/PomodoroTimer').then((m) => ({ default: m.PomodoroTimer }))
);
const AnalyticsDashboard = lazy(() =>
  import('./components/analytics/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard }))
);
const CustomizationPanel = lazy(() =>
  import('./components/settings/CustomizationPanel').then((m) => ({ default: m.CustomizationPanel }))
);

const getInitialTab = (): NavTab => {
  if (typeof window !== 'undefined') {
    const tabParam = new URLSearchParams(window.location.search).get('tab');
    if (tabParam && ['dashboard', 'habits', 'tasks', 'goals', 'reminders', 'focus', 'analytics', 'settings'].includes(tabParam)) {
      return tabParam as NavTab;
    }
  }
  return 'dashboard';
};

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<NavTab>(getInitialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Focus context transfer
  const [focusHabit, setFocusHabit] = useState<Habit | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  const handleStartHabitFocus = (habit: Habit) => {
    setFocusHabit(habit);
    setActiveTab('focus');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      {/* Alarm Sound Trigger Modal (fires when any scheduled alarm alerts) */}
      <AlarmTriggerModal />

      {/* iOS PWA Installation Guide Modal */}
      <IOSInstallModal />

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
            <Suspense fallback={<ScreenLoader />}>
              {activeTab === 'dashboard' && (
                <DashboardOverview
                  onNavigateTab={setActiveTab}
                  onStartFocusHabit={handleStartHabitFocus}
                />
              )}
              {activeTab === 'habits' && <HabitList onStartFocus={handleStartHabitFocus} />}
              {activeTab === 'tasks' && <TaskManager />}
              {activeTab === 'goals' && <GoalList />}
              {activeTab === 'reminders' && <ReminderCenter />}
              {activeTab === 'focus' && (
                <PomodoroTimer initialHabit={focusHabit} initialTask={focusTask} />
              )}
              {activeTab === 'analytics' && <AnalyticsDashboard />}
              {activeTab === 'settings' && <CustomizationPanel />}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const { reminders, settings } = useApp();

  return (
    <PwaProvider>
      <AudioNotificationProvider
        reminders={reminders}
        initialVolume={settings.alarmVolume}
        initialSoundEnabled={settings.soundEnabled}
      >
        <MainLayout />
      </AudioNotificationProvider>
    </PwaProvider>
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
