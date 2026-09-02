import React from 'react';
import { usePwa } from '../../context/PwaContext';
import { X, Share, PlusSquare, Smartphone } from 'lucide-react';

export const IOSInstallModal: React.FC = () => {
  const { showIOSInstructions, setShowIOSInstructions } = usePwa();

  if (!showIOSInstructions) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
          </div>
          <button
            onClick={() => setShowIOSInstructions(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Safari on iOS requires 2 quick taps to install this app to your home screen:
        </p>

        <div className="space-y-3 pt-1">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <Share className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">1. Tap the Share Button</div>
              <div className="text-slate-400 mt-0.5">
                Look for the Share icon at the bottom of your Safari screen.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 shrink-0">
              <PlusSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">2. Tap &quot;Add to Home Screen&quot;</div>
              <div className="text-slate-400 mt-0.5">
                Scroll down in the share sheet and select &quot;Add to Home Screen&quot;.
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowIOSInstructions(false)}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition cursor-pointer mt-2"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
