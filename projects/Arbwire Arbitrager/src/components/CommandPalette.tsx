import React, { useEffect, useRef, useState } from 'react';
import { Search, Zap, Volume2, Settings, Download, X, ArrowRight, BookOpen, HelpCircle, Terminal } from 'lucide-react';
import type { TradingPair, ViewMode } from '../engine/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPair: (pair: TradingPair) => void;
  onOpenConfig: () => void;
  onToggleSound: () => void;
  onOpenGuide: () => void;
  onExportCSV?: () => void;
  onSelectViewMode?: (mode: ViewMode) => void;
  onOpenAiCopilot?: () => void;
  onOpenWelcomeScreen?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectPair,
  onOpenConfig,
  onToggleSound,
  onOpenGuide,
  onExportCSV,
  onSelectViewMode,
  onOpenAiCopilot,
  onOpenWelcomeScreen,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const actions = [
    {
      id: 'welcome-intro',
      label: 'Open Cinematic Welcome Screen & Architecture Intro',
      category: 'Overview',
      icon: <Terminal className="w-4 h-4 text-cyan-400" />,
      run: () => { if (onOpenWelcomeScreen) onOpenWelcomeScreen(); onClose(); },
    },
    {
      id: 'ai-copilot',
      label: 'Open AI Quant Copilot (OpenRouter LLM)',
      category: 'Intelligence',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      run: () => { if (onOpenAiCopilot) onOpenAiCopilot(); onClose(); },
    },
    {
      id: 'view-triangular',
      label: 'Switch View: Triangular Arbitrage Graph',
      category: 'Terminal View',
      icon: <Zap className="w-4 h-4 text-white" />,
      run: () => { if (onSelectViewMode) onSelectViewMode('triangular'); onClose(); },
    },
    {
      id: 'view-bot',
      label: 'Switch View: Autonomous Quant Bot & Live Equity Curve',
      category: 'Terminal View',
      icon: <Zap className="w-4 h-4 text-white" />,
      run: () => { if (onSelectViewMode) onSelectViewMode('bot'); onClose(); },
    },
    {
      id: 'view-microstructure',
      label: 'Switch View: Microstructure Alpha & OBI Gauges',
      category: 'Terminal View',
      icon: <Zap className="w-4 h-4 text-white" />,
      run: () => { if (onSelectViewMode) onSelectViewMode('microstructure'); onClose(); },
    },
    {
      id: 'view-mosaic',
      label: 'Switch View: Global Multi-Asset Mosaic Grid',
      category: 'Terminal View',
      icon: <Zap className="w-4 h-4 text-white" />,
      run: () => { if (onSelectViewMode) onSelectViewMode('mosaic'); onClose(); },
    },
    {
      id: 'view-tactical',
      label: 'Switch View: Tactical 2-Leg Arbitrage Matrix',
      category: 'Terminal View',
      icon: <Zap className="w-4 h-4 text-white" />,
      run: () => { if (onSelectViewMode) onSelectViewMode('tactical'); onClose(); },
    },
    {
      id: 'guide',
      label: 'Open User Manual & How-to-Use Guide',
      category: 'Documentation',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      run: () => { onOpenGuide(); onClose(); },
    },
    {
      id: 'terms',
      label: 'Quantitative Glossary & Terminology Definitions',
      category: 'Documentation',
      icon: <HelpCircle className="w-4 h-4 text-slate-300" />,
      run: () => { onOpenGuide(); onClose(); },
    },
    {
      id: 'pair-btc',
      label: 'Switch Trading Pair: BTC/USDT',
      category: 'Market Pair',
      icon: <Zap className="w-4 h-4 text-white" />,
      run: () => { onSelectPair('BTC/USDT'); onClose(); },
    },
    {
      id: 'pair-eth',
      label: 'Switch Trading Pair: ETH/USDT',
      category: 'Market Pair',
      icon: <Zap className="w-4 h-4 text-white" />,
      run: () => { onSelectPair('ETH/USDT'); onClose(); },
    },
    {
      id: 'pair-sol',
      label: 'Switch Trading Pair: SOL/USDT',
      category: 'Market Pair',
      icon: <Zap className="w-4 h-4 text-white" />,
      run: () => { onSelectPair('SOL/USDT'); onClose(); },
    },
    {
      id: 'pair-avax',
      label: 'Switch Trading Pair: AVAX/USDT',
      category: 'Market Pair',
      icon: <Zap className="w-4 h-4 text-white" />,
      run: () => { onSelectPair('AVAX/USDT'); onClose(); },
    },
    {
      id: 'config',
      label: 'Configure Thresholds, Sizing & Fee Presets',
      category: 'Settings',
      icon: <Settings className="w-4 h-4 text-slate-200" />,
      run: () => { onOpenConfig(); onClose(); },
    },
    {
      id: 'sound',
      label: 'Toggle Acoustic Synthesis Chimes',
      category: 'Audio',
      icon: <Volume2 className="w-4 h-4 text-slate-200" />,
      run: () => { onToggleSound(); onClose(); },
    },
    {
      id: 'export',
      label: 'Export Arbitrage Audit Trail to JSON / CSV',
      category: 'Data',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      run: () => { if (onExportCSV) onExportCSV(); onClose(); },
    },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].run();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#090b10] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/90 border-b border-white/10 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-bold text-slate-200">ARBWIRE COMMAND INTERPRETER</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 text-[10px]">ESC to close</span>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3 bg-slate-950/60">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command (e.g. Guide, BTC, Config, Terms, Export)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded bg-white/10 text-slate-400 hover:text-white text-[10px] cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No matching commands found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.run}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/80 border border-white/10 shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-bold text-slate-100">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="text-[10px] text-white px-1.5 py-0.5 rounded bg-white/15 border border-white/20">
                        ENTER
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white translate-x-0.5' : 'text-slate-600'} transition-all`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-black/90 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Navigate: <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">↓</kbd></span>
            <span>Execute: <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">↵</kbd></span>
          </div>
          <span>Arbwire Institutional CLI</span>
        </div>
      </div>
    </div>
  );
};
