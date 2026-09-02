import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Goal } from '../../types';
import { GoalCard } from './GoalCard';
import { GoalModal } from './GoalModal';
import { Target, Plus, Sparkles, Filter, Award } from 'lucide-react';

export const GoalList: React.FC = () => {
  const { goals, habits, logs, addGoal, updateGoal, deleteGoal, toggleMilestone, categories } =
    useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredGoals = goals.filter((g) => {
    if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
    return true;
  });

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<Goal, 'id' | 'createdAt'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
    } else {
      addGoal(data);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Target className="w-6 h-6" />
            </div>
            Long-Term Goals & Milestones
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect high-level vision to actionable milestones and daily habits.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
          <p className="font-semibold text-white">No active goals yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Set ambitious targets and link habits to track continuous progress.
          </p>
          <button
            onClick={handleAddNew}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-brand-500 text-slate-950 rounded-xl hover:bg-brand-600 transition cursor-pointer"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              allHabits={habits}
              allLogs={logs}
              onToggleMilestone={toggleMilestone}
              onEditGoal={handleEdit}
              onDeleteGoal={deleteGoal}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <GoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingGoal}
          categories={categories}
          habits={habits}
        />
      )}
    </div>
  );
};
