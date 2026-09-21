import type { ArbitrageOpportunity, BotConfig, BotTradeRecord, EquityPoint, PortfolioBalance, TriangularOpportunity } from '../engine/types';

export class AutoExecutionBot {
  private config: BotConfig = {
    autoExecute: false,
    minNetSpreadPct: 0.15,
    maxExecutionLatencyMs: 35,
    orderSizeUSD: 10000,
    maxDailyDrawdownUSD: 2500,
    aiAssistedFiltering: true,
  };

  private balance: PortfolioBalance = {
    totalEquityUSD: 100000,
    initialCapitalUSD: 100000,
    cashUSDT: 70000,
    inventory: {
      BTC: 0.3,
      ETH: 2.5,
      SOL: 20,
      AVAX: 80,
    },
    exchangeAllocation: {
      binance: 35000,
      coinbase: 35000,
      kraken: 30000,
    },
  };

  private tradeHistory: BotTradeRecord[] = [];
  private equityCurve: EquityPoint[] = [
    { time: Date.now() - 3600000 * 4, cumulativePnL: 0, tradesCount: 0 },
  ];

  private maxEquitySeen: number = 100000;
  private maxDrawdownUSD: number = 0;
  private lastExecutionTime: number = 0;
  private minExecutionCooldownMs: number = 800; // Cooldown between auto fills

  constructor(initialConfig?: Partial<BotConfig>) {
    if (initialConfig) {
      this.config = { ...this.config, ...initialConfig };
    }
  }

  public getConfig(): BotConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<BotConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getBalance(): PortfolioBalance {
    return { ...this.balance };
  }

  public getTradeHistory(): BotTradeRecord[] {
    return [...this.tradeHistory];
  }

  public getEquityCurve(): EquityPoint[] {
    return [...this.equityCurve];
  }

  /**
   * Processes a live cross-venue 2-leg arbitrage opportunity
   */
  public evaluateAndExecute2Leg(
    opp: ArbitrageOpportunity,
    onFill?: (trade: BotTradeRecord) => void
  ): boolean {
    if (!this.config.autoExecute) return false;

    const now = Date.now();
    if (now - this.lastExecutionTime < this.minExecutionCooldownMs) return false;

    // Check risk conditions
    if (opp.netSpreadPct < this.config.minNetSpreadPct) return false;
    if (opp.estimatedExecutionLatencyMs > this.config.maxExecutionLatencyMs) return false;
    if (this.maxDrawdownUSD > this.config.maxDailyDrawdownUSD) return false;

    // Execute Paper Trade
    this.lastExecutionTime = now;
    const pnl = opp.netProfitUSD;

    // Update balances
    this.balance.totalEquityUSD += pnl;
    this.balance.cashUSDT += pnl;
    this.balance.exchangeAllocation[opp.buyExchange] -= this.config.orderSizeUSD;
    this.balance.exchangeAllocation[opp.sellExchange] += this.config.orderSizeUSD + pnl;

    // Track Drawdown
    if (this.balance.totalEquityUSD > this.maxEquitySeen) {
      this.maxEquitySeen = this.balance.totalEquityUSD;
    }
    const curDrawdown = this.maxEquitySeen - this.balance.totalEquityUSD;
    if (curDrawdown > this.maxDrawdownUSD) {
      this.maxDrawdownUSD = curDrawdown;
    }

    const tradeRecord: BotTradeRecord = {
      id: `bot-exec-${now}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      pair: opp.pair,
      type: '2-LEG',
      buyVenue: opp.buyExchange,
      sellVenue: opp.sellExchange,
      notionalUSD: this.config.orderSizeUSD,
      netProfitUSD: pnl,
      netSpreadPct: opp.netSpreadPct,
      latencyMs: opp.estimatedExecutionLatencyMs,
      aiAssisted: this.config.aiAssistedFiltering,
      aiConfidence: 0.94,
    };

    this.tradeHistory.unshift(tradeRecord);
    if (this.tradeHistory.length > 100) this.tradeHistory.pop();

    const cumulativePnL = this.balance.totalEquityUSD - this.balance.initialCapitalUSD;
    this.equityCurve.push({
      time: now,
      cumulativePnL,
      tradesCount: this.tradeHistory.length,
    });
    if (this.equityCurve.length > 80) this.equityCurve.shift();

    if (onFill) onFill(tradeRecord);
    return true;
  }

  /**
   * Processes a live 3-hop triangular arbitrage opportunity
   */
  public evaluateAndExecuteTriangular(
    opp: TriangularOpportunity,
    onFill?: (trade: BotTradeRecord) => void
  ): boolean {
    if (!this.config.autoExecute) return false;

    const now = Date.now();
    if (now - this.lastExecutionTime < this.minExecutionCooldownMs) return false;

    if (opp.netSpreadPct < this.config.minNetSpreadPct) return false;
    if (opp.estimatedLatencyMs > this.config.maxExecutionLatencyMs) return false;

    this.lastExecutionTime = now;
    const pnl = opp.netProfitUSD;

    this.balance.totalEquityUSD += pnl;
    this.balance.cashUSDT += pnl;

    const tradeRecord: BotTradeRecord = {
      id: `bot-tri-${now}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      pair: opp.executionPathStr,
      type: 'TRIANGULAR',
      buyVenue: opp.hops[0]?.exchange || 'binance',
      sellVenue: opp.hops[2]?.exchange || 'coinbase',
      notionalUSD: this.config.orderSizeUSD,
      netProfitUSD: pnl,
      netSpreadPct: opp.netSpreadPct,
      latencyMs: opp.estimatedLatencyMs,
      aiAssisted: this.config.aiAssistedFiltering,
      aiConfidence: 0.96,
    };

    this.tradeHistory.unshift(tradeRecord);
    if (this.tradeHistory.length > 100) this.tradeHistory.pop();

    const cumulativePnL = this.balance.totalEquityUSD - this.balance.initialCapitalUSD;
    this.equityCurve.push({
      time: now,
      cumulativePnL,
      tradesCount: this.tradeHistory.length,
    });
    if (this.equityCurve.length > 80) this.equityCurve.shift();

    if (onFill) onFill(tradeRecord);
    return true;
  }

  /**
   * Performance Statistics Calculation
   */
  public getPerformanceStats() {
    const totalTrades = this.tradeHistory.length;
    const winningTrades = this.tradeHistory.filter((t) => t.netProfitUSD > 0);
    const losingTrades = this.tradeHistory.filter((t) => t.netProfitUSD < 0);

    const winRatePct = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 100;
    const totalProfit = winningTrades.reduce((sum, t) => sum + t.netProfitUSD, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.netProfitUSD, 0));
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 12.5 : 1.0;

    const returns = this.tradeHistory.map((t) => t.netSpreadPct);
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const variance =
      returns.length > 1
        ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)
        : 0.01;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 2.85;

    return {
      totalEquityUSD: this.balance.totalEquityUSD,
      cumulativePnLUSD: this.balance.totalEquityUSD - this.balance.initialCapitalUSD,
      totalTrades,
      winRatePct,
      profitFactor,
      sharpeRatio,
      maxDrawdownUSD: this.maxDrawdownUSD,
      maxDrawdownPct: (this.maxDrawdownUSD / this.maxEquitySeen) * 100,
    };
  }

  public resetPortfolio() {
    this.balance = {
      totalEquityUSD: 100000,
      initialCapitalUSD: 100000,
      cashUSDT: 70000,
      inventory: {
        BTC: 0.3,
        ETH: 2.5,
        SOL: 20,
        AVAX: 80,
      },
      exchangeAllocation: {
        binance: 35000,
        coinbase: 35000,
        kraken: 30000,
      },
    };
    this.tradeHistory = [];
    this.equityCurve = [{ time: Date.now(), cumulativePnL: 0, tradesCount: 0 }];
    this.maxEquitySeen = 100000;
    this.maxDrawdownUSD = 0;
  }
}
