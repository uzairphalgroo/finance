import React from 'react';
import { Sparkles } from 'lucide-react';

interface FloatingAiCopilotBadgeProps {
  onOpen: () => void;
  isOpen: boolean;
}

export const FloatingAiCopilotBadge: React.FC<FloatingAiCopilotBadgeProps> = ({ onOpen, isOpen }) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      <button
        onClick={onOpen}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#0a120e]/90 hover:bg-[#0f1d16] border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-mono text-xs font-bold shadow-2xl backdrop-blur-xl transition-all cursor-pointer hover:scale-105 active:scale-95 group"
        title="Open AI Quant Copilot (Press A)"
      >
        <div className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-tech font-extrabold text-[11px] tracking-wide text-white flex items-center gap-1.5">
            AI QUANT COPILOT
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </span>
          <span className="text-[9px] text-emerald-400/80 font-mono">
            OpenRouter Intelligence (A)
          </span>
        </div>
      </button>
    </div>
  );
};
