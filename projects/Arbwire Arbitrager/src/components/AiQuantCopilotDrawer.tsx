import React, { useState } from 'react';
import { X, Sparkles, Send, Cpu, Bot } from 'lucide-react';
import { AiQuantCopilot } from '../services/AiQuantCopilot';
import type { AiMarketAnalysis } from '../services/AiQuantCopilot';
import type { ArbitrageOpportunity, MicrostructureMetrics, TriangularOpportunity } from '../engine/types';

interface AiQuantCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentOpportunity: ArbitrageOpportunity | null;
  triangularOpportunities: TriangularOpportunity[];
  microstructureMetrics: MicrostructureMetrics[];
}

export const AiQuantCopilotDrawer: React.FC<AiQuantCopilotDrawerProps> = ({
  isOpen,
  onClose,
  currentOpportunity,
  triangularOpportunities,
  microstructureMetrics,
}) => {
  const [analysis, setAnalysis] = useState<AiMarketAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [chatQuery, setChatQuery] = useState<string>('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
      const opp = currentOpportunity || triangularOpportunities[0];
      if (opp) {
        const res = await AiQuantCopilot.analyzeDislocation(opp, microstructureMetrics);
        setAnalysis(res);
      }
    } catch (e) {
      console.error('AI Analysis failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuery = async () => {
    if (!chatQuery.trim()) return;
    const q = chatQuery.trim();
    setChatQuery('');
    setChatLog((prev) => [...prev, { role: 'user', text: q }]);

    const terminalContext = `Current Pair: ${currentOpportunity?.pair || 'BTC/USDT'}
Net Spread: +${currentOpportunity?.netSpreadPct.toFixed(3) || 0}%
Venues: ${currentOpportunity?.buyExchange || 'binance'} -> ${currentOpportunity?.sellExchange || 'coinbase'}
Active Triangular Loops: ${triangularOpportunities.length}`;

    try {
      const answer = await AiQuantCopilot.askCopilot(q, terminalContext);
      setChatLog((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch (e) {
      setChatLog((prev) => [...prev, { role: 'assistant', text: 'Error contacting AI Copilot.' }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#07090e] border-l border-white/15 h-full flex flex-col font-mono text-xs text-slate-200 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech font-bold text-sm text-white">AI QUANT COPILOT</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-emerald-300 border border-emerald-500/30">
                  OPENROUTER CLAUDE-3.5
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Real-time microstructure &amp; algorithmic risk analyst</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Anomaly Assessment Trigger */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-emerald-400" />
                Live Dislocation Diagnostics
              </span>
              <button
                onClick={handleRunAnalysis}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Evaluating...' : 'Run Diagnostics'}</span>
              </button>
            </div>

            {analysis ? (
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="text-sm font-bold text-white leading-snug">
                  {analysis.headline}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-black/60 border border-white/10">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Risk Assessment</div>
                    <div className="font-black text-emerald-400 mt-0.5">{analysis.riskRating} RISK</div>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-white/10">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Fill Probability</div>
                    <div className="font-black text-white mt-0.5">{analysis.estimatedFillProbabilityPct}%</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">Driver:</strong> {analysis.anomalyDriver}
                </div>

                <div className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-emerald-400">Action:</strong> {analysis.suggestedAction}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Click &ldquo;Run Diagnostics&rdquo; to send real-time Level 2 order books and latency metrics to the OpenRouter AI model for instantaneous quantitative analysis.
              </p>
            )}
          </div>

          {/* Interactive Strategy Chat Log */}
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-300" />
              <span>Quant Copilot Consultation</span>
            </div>

            <div className="space-y-2">
              {chatLog.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl leading-relaxed text-xs ${
                    msg.role === 'user'
                      ? 'bg-white/10 text-white ml-6 border border-white/10'
                      : 'bg-black/80 text-slate-200 mr-6 border border-white/10'
                  }`}
                >
                  <div className="text-[9px] text-slate-400 font-bold mb-1 uppercase">
                    {msg.role === 'user' ? 'Trader' : 'Arbwire AI'}
                  </div>
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-black border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI Copilot about spreads, fees, VPIN, OBI..."
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendQuery();
            }}
            className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 font-mono"
          />
          <button
            onClick={handleSendQuery}
            className="p-2 rounded-xl bg-white hover:bg-slate-200 text-black transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
