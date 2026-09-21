import React, { useState } from 'react';
import {
  Download,
  History,
  Trash2,
  FileJson,
  ArrowRight,
  Zap,
  ShieldCheck,
  Clock,
  BookmarkCheck,
  Bookmark,
  AlertCircle,
  Check,
} from 'lucide-react';
import type { ArbitrageOpportunity, AutoCapturePeriod } from '../engine/types';

interface OpportunityLogProps {
  opportunities: ArbitrageOpportunity[];
  onClear: () => void;
  onCaptureSample?: () => void;
  autoCapturePeriod?: AutoCapturePeriod;
  onPeriodChange?: (period: AutoCapturePeriod) => void;
  secondsRemaining?: number;
  onSaveOpportunity?: (id: string) => void;
  onSaveAll?: () => void;
  onPurgeUnsaved?: () => void;
  onDeleteOpportunity?: (id: string) => void;
}

const PERIOD_CONFIGS: { value: AutoCapturePeriod; label: string; shortLabel: string; totalSec: number }[] = [
  { value: 'off', label: 'Off (Manual)', shortLabel: 'Off', totalSec: 0 },
  { value: '15s', label: '15s', shortLabel: '15s', totalSec: 15 },
  { value: '30s', label: '30s', shortLabel: '30s', totalSec: 30 },
  { value: '1m', label: '1 min', shortLabel: '1m', totalSec: 60 },
  { value: '3m', label: '3 min', shortLabel: '3m', totalSec: 180 },
  { value: '5m', label: '5 min', shortLabel: '5m', totalSec: 300 },
  { value: '15m', label: '15 min', shortLabel: '15m', totalSec: 900 },
];

export const OpportunityLog: React.FC<OpportunityLogProps> = ({
  opportunities,
  onClear,
  onCaptureSample,
  autoCapturePeriod = 'off',
  onPeriodChange,
  secondsRemaining = 0,
  onSaveOpportunity,
  onSaveAll,
  onPurgeUnsaved,
  onDeleteOpportunity,
}) => {
  const [filterPair, setFilterPair] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SAVED' | 'UNSAVED' | 'EXECUTED'>('ALL');

  const filteredOpps = opportunities.filter((o) => {
    const pairMatch = filterPair === 'ALL' || o.pair === filterPair;
    if (!pairMatch) return false;

    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'SAVED') return o.isSaved === true && o.captureType !== 'execution';
    if (filterStatus === 'UNSAVED') return o.isSaved !== true && o.captureType !== 'execution';
    if (filterStatus === 'EXECUTED') return o.captureType === 'execution';
    return true;
  });

  const unsavedCount = opportunities.filter(
    (o) => o.isSaved !== true && o.captureType !== 'execution'
  ).length;
  const savedCount = opportunities.filter(
    (o) => o.isSaved === true || o.captureType === 'execution'
  ).length;

  const currentPeriodConfig = PERIOD_CONFIGS.find((p) => p.value === autoCapturePeriod);
  const totalSec = currentPeriodConfig?.totalSec || 0;
  const progressPct = totalSec > 0 ? Math.max(0, Math.min(100, ((totalSec - secondsRemaining) / totalSec) * 100)) : 0;

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const exportCSV = () => {
    if (opportunities.length === 0) return;

    const headers = [
      'Timestamp',
      'Time (ISO)',
      'Pair',
      'Buy Exchange',
      'Buy Price',
      'Sell Exchange',
      'Sell Price',
      'Gross Spread (%)',
      'Gross Spread (bps)',
      'Slippage (%)',
      'Fees (bps)',
      'Net Spread (%)',
      'Net Spread (bps)',
      'Simulated Notional ($)',
      'Net Profit ($)',
      'Actionable',
      'Capture Type',
      'Capture Interval',
      'Saved Status',
    ];

    const rows = opportunities.map((o) => [
      o.timestamp,
      new Date(o.timestamp).toISOString(),
      o.pair,
      o.buyExchange,
      o.buyPrice,
      o.sellExchange,
      o.sellPrice,
      o.grossSpreadPct,
      o.grossSpreadBps,
      o.slippagePct,
      o.totalFeeBps,
      o.netSpreadPct,
      o.netSpreadBps,
      o.simulatedNotionalUSD,
      o.netProfitUSD,
      o.isActionable ? 'YES' : 'NO',
      o.captureType || 'manual',
      o.captureInterval || 'N/A',
      o.isSaved ? 'SAVED' : o.captureType === 'execution' ? 'EXECUTED' : 'UNSAVED',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `arbwire_arbitrage_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (opportunities.length === 0) return;
    const jsonStr = JSON.stringify(opportunities, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arbwire_arbitrage_audit_${Date.now()}.json`;
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-tile rounded-2xl border border-white/10 p-3.5 sm:p-5 space-y-3 sm:space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-sm shrink-0">
            <History className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="font-tech font-bold text-xs sm:text-sm text-white tracking-wider">
                DISCREPANCY CAPTURE AUDIT TRAIL
              </h3>
              <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-white/10 text-slate-200 border border-white/15">
                {opportunities.length} Events
              </span>
              {savedCount > 0 && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {savedCount} Saved
                </span>
              )}
              {unsavedCount > 0 && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  {unsavedCount} Unsaved
                </span>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] font-mono text-slate-400">
              Autonomous snapshot intervals &bull; Chronological execution &amp; dislocation journal
            </p>
          </div>
        </div>

        {/* Autonomous Capture Control & Interval Selector */}
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto touch-scroll-x no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-white/15 shadow-inner shrink-0">
            <div className="flex items-center gap-1 px-1.5 sm:px-2 text-[10px] sm:text-[11px] font-mono font-bold text-slate-300 shrink-0">
              <Clock className={`w-3.5 h-3.5 ${autoCapturePeriod !== 'off' ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '8s' }} />
              <span className="hidden sm:inline">Auto:</span>
            </div>
            {PERIOD_CONFIGS.map((period) => {
              const isActive = autoCapturePeriod === period.value;
              return (
                <button
                  key={period.value}
                  onClick={() => onPeriodChange?.(period.value)}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold shadow-md shadow-emerald-500/20 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={
                    period.value === 'off'
                      ? 'Disable autonomous snapshot capture'
                      : `Autonomous snapshot every ${period.label} (Changes discard unsaved events)`
                  }
                >
                  {period.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Auto-Capture Status & Timer Bar (Visible when Auto Capture is active) */}
      {autoCapturePeriod !== 'off' && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-black border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-300">AUTONOMOUS SNAPSHOT ACTIVE</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                  Every {currentPeriodConfig?.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Captures instantaneous order book dislocation at period expiration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <span className="text-[10px] text-slate-400">Next Snapshot:</span>
                <span className="px-2 py-0.5 rounded bg-black/80 border border-white/20 text-emerald-400 font-mono text-xs">
                  {formatCountdown(secondsRemaining)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300 ease-linear rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning & Unsaved Snapshots Action Bar */}
      {unsavedCount > 0 && (
        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-[11px]">
              <strong>{unsavedCount} unsaved snapshot{unsavedCount > 1 ? 's' : ''} captured.</strong> Switching interval will automatically purge unsaved events.
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onSaveAll && (
              <button
                onClick={onSaveAll}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] transition-all cursor-pointer shadow-sm active:scale-95"
                title="Save all currently unsaved snapshots permanently"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Save All ({unsavedCount})</span>
              </button>
            )}
            {onPurgeUnsaved && (
              <button
                onClick={onPurgeUnsaved}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-rose-400 font-bold text-[11px] transition-all cursor-pointer"
                title="Discard all unsaved snapshots"
              >
                <Trash2 className="w-3 h-3" />
                <span>Purge Unsaved</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Action Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
        {/* Pair Filter Chips & Status Filter */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="inline-flex p-0.5 sm:p-1 rounded-xl bg-slate-950/80 border border-white/10 text-[9px] sm:text-[10px] font-mono touch-scroll-x no-scrollbar">
            {['ALL', 'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPair(p)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all font-bold cursor-pointer whitespace-nowrap ${
                  filterPair === p
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="inline-flex p-0.5 sm:p-1 rounded-xl bg-slate-950/80 border border-white/10 text-[9px] sm:text-[10px] font-mono touch-scroll-x no-scrollbar">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'SAVED', label: `Saved (${savedCount})` },
              { id: 'UNSAVED', label: `Unsaved (${unsavedCount})` },
              { id: 'EXECUTED', label: 'Executed' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id as any)}
                className={`px-1.5 sm:px-2 py-1 rounded-lg transition-all font-bold cursor-pointer whitespace-nowrap ${
                  filterStatus === st.id
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons for Snapshot, Export and Clear */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
          {onCaptureSample && (
            <button
              onClick={onCaptureSample}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-[11px] sm:text-xs font-mono text-emerald-300 font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Capture instantaneous market snapshot into audit log"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Snapshot</span>
            </button>
          )}

          <button
            onClick={exportCSV}
            disabled={opportunities.length === 0}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed border border-white/15 text-[11px] sm:text-xs font-mono text-slate-200 font-bold transition-all shadow-sm cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>CSV</span>
          </button>

          <button
            onClick={exportJSON}
            disabled={opportunities.length === 0}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed border border-white/15 text-[11px] sm:text-xs font-mono text-slate-200 font-bold transition-all shadow-sm cursor-pointer"
            title="Export JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-slate-300" />
            <span>JSON</span>
          </button>

          <button
            onClick={onClear}
            disabled={opportunities.length === 0}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-950 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
            title="Clear All Opportunity Log Entries"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto touch-scroll-x max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-black/70">
        {filteredOpps.length === 0 ? (
          <div className="py-10 sm:py-12 px-4 text-center text-xs font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-slate-500" />
            <div className="max-w-md space-y-2">
              <p className="font-bold text-slate-200">No Dislocation Events Match Filters</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                {autoCapturePeriod !== 'off'
                  ? `Autonomous capture is active (${currentPeriodConfig?.label}). Next snapshot in ${formatCountdown(secondsRemaining)}.`
                  : 'Select an auto-capture interval above or click "Snapshot" to record instantaneous market spreads.'}
              </p>
              {onCaptureSample && (
                <div className="pt-2">
                  <button
                    onClick={onCaptureSample}
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 text-black" />
                    <span>Capture Current Market Snapshot</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[700px] text-left text-xs font-mono">
            <thead className="sticky top-0 bg-[#0d0f17] border-b border-white/15 text-slate-400 uppercase text-[10px] z-10">
              <tr>
                <th className="py-3 px-3 font-bold">Timestamp</th>
                <th className="py-3 px-3 font-bold">Pair</th>
                <th className="py-3 px-3 font-bold">Type</th>
                <th className="py-3 px-3 font-bold">Routing Pathway</th>
                <th className="py-3 px-3 text-right font-bold">Buy Leg</th>
                <th className="py-3 px-3 text-right font-bold">Sell Leg</th>
                <th className="py-3 px-3 text-right font-bold">Gross</th>
                <th className="py-3 px-3 text-right font-bold">Net Spread (%)</th>
                <th className="py-3 px-3 text-right font-bold">Net Profit ($)</th>
                <th className="py-3 px-3 text-center font-bold">Status</th>
                <th className="py-3 px-3 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredOpps.map((opp, index) => {
                const isSaved = opp.isSaved === true;
                const isExecution = opp.captureType === 'execution';
                const isAuto = opp.captureType === 'auto';

                return (
                  <tr
                    key={`${opp.id}-${index}`}
                    className={`transition-colors ${
                      !isSaved && !isExecution ? 'hover:bg-amber-500/[0.05] bg-amber-500/[0.02]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono-nums text-slate-300 whitespace-nowrap">
                      {new Date(opp.timestamp).toLocaleTimeString()}.{String(opp.timestamp % 1000).padStart(3, '0')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                      {opp.pair}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {isExecution ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          EXEC
                        </span>
                      ) : isAuto ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
                          AUTO {opp.captureInterval || ''}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          MANUAL
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="capitalize text-slate-200 font-bold">{opp.buyExchange}</span>
                      <ArrowRight className="inline-block w-3 h-3 text-slate-400 mx-1" />
                      <span className="capitalize text-slate-200 font-bold">{opp.sellExchange}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums text-slate-200 whitespace-nowrap">
                      ${opp.buyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums text-slate-200 whitespace-nowrap">
                      ${opp.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums text-slate-300 whitespace-nowrap">
                      +{opp.grossSpreadPct.toFixed(3)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums font-bold text-emerald-400 whitespace-nowrap">
                      +{opp.netSpreadPct.toFixed(3)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums font-bold text-emerald-400 whitespace-nowrap">
                      +${opp.netProfitUSD.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {isExecution ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          EXECUTED
                        </span>
                      ) : isSaved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <Check className="w-2.5 h-2.5" />
                          SAVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          UNSAVED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isSaved && !isExecution && onSaveOpportunity && (
                          <button
                            onClick={() => onSaveOpportunity(opp.id)}
                            className="p-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/40 text-emerald-300 transition-all cursor-pointer"
                            title="Save this snapshot permanently"
                          >
                            <Bookmark className="w-3 h-3" />
                          </button>
                        )}
                        {onDeleteOpportunity && (
                          <button
                            onClick={() => onDeleteOpportunity(opp.id)}
                            className="p-1 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                            title="Delete this entry"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};


