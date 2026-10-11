import React from 'react';

export const LoadingSkeleton: React.FC<{ type?: 'chat' | 'card' | 'text' }> = ({ type = 'chat' }) => {
  if (type === 'chat') {
    return (
      <div className="flex items-start gap-3 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-slate-700 rounded w-1/3" />
          <div className="h-3.5 bg-slate-700/70 rounded w-5/6" />
          <div className="h-3.5 bg-slate-700/70 rounded w-4/6" />
          <div className="h-3 bg-slate-700/50 rounded w-1/2 mt-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-slate-700 rounded w-1/4" />
        <div className="h-4 bg-slate-700 rounded w-16" />
      </div>
      <div className="h-4 bg-slate-700/80 rounded w-3/4" />
      <div className="h-16 bg-slate-900/60 rounded-lg" />
    </div>
  );
};

