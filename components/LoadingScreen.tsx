'use client';

import React from 'react';
import { useGameStore } from '../stores/gameStore';

export default function LoadingScreen() {
  const isLoaded = useGameStore((state) => state.isLoaded);
  const loadingProgress = useGameStore((state) => state.loadingProgress);
  const loadingMessage = useGameStore((state) => state.loadingMessage);

  if (isLoaded) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-2xl text-slate-950 shadow-2xl mb-6 animate-pulse">
        EF
      </div>
      <h1 className="text-2xl font-bold text-white tracking-wide">EchoFlip Forest</h1>
      <p className="text-sm text-emerald-400 font-medium mt-1 mb-8">{loadingMessage}</p>

      <div className="w-64 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700 shadow-inner">
        <div
          className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
    </div>
  );
}
