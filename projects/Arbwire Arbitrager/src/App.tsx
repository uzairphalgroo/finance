import { useEffect, useRef, useState } from 'react';
import type { ArbitrageScanResult } from './analytics/ArbitrageEngine';
import { TriangularArbitrageEngine } from './analytics/TriangularArbitrageEngine';
import { MicrostructureEngine } from './analytics/MicrostructureEngine';
import { AutoExecutionBot } from './analytics/AutoExecutionBot';
import { QuantSuiteHub } from './components/QuantSuiteHub';
import { TacticalQuantWidgets } from './components/TacticalQuantWidgets';
import { FloatingAiCopilotBadge } from './components/FloatingAiCopilotBadge';
import { ArbitrageMatrix } from './components/ArbitrageMatrix';
import { TriangularArbitragePanel } from './components/TriangularArbitragePanel';
import { AutoTradingBotPanel } from './components/AutoTradingBotPanel';
import { MicrostructureAlphaPanel } from './components/MicrostructureAlphaPanel';
import { GlobalMosaicView } from './components/GlobalMosaicView';
import { AiQuantCopilotDrawer } from './components/AiQuantCopilotDrawer';
import { CommandPalette } from './components/CommandPalette';
import { ConfigModal } from './components/ConfigModal';
import { HowToUseGuideModal } from './components/HowToUseGuideModal';
import { CinematicWelcomeScreen } from './components/CinematicWelcomeScreen';
import { CyberBackground } from './components/CyberBackground';
import { Header } from './components/Header';
import { LatencyTelemetryPanel } from './components/LatencyTelemetryPanel';
import { OpportunityLog } from './components/OpportunityLog';
import { OrderBookDepth } from './components/OrderBookDepth';
import { SpreadHistoryChart } from './components/SpreadHistoryChart';
import { ThreeDArbitrageOrb } from './components/ThreeDArbitrageOrb';
import { VenueTopologyMap } from './components/VenueTopologyMap';
import { FeedManager } from './engine/FeedManager';
import type {
  ArbitrageOpportunity,
  AutoCapturePeriod,
  BotConfig,
  BotTradeRecord,
  EngineConfig,
  EquityPoint,
  ExchangeId,
  LatencyMetrics,
  MicrostructureMetrics,
  OrderBook,
  PortfolioBalance,
  TradingPair,
  TriangularOpportunity,
  ViewMode,
} from './engine/types';
import { SoundFx } from './services/SoundFx';

export function App() {
  const feedManagerRef = useRef<FeedManager | null>(null);
  const triangularEngineRef = useRef<TriangularArbitrageEngine>(new TriangularArbitrageEngine());
  const microstructureEngineRef = useRef<MicrostructureEngine>(new MicrostructureEngine());
  const botRef = useRef<AutoExecutionBot>(new AutoExecutionBot());

  const [config, setConfig] = useState<EngineConfig>({
    actionableThresholdPct: 0.15,
    simulatedOrderSizeUSD: 10000,
    feePresets: {
      binance: { makerBps: 2, takerBps: 4 },
      coinbase: { makerBps: 4, takerBps: 6 },
      kraken: { makerBps: 2.5, takerBps: 4 },
    },
    bufferCapacity: 2000,
    soundEnabled: false,
    activePair: 'BTC/USDT',
  });

  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('arbwire_welcome_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  const [viewMode, setViewMode] = useState<ViewMode>('tactical');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);

  const [books, setBooks] = useState<Partial<Record<ExchangeId, OrderBook>>>({});
  const [scanResult, setScanResult] = useState<ArbitrageScanResult>({
    matrix: [],
    bestOpportunity: null,
    topOfBook: { binance: null, coinbase: null, kraken: null },
  });

  const [triangularOpportunities, setTriangularOpportunities] = useState<TriangularOpportunity[]>([]);
  const [microstructureMetrics, setMicrostructureMetrics] = useState<MicrostructureMetrics[]>([]);

  // Bot State
  const [botConfig, setBotConfig] = useState<BotConfig>(botRef.current.getConfig());
  const [portfolioBalance, setPortfolioBalance] = useState<PortfolioBalance>(botRef.current.getBalance());
  const [botTrades, setBotTrades] = useState<BotTradeRecord[]>([]);
  const [equityCurve, setEquityCurve] = useState<EquityPoint[]>(botRef.current.getEquityCurve());

  const [metrics, setMetrics] = useState<Record<ExchangeId, LatencyMetrics>>({
    binance: {
      exchange: 'binance',
      connectionState: 'DISCONNECTED',
      pingRttMs: 0,
      avgPingRttMs: 0,
      minPingRttMs: 0,
      maxPingRttMs: 0,
      packetJitterMs: 0,
      msgPerSecond: 0,
      totalMessages: 0,
      droppedMessages: 0,
      queueSaturationPct: 0,
      lastMsgTimestamp: 0,
      orderBookDriftMs: 0,
      reconnectCount: 0,
    },
    coinbase: {
      exchange: 'coinbase',
      connectionState: 'DISCONNECTED',
      pingRttMs: 0,
      avgPingRttMs: 0,
      minPingRttMs: 0,
      maxPingRttMs: 0,
      packetJitterMs: 0,
      msgPerSecond: 0,
      totalMessages: 0,
      droppedMessages: 0,
      queueSaturationPct: 0,
      lastMsgTimestamp: 0,
      orderBookDriftMs: 0,
      reconnectCount: 0,
    },
    kraken: {
      exchange: 'kraken',
      connectionState: 'DISCONNECTED',
      pingRttMs: 0,
      avgPingRttMs: 0,
      minPingRttMs: 0,
      maxPingRttMs: 0,
      packetJitterMs: 0,
      msgPerSecond: 0,
      totalMessages: 0,
      droppedMessages: 0,
      queueSaturationPct: 0,
      lastMsgTimestamp: 0,
      orderBookDriftMs: 0,
      reconnectCount: 0,
    },
  });

  const [opportunityHistory, setOpportunityHistory] = useState<ArbitrageOpportunity[]>([]);
  const [autoCapturePeriod, setAutoCapturePeriod] = useState<AutoCapturePeriod>('off');
  const [captureSecondsRemaining, setCaptureSecondsRemaining] = useState<number>(0);

  const scanResultRef = useRef(scanResult);
  scanResultRef.current = scanResult;

  const configRef = useRef(config);
  configRef.current = config;

  // Initialize FeedManager & Quant Engine Stream
  useEffect(() => {
    const manager = new FeedManager(config);
    feedManagerRef.current = manager;

    const unsubscribe = manager.subscribe((data) => {
      setBooks(data.books);
      setScanResult(data.scanResult);
      setMetrics(data.metrics);

      // 1. Run Triangular Arbitrage Scan
      const triOpps = triangularEngineRef.current.scan(
        data.books,
        data.pair,
        config.simulatedOrderSizeUSD,
        config.actionableThresholdPct * 100,
        config.feePresets
      );
      setTriangularOpportunities(triOpps);

      // 2. Run Microstructure OBI & Toxicity Analysis
      const exchanges: ExchangeId[] = ['binance', 'coinbase', 'kraken'];
      const micro = exchanges.map((ex) =>
        microstructureEngineRef.current.analyze(ex, data.pair, data.books[ex])
      );
      setMicrostructureMetrics(micro);

      // 3. Autonomous Bot Execution Evaluation
      if (data.scanResult.bestOpportunity) {
        botRef.current.evaluateAndExecute2Leg(data.scanResult.bestOpportunity, (filledTrade) => {
          setPortfolioBalance(botRef.current.getBalance());
          setBotTrades(botRef.current.getTradeHistory());
          setEquityCurve(botRef.current.getEquityCurve());

          // Also log to audit trail as permanent saved executed trade
          setOpportunityHistory((prev) => [
            {
              ...data.scanResult.bestOpportunity!,
              id: filledTrade.id,
              timestamp: filledTrade.timestamp,
              isSaved: true,
              captureType: 'execution',
            },
            ...prev.slice(0, 99),
          ]);
        });
      }

      if (triOpps.length > 0 && triOpps[0].isActionable) {
        botRef.current.evaluateAndExecuteTriangular(triOpps[0], () => {
          setPortfolioBalance(botRef.current.getBalance());
          setBotTrades(botRef.current.getTradeHistory());
          setEquityCurve(botRef.current.getEquityCurve());
        });
      }
    });

    const unregOpp = manager.onActionableOpportunity((opp) => {
      if (opp.isActionable) {
        setOpportunityHistory((prev) => [
          { ...opp, isSaved: true, captureType: 'manual' },
          ...prev.slice(0, 99),
        ]);
      }
    });

    manager.start();

    return () => {
      unsubscribe();
      unregOpp();
      manager.stop();
    };
  }, []);

  // Update SoundFx enabled state
  useEffect(() => {
    SoundFx.setEnabled(config.soundEnabled);
  }, [config.soundEnabled]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '1') {
        handleSelectPair('BTC/USDT');
      } else if (e.key === '2') {
        handleSelectPair('ETH/USDT');
      } else if (e.key === '3') {
        handleSelectPair('SOL/USDT');
      } else if (e.key === '4') {
        handleSelectPair('AVAX/USDT');
      } else if (e.key.toLowerCase() === 'g' || e.key === '?') {
        setIsGuideOpen(true);
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleSound();
      } else if (e.key.toLowerCase() === 'c') {
        setIsConfigOpen(true);
      } else if (e.key.toLowerCase() === 'a') {
        setIsAiDrawerOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'i') {
        setShowWelcomeScreen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectPair = (pair: TradingPair) => {
    setConfig((prev) => ({ ...prev, activePair: pair }));
    feedManagerRef.current?.setPair(pair);
  };

  const handleToggleSound = () => {
    SoundFx.unlockAudio();
    setConfig((prev) => {
      const next = !prev.soundEnabled;
      if (next) {
        SoundFx.playTestChime();
      }
      return { ...prev, soundEnabled: next };
    });
  };

  const handleToggleConnect = () => {
    if (isConnected) {
      feedManagerRef.current?.stop();
      setIsConnected(false);
    } else {
      feedManagerRef.current?.start();
      setIsConnected(true);
    }
  };

  const handleSaveConfig = (newConfig: Partial<EngineConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      feedManagerRef.current?.updateConfig(updated);
      return updated;
    });
  };

  const handleUpdateBotConfig = (newBotConfig: Partial<BotConfig>) => {
    botRef.current.updateConfig(newBotConfig);
    setBotConfig(botRef.current.getConfig());
  };

  const handleResetPortfolio = () => {
    botRef.current.resetPortfolio();
    setPortfolioBalance(botRef.current.getBalance());
    setBotTrades([]);
    setEquityCurve(botRef.current.getEquityCurve());
  };

  const PERIOD_DURATIONS: Record<AutoCapturePeriod, number> = {
    off: 0,
    '15s': 15,
    '30s': 30,
    '1m': 60,
    '3m': 180,
    '5m': 300,
    '15m': 900,
  };

  const handleAutoCapturePeriodChange = (newPeriod: AutoCapturePeriod) => {
    if (newPeriod !== autoCapturePeriod) {
      // If user changes time period in between, remove already captured events that aren't saved yet
      setOpportunityHistory((prev) =>
        prev.filter((o) => o.isSaved === true || o.captureType === 'execution')
      );
      setAutoCapturePeriod(newPeriod);
      setCaptureSecondsRemaining(PERIOD_DURATIONS[newPeriod]);
    }
  };

  const handleSaveOpportunity = (id: string) => {
    setOpportunityHistory((prev) =>
      prev.map((o) => (o.id === id ? { ...o, isSaved: true } : o))
    );
  };

  const handleSaveAllOpportunities = () => {
    setOpportunityHistory((prev) =>
      prev.map((o) => ({ ...o, isSaved: true }))
    );
  };

  const handlePurgeUnsavedOpportunities = () => {
    setOpportunityHistory((prev) =>
      prev.filter((o) => o.isSaved === true || o.captureType === 'execution')
    );
  };

  const handleDeleteOpportunity = (id: string) => {
    setOpportunityHistory((prev) => prev.filter((o) => o.id !== id));
  };

  const handleCaptureSnapshot = (options?: {
    isSaved?: boolean;
    captureType?: 'auto' | 'manual' | 'execution';
    captureInterval?: AutoCapturePeriod;
  }) => {
    SoundFx.unlockAudio();
    const currentScan = scanResultRef.current;
    const currentConfig = configRef.current;
    let opp = currentScan.bestOpportunity;

    if (!opp) {
      const sorted = [...currentScan.matrix].sort((a, b) => b.netSpreadPct - a.netSpreadPct);
      if (sorted.length > 0) {
        const topCell = sorted[0];
        const buyTop = currentScan.topOfBook[topCell.buyExchange];
        const sellTop = currentScan.topOfBook[topCell.sellExchange];
        opp = {
          id: `manual-snapshot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: Date.now(),
          pair: currentConfig.activePair,
          buyExchange: topCell.buyExchange,
          buyPrice: buyTop ? buyTop.ask : 0,
          buySizeAvailable: buyTop ? buyTop.askQty : 0,
          sellExchange: topCell.sellExchange,
          sellPrice: sellTop ? sellTop.bid : 0,
          sellSizeAvailable: sellTop ? sellTop.bidQty : 0,
          grossSpreadPct: topCell.grossSpreadPct,
          grossSpreadBps: topCell.grossSpreadPct * 100,
          slippagePct: 0.02,
          buyFeeBps: currentConfig.feePresets[topCell.buyExchange]?.takerBps ?? 4,
          sellFeeBps: currentConfig.feePresets[topCell.sellExchange]?.takerBps ?? 4,
          totalFeeBps: (currentConfig.feePresets[topCell.buyExchange]?.takerBps ?? 4) + (currentConfig.feePresets[topCell.sellExchange]?.takerBps ?? 4),
          netSpreadPct: topCell.netSpreadPct,
          netSpreadBps: topCell.netSpreadPct * 100,
          simulatedNotionalUSD: currentConfig.simulatedOrderSizeUSD,
          netProfitUSD: topCell.netProfitUSD,
          isActionable: topCell.isActionable,
          estimatedExecutionLatencyMs: 12.5,
        };
      }
    }

    if (opp) {
      if (options?.captureType === 'manual') {
        SoundFx.playOpportunityChime();
      }
      const isSaved = options?.isSaved ?? true;
      const captureType = options?.captureType ?? 'manual';
      const captureInterval = options?.captureInterval;
      const snapshotEntry: ArbitrageOpportunity = {
        ...opp,
        id: `snap-${captureType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        isSaved,
        captureType,
        captureInterval,
      };
      setOpportunityHistory((prev) => [snapshotEntry, ...prev.slice(0, 99)]);
    }
  };

  // Autonomous Snapshot Timer Engine
  useEffect(() => {
    if (autoCapturePeriod === 'off') {
      setCaptureSecondsRemaining(0);
      return;
    }

    const durationSec = PERIOD_DURATIONS[autoCapturePeriod];
    let targetTime = Date.now() + durationSec * 1000;
    setCaptureSecondsRemaining(durationSec);

    const intervalId = setInterval(() => {
      const now = Date.now();
      const diffMs = targetTime - now;

      if (diffMs <= 0) {
        // Trigger instantaneous snapshot capture at this very moment
        handleCaptureSnapshot({
          isSaved: false,
          captureType: 'auto',
          captureInterval: autoCapturePeriod,
        });
        targetTime = Date.now() + durationSec * 1000;
        setCaptureSecondsRemaining(durationSec);
      } else {
        setCaptureSecondsRemaining(Math.max(0, Math.ceil(diffMs / 1000)));
      }
    }, 250);

    return () => clearInterval(intervalId);
  }, [autoCapturePeriod]);

  const handleExecuteTrade = (opp: ArbitrageOpportunity) => {
    SoundFx.unlockAudio();
    const tradeEntry: ArbitrageOpportunity = {
      ...opp,
      id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      isSaved: true,
      captureType: 'execution',
    };
    setOpportunityHistory((prev) => [tradeEntry, ...prev.slice(0, 99)]);
  };

  const handleExecuteTriangularTrade = (opp: TriangularOpportunity) => {
    SoundFx.unlockAudio();
    const tradeRecord: BotTradeRecord = {
      id: `manual-tri-${Date.now()}`,
      timestamp: Date.now(),
      pair: opp.executionPathStr,
      type: 'TRIANGULAR',
      buyVenue: opp.hops[0]?.exchange || 'binance',
      sellVenue: opp.hops[2]?.exchange || 'coinbase',
      notionalUSD: opp.simulatedNotionalUSD,
      netProfitUSD: opp.netProfitUSD,
      netSpreadPct: opp.netSpreadPct,
      latencyMs: opp.estimatedLatencyMs,
      aiAssisted: false,
    };

    setBotTrades((prev) => [tradeRecord, ...prev.slice(0, 99)]);
  };

  if (showWelcomeScreen) {
    return <CinematicWelcomeScreen onEnterTerminal={() => setShowWelcomeScreen(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 flex flex-col font-sans selection:bg-white/20 selection:text-white relative overflow-x-hidden">
      {/* Retro Black & White Background */}
      <CyberBackground />

      {/* Header Bar with View Mode Tabs & AI Copilot Trigger */}
      <Header
        config={config}
        metrics={metrics}
        onSelectPair={handleSelectPair}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onToggleSound={handleToggleSound}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAiCopilot={() => setIsAiDrawerOpen(true)}
        onOpenWelcomeScreen={() => setShowWelcomeScreen(true)}
        isConnected={isConnected}
        onToggleConnect={handleToggleConnect}
        currentViewMode={viewMode}
        onSelectViewMode={setViewMode}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-6 space-y-6 relative z-10">
        {/* Quant Execution Suite Navigation & Status Hub */}
        <QuantSuiteHub
          currentView={viewMode}
          onSelectView={setViewMode}
          onOpenAiCopilot={() => setIsAiDrawerOpen(true)}
          bestOpportunity={scanResult.bestOpportunity}
          triangularOpportunities={triangularOpportunities}
          botConfig={botConfig}
          portfolioBalance={portfolioBalance}
        />

        {/* VIEW 1: Tactical Cross-Venue Matrix */}
        {viewMode === 'tactical' && (
          <>
            <ArbitrageMatrix
              scanResult={scanResult}
              config={config}
              onExecuteSimulatedTrade={handleExecuteTrade}
            />

            {/* Live Quant Engine Overview & Mini Controls */}
            <TacticalQuantWidgets
              onSelectView={setViewMode}
              onOpenAiCopilot={() => setIsAiDrawerOpen(true)}
              bestOpportunity={scanResult.bestOpportunity}
              triangularOpportunities={triangularOpportunities}
              microstructureMetrics={microstructureMetrics}
              botConfig={botConfig}
              onUpdateBotConfig={handleUpdateBotConfig}
              portfolioBalance={portfolioBalance}
              onExecuteTriangular={handleExecuteTriangularTrade}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <ThreeDArbitrageOrb scanResult={scanResult} />
              </div>
              <div className="lg:col-span-7">
                <SpreadHistoryChart
                  currentOpportunity={scanResult.bestOpportunity}
                  config={config}
                />
              </div>
            </div>

            <OrderBookDepth books={books} />
            <VenueTopologyMap metrics={metrics} />
            <LatencyTelemetryPanel metrics={metrics} />
          </>
        )}

        {/* VIEW 2: Triangular Arbitrage & Cyclic Graph */}
        {viewMode === 'triangular' && (
          <>
            <TriangularArbitragePanel
              opportunities={triangularOpportunities}
              onExecuteTriangular={handleExecuteTriangularTrade}
              onAskAiAboutOpportunity={() => setIsAiDrawerOpen(true)}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <ThreeDArbitrageOrb scanResult={scanResult} />
              </div>
              <div className="lg:col-span-7">
                <SpreadHistoryChart
                  currentOpportunity={scanResult.bestOpportunity}
                  config={config}
                />
              </div>
            </div>
            <LatencyTelemetryPanel metrics={metrics} />
          </>
        )}

        {/* VIEW 3: Autonomous Quant Bot & Live Equity Curve */}
        {viewMode === 'bot' && (
          <>
            <AutoTradingBotPanel
              botConfig={botConfig}
              onUpdateBotConfig={handleUpdateBotConfig}
              balance={portfolioBalance}
              trades={botTrades}
              equityCurve={equityCurve}
              onResetPortfolio={handleResetPortfolio}
            />
            <LatencyTelemetryPanel metrics={metrics} />
          </>
        )}

        {/* VIEW 4: Microstructure Alpha & OBI Gauges */}
        {viewMode === 'microstructure' && (
          <>
            <MicrostructureAlphaPanel
              metrics={microstructureMetrics}
              activePair={config.activePair}
            />
            <OrderBookDepth books={books} />
            <LatencyTelemetryPanel metrics={metrics} />
          </>
        )}

        {/* VIEW 5: Global Cross-Asset Mosaic View */}
        {viewMode === 'mosaic' && (
          <>
            <GlobalMosaicView
              pairs={['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT']}
              activePair={config.activePair}
              onSelectPair={handleSelectPair}
              books={books}
              bestOpportunity={scanResult.bestOpportunity}
              onExecuteTrade={handleExecuteTrade}
            />
            <SpreadHistoryChart
              currentOpportunity={scanResult.bestOpportunity}
              config={config}
            />
            <LatencyTelemetryPanel metrics={metrics} />
          </>
        )}

        {/* Persistent Row: Discrepancy Capture Audit Trail */}
        <OpportunityLog
          opportunities={opportunityHistory}
          onClear={() => setOpportunityHistory([])}
          onCaptureSample={() => handleCaptureSnapshot({ isSaved: true, captureType: 'manual' })}
          autoCapturePeriod={autoCapturePeriod}
          onPeriodChange={handleAutoCapturePeriodChange}
          secondsRemaining={captureSecondsRemaining}
          onSaveOpportunity={handleSaveOpportunity}
          onSaveAll={handleSaveAllOpportunities}
          onPurgeUnsaved={handlePurgeUnsavedOpportunities}
          onDeleteOpportunity={handleDeleteOpportunity}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#020202]/95 backdrop-blur-md py-4 px-6 text-center text-xs font-mono text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-bold">Arbwire Quantum 2.0 &bull; Institutional Quantitative Arbitrage Suite</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">1-4</kbd> Pairs &bull; <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">⌘K</kbd> CMD &bull; <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">A</kbd> AI Copilot</span>
            <span className="text-slate-300 font-bold">Venues: Binance &bull; Coinbase &bull; Kraken</span>
          </div>
        </div>
      </footer>

      {/* OpenRouter AI Quant Copilot Slide-out Drawer */}
      <AiQuantCopilotDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        currentOpportunity={scanResult.bestOpportunity}
        triangularOpportunities={triangularOpportunities}
        microstructureMetrics={microstructureMetrics}
      />

      {/* Engine Config Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        config={config}
        onClose={() => setIsConfigOpen(false)}
        onSave={handleSaveConfig}
      />

      {/* User Manual & Terms Guide Modal */}
      <HowToUseGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Power-User Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectPair={handleSelectPair}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onToggleSound={handleToggleSound}
        onSelectViewMode={setViewMode}
        onOpenAiCopilot={() => setIsAiDrawerOpen(true)}
        onOpenWelcomeScreen={() => setShowWelcomeScreen(true)}
      />

      {/* Floating AI Quant Copilot Badge */}
      <FloatingAiCopilotBadge
        isOpen={isAiDrawerOpen}
        onOpen={() => setIsAiDrawerOpen(true)}
      />
    </div>
  );
}

export default App;
