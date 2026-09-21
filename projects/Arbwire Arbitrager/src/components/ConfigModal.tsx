import React, { useState } from 'react';
import { X, DollarSign, Shield, Zap, RefreshCw, Cpu } from 'lucide-react';
import type { EngineConfig, ExchangeId } from '../engine/types';

interface ConfigModalProps {
  isOpen: boolean;
  config: EngineConfig;
  onClose: () => void;
  onSave: (newConfig: Partial<EngineConfig>) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  config,
  onClose,
  onSave,
}) => {
  const [threshold, setThreshold] = useState<number>(config.actionableThresholdPct);
  const [orderSize, setOrderSize] = useState<number>(config.simulatedOrderSizeUSD);
  const [bufferCapacity, setBufferCapacity] = useState<number>(config.bufferCapacity);
  const [feePresets, setFeePresets] = useState(config.feePresets);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      actionableThresholdPct: threshold,
      simulatedOrderSizeUSD: orderSize,
      bufferCapacity,
      feePresets,
    });
    onClose();
  };

  const handleResetDefaults = () => {
    setThreshold(0.15);
    setOrderSize(10000);
    setBufferCapacity(2000);
    setFeePresets({
      binance: { makerBps: 2, takerBps: 4 },
      coinbase: { makerBps: 4, takerBps: 6 },
      kraken: { makerBps: 2.5, takerBps: 4 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#08090e] border border-white/20 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-tech font-bold text-lg text-white">ENGINE CONFIGURATION PARAMETERS</h2>
              <p className="text-xs font-mono text-slate-400">Configure actionable thresholds, depth slippage, and fee tiers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {/* 1. Actionable Spread Trigger */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                Actionable Spread Discrepancy Trigger
              </span>
              <span className="text-emerald-400 font-black font-mono-nums text-base">
                {threshold.toFixed(2)}% ({(threshold * 100).toFixed(0)} bps)
              </span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.50"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <p className="text-[11px] text-slate-400 font-mono">
              Visual alert banners and acoustic synthesizer chimes trigger whenever net cross-venue spread after slippage and fees exceeds this threshold.
            </p>
          </div>

          {/* 2. Order Sizing Notional Depth */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-slate-300" />
                Simulated Execution Notional Sizing
              </span>
              <span className="text-white font-black font-mono-nums text-base">
                ${orderSize.toLocaleString()} USD
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {[1000, 10000, 50000, 100000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setOrderSize(val)}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    orderSize === val
                      ? 'bg-white text-black shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-white/10 hover:border-white/30'
                  }`}
                >
                  ${(val / 1000).toFixed(0)}k USD
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Walks the real-time Level 2 order book ladders to calculate volume-weighted average price (VWAP) slippage for this sizing.
            </p>
          </div>

          {/* 3. Fee Tiers */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-xs font-mono text-slate-200 font-bold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-300" />
              Venue Fee Tiers (Basis Points)
            </span>
            <div className="grid grid-cols-3 gap-3">
              {(['binance', 'coinbase', 'kraken'] as ExchangeId[]).map((ex) => (
                <div key={ex} className="p-3.5 rounded-2xl bg-black border border-white/10 space-y-2">
                  <div className="text-xs font-mono font-black capitalize text-white">{ex}</div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block font-bold">Taker Fee (bps)</label>
                    <input
                      type="number"
                      value={feePresets[ex]?.takerBps || 4}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFeePresets((prev) => ({
                          ...prev,
                          [ex]: { ...prev[ex], takerBps: val },
                        }));
                      }}
                      className="w-full bg-slate-900 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Queue Capacity */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-xs font-mono text-slate-200 font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-slate-300" />
              L1 Ring Buffer Queue Capacity
            </span>
            <div className="p-3.5 rounded-2xl bg-black border border-white/10 space-y-1">
              <label className="text-[11px] text-slate-300 font-mono font-semibold">RingBuffer Capacity (Slots)</label>
              <input
                type="number"
                value={bufferCapacity}
                onChange={(e) => setBufferCapacity(parseInt(e.target.value) || 1000)}
                className="w-full bg-slate-900 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white font-bold"
              />
              <p className="text-[10px] text-slate-400 font-mono">Bounded circular buffer prevents high tick spike memory leaks</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-mono transition-all border border-white/10 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs font-mono transition-all cursor-pointer shadow-md"
            >
              Apply Parameters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
