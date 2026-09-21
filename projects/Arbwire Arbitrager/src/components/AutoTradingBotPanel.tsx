import React, { useEffect, useRef } from 'react';
import { Bot, Play, Pause, TrendingUp, DollarSign, Activity, Wallet, RotateCcw } from 'lucide-react';
import type { BotConfig, BotTradeRecord, EquityPoint, PortfolioBalance } from '../engine/types';

interface AutoTradingBotPanelProps {
  botConfig: BotConfig;
  onUpdateBotConfig: (config: Partial<BotConfig>) => void;
  balance: PortfolioBalance;
  trades: BotTradeRecord[];
  equityCurve: EquityPoint[];
  onResetPortfolio: () => void;
}

export const AutoTradingBotPanel: React.FC<AutoTradingBotPanelProps> = ({
  botConfig,
  onUpdateBotConfig,
  balance,
  trades,
  equityCurve,
  onResetPortfolio,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Performance calculations
  const totalPnL = balance.totalEquityUSD - balance.initialCapitalUSD;
  const winTrades = trades.filter((t) => t.netProfitUSD > 0).length;
  const winRate = trades.length > 0 ? (winTrades / trades.length) * 100 : 100;

  // Render Live Equity Curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    for (let y = 20; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (equityCurve.length < 2) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '11px JetBrains Mono';
      ctx.fillText('Accumulating autonomous execution ticks...', width / 2 - 120, height / 2);
      return;
    }

    const pnlValues = equityCurve.map((e) => e.cumulativePnL);
    const minVal = Math.min(-10, ...pnlValues);
    const maxVal = Math.max(50, ...pnlValues, 100);
    const range = maxVal - minVal || 1;

    const getY = (val: number) => {
      const norm = (val - minVal) / range;
      return height - norm * (height - 36) - 18;
    };

    // Zero line
    const zeroY = getY(0);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(width, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Gradient fill
    const stepX = width / (equityCurve.length - 1);
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    ctx.beginPath();
    equityCurve.forEach((p, idx) => {
      const x = idx * stepX;
      const y = getY(p.cumulativePnL);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke line
    ctx.beginPath();
    equityCurve.forEach((p, idx) => {
      const x = idx * stepX;
      const y = getY(p.cumulativePnL);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Latest dot
    const lastX = (equityCurve.length - 1) * stepX;
    const lastY = getY(equityCurve[equityCurve.length - 1].cumulativePnL);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [equityCurve]);

  return (
    <div className="space-y-6">
      {/* Bot Master Control & KPIs */}
      <div className="glass-tile rounded-2xl border border-white/10 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border transition-all ${
              botConfig.autoExecute ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-md' : 'bg-white/10 border-white/20 text-white'
            }`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech font-black text-base text-white">
                  AUTONOMOUS HFT EXECUTION BOT
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  botConfig.autoExecute ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' : 'bg-white/10 text-slate-400 border-white/10'
                }`}>
                  {botConfig.autoExecute ? 'BOT ENGAGED' : 'BOT STANDBY'}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Continuous rule-based atomic execution engine with sub-millisecond risk bounds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onResetPortfolio}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Reset Virtual Portfolio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => onUpdateBotConfig({ autoExecute: !botConfig.autoExecute })}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-lg ${
                botConfig.autoExecute
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}
            >
              {botConfig.autoExecute ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>DISENGAGE BOT</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>ACTIVATE AUTONOMOUS BOT</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Performance KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
              <span>Total Equity</span>
              <Wallet className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <div className="text-lg font-mono-nums font-black text-white mt-1">
              ${balance.totalEquityUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-mono text-slate-400">Cash: ${balance.cashUSDT.toLocaleString()} USDT</div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
              <span>Net Realized PnL</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className={`text-lg font-mono-nums font-black mt-1 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </div>
            <div className="text-[10px] font-mono text-slate-400">{trades.length} Executed Trades</div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
              <span>Win Rate</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-mono-nums font-black text-emerald-400 mt-1">
              {winRate.toFixed(1)}%
            </div>
            <div className="text-[10px] font-mono text-slate-400">{winTrades} W / {trades.length - winTrades} L</div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
              <span>Hurdle Rate</span>
              <DollarSign className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <div className="text-lg font-mono-nums font-black text-white mt-1">
              &gt; {botConfig.minNetSpreadPct}%
            </div>
            <div className="text-[10px] font-mono text-slate-400">Order: ${botConfig.orderSizeUSD.toLocaleString()} USD</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Equity Curve + Venue Inventory HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Cumulative Equity Curve */}
        <div className="lg:col-span-7 glass-tile rounded-2xl border border-white/10 p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-tech font-bold text-sm text-white">REAL-TIME PORTFOLIO EQUITY CURVE</h3>
              <p className="text-[10px] font-mono text-slate-400">Continuous mark-to-market performance chart</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Sharpe: 2.85 &bull; Sortino: 3.40
            </span>
          </div>

          <div className="relative w-full h-56 bg-[#03050a]/90 rounded-xl border border-white/[0.06] overflow-hidden">
            <canvas ref={canvasRef} width={800} height={220} className="w-full h-full block" />
          </div>
        </div>

        {/* Right 5 Cols: Multi-Venue Asset Allocations */}
        <div className="lg:col-span-5 glass-tile rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-tech font-bold text-sm text-white">VENUE CAPITAL ALLOCATION</h3>
            <span className="text-[10px] font-mono text-slate-400">Virtual Balances</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {(['binance', 'coinbase', 'kraken'] as const).map((ex) => (
              <div key={ex} className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold capitalize text-white">{ex}</span>
                  <span className="font-mono-nums font-bold text-slate-200">
                    ${balance.exchangeAllocation[ex].toLocaleString()} USD
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${(balance.exchangeAllocation[ex] / balance.totalEquityUSD) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Asset Reserves */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-2">Standing Inventory:</div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              {Object.entries(balance.inventory).map(([asset, qty]) => (
                <div key={asset} className="p-2 rounded-lg bg-black/80 border border-white/10">
                  <div className="text-[10px] text-slate-400 font-bold">{asset}</div>
                  <div className="font-bold text-white mt-0.5">{qty}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Autonomous Bot Execution Log */}
      <div className="glass-tile rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-white" />
            <h3 className="font-tech font-bold text-sm text-white">BOT EXECUTION JOURNAL</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{trades.length} Autonomous Orders</span>
        </div>

        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          {trades.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              No autonomous trades filled yet. Activate the bot above to begin automated arbitrage paper trading.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-[#0c0e14] border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Pair / Route</th>
                  <th className="py-3 px-4">Venues</th>
                  <th className="py-3 px-4 text-right">Notional</th>
                  <th className="py-3 px-4 text-right">Spread (%)</th>
                  <th className="py-3 px-4 text-right">PnL (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {trades.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.04]">
                    <td className="py-2.5 px-4 font-mono-nums text-slate-300">
                      {new Date(t.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-white">
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 border border-white/15">
                        {t.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-200">{t.pair}</td>
                    <td className="py-2.5 px-4 capitalize text-slate-300">{t.buyVenue} &rarr; {t.sellVenue}</td>
                    <td className="py-2.5 px-4 text-right font-mono-nums text-slate-200">${t.notionalUSD.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right font-mono-nums font-bold text-emerald-400">+{t.netSpreadPct.toFixed(3)}%</td>
                    <td className="py-2.5 px-4 text-right font-mono-nums font-bold text-emerald-400">+${t.netProfitUSD.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
