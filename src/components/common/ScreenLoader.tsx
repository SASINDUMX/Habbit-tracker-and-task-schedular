import React from 'react';
import { Compass } from 'lucide-react';

export const ScreenLoader: React.FC = () => {
  return (
    <div className="w-full h-96 flex flex-col items-center justify-center gap-3 animate-fade-in">
      <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center animate-pulse">
        <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <div className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">
        Loading Module...
      </div>
    </div>
  );
};
