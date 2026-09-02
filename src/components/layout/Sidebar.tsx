import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Clock,
  Target,
  Bell,
  Flame,
  TrendingUp,
  Sliders,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export type NavTab = 'habits' | 'tasks' | 'goals' | 'reminders' | 'focus' | 'analytics' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { reminders, habits, tasks } = useApp();

  const enabledAlarmsCount = reminders.filter((r) => r.enabled).length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;

  const navItems = [
    { id: 'habits', label: 'Habit Engine', icon: Sparkles, badge: habits.length },
    { id: 'tasks', label: 'Task Scheduler', icon: Clock, badge: pendingTasksCount },
    { id: 'goals', label: 'Goals & Milestones', icon: Target },
    { id: 'reminders', label: 'Alarms & Reminders', icon: Bell, badge: enabledAlarmsCount, badgeColor: 'bg-red-500/20 text-red-400' },
    { id: 'focus', label: 'Focus Pomodoro', icon: Flame },
    { id: 'analytics', label: 'Analytics & Insights', icon: TrendingUp },
    { id: 'settings', label: 'Settings & Themes', icon: Sliders },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 glass-panel border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Compass className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Orbit <span className="text-brand-400 font-mono text-xs font-normal px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">OS</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Habits • Tasks • Alarms</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id as NavTab);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950 stroke-[2.5]' : ''}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isSelected
                        ? 'bg-slate-950 text-white'
                        : item.badgeColor || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
            <span>100% Offline & Private</span>
          </div>
        </div>
      </aside>
    </>
  );
};
