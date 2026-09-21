import type { ArbitrageOpportunity, MicrostructureMetrics, TriangularOpportunity } from '../engine/types';

export interface AiMarketAnalysis {
  headline: string;
  anomalyDriver: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedAction: string;
  estimatedFillProbabilityPct: number;
  marketRegime: string;
  rawText: string;
}

export class AiQuantCopilot {
  private static getApiKey(): string {
    try {
      return (
        (typeof window !== 'undefined' && localStorage.getItem('arbwire_openrouter_key')) ||
        (import.meta as unknown as { env?: { VITE_OPENROUTER_API_KEY?: string } }).env?.VITE_OPENROUTER_API_KEY ||
        ''
      );
    } catch {
      return '';
    }
  }

  private static readonly MODEL = 'anthropic/claude-3.5-sonnet:beta';
  private static readonly BACKUP_MODEL = 'openai/gpt-4o-mini';

  /**
   * Evaluates a live cross-venue or triangular arbitrage opportunity using OpenRouter AI
   */
  public static async analyzeDislocation(
    opp: ArbitrageOpportunity | TriangularOpportunity,
    microstructure?: MicrostructureMetrics[]
  ): Promise<AiMarketAnalysis> {
    const isTriangular = 'hops' in opp;

    const oppContext = isTriangular
      ? `Type: Triangular 3-Hop Arbitrage
Base Asset: ${opp.baseAsset}
Hops: ${opp.executionPathStr}
Net Spread: +${opp.netSpreadPct.toFixed(3)}% (${opp.netSpreadBps.toFixed(1)} bps)
Simulated Notional: $${opp.simulatedNotionalUSD.toLocaleString()}
Estimated Profit: +$${opp.netProfitUSD.toFixed(2)}
Estimated Latency: ${opp.estimatedLatencyMs}ms`
      : `Type: 2-Leg Cross-Venue Arbitrage
Pair: ${opp.pair}
Buy Venue: ${opp.buyExchange} @ $${opp.buyPrice.toFixed(2)}
Sell Venue: ${opp.sellExchange} @ $${opp.sellPrice.toFixed(2)}
Gross Spread: +${opp.grossSpreadPct.toFixed(3)}%
Net Spread: +${opp.netSpreadPct.toFixed(3)}% (${opp.netSpreadBps.toFixed(1)} bps)
Taker Fees: ${opp.totalFeeBps} bps | Slippage: ${opp.slippagePct}%
Simulated Notional: $${opp.simulatedNotionalUSD.toLocaleString()}
Estimated Profit: +$${opp.netProfitUSD.toFixed(2)}
Latency: ${opp.estimatedExecutionLatencyMs}ms`;

    const microContext = microstructure && microstructure.length > 0
      ? microstructure
          .map(
            (m) =>
              `- [${m.exchange.toUpperCase()}] Top-5 OBI: ${(m.top5Imbalance * 100).toFixed(1)}% | Pressure: ${m.directionalPressure} | VPIN Toxicity: ${(m.toxicityVpin * 100).toFixed(1)}%`
          )
          .join('\n')
      : 'Microstructure: Standard balanced book profile';

    const systemPrompt = `You are the Head Quantitative Market Making AI Copilot for Arbwire, a high-frequency cross-venue arbitrage system.
Analyze the provided live market dislocation data and order book microstructure.
Provide a concise, institutional-grade risk & execution assessment in JSON format with exactly these keys:
{
  "headline": "Short 1-line tactical takeaway",
  "anomalyDriver": "Likely market cause (e.g. liquidity vacuum, latency differential, aggressive taker flow)",
  "riskRating": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedAction": "Direct recommendation (e.g. Execute immediately, Wait for depth refill, Split order)",
  "estimatedFillProbabilityPct": 85,
  "marketRegime": "Trending Volatile" | "Quiet Rangebound" | "Fragmented Liquidity"
}`;

    const userPrompt = `LIVE MARKET EVENT TELEMETRY:
${oppContext}

MICROSTRUCTURE TELEMETRY:
${microContext}

Assess execution viability and answer in valid JSON.`;

    const apiKey = this.getApiKey();
    if (!apiKey) {
      return this.generateOfflineHeuristic(opp, microstructure);
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://arbwire.quant',
          'X-Title': 'Arbwire Quant Terminal',
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 350,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      return {
        headline: parsed.headline || 'High-probability cross-venue dislocation detected.',
        anomalyDriver: parsed.anomalyDriver || 'Inter-exchange matching engine latency lag.',
        riskRating: parsed.riskRating || (opp.netSpreadPct >= 0.2 ? 'LOW' : 'MEDIUM'),
        suggestedAction: parsed.suggestedAction || 'Execute simulated route fill with bounded slippage.',
        estimatedFillProbabilityPct: parsed.estimatedFillProbabilityPct || 92,
        marketRegime: parsed.marketRegime || 'Fragmented Liquidity',
        rawText: content,
      };
    } catch (err) {
      console.warn('OpenRouter API fallback to offline quant heuristic:', err);
      return this.generateOfflineHeuristic(opp, microstructure);
    }
  }

  /**
   * Fast offline heuristic analysis when network or key limit is hit
   */
  public static generateOfflineHeuristic(
    opp: ArbitrageOpportunity | TriangularOpportunity,
    microstructure?: MicrostructureMetrics[]
  ): AiMarketAnalysis {
    const netPct = opp.netSpreadPct;
    const isActionable = opp.isActionable;

    let driver = 'Geographic latency differential between regional matching engines.';
    let risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let fillProb = 88;
    let action = 'Execute instantaneous multi-leg order fill.';

    if (netPct > 0.25) {
      driver = 'Large aggressive taker market order cleared resting book depth on single venue.';
      risk = 'LOW';
      fillProb = 96;
      action = 'Execute immediate full-size route fill.';
    } else if (netPct < 0.05) {
      driver = 'Tight intra-day spread; transaction fees consume majority of dislocation.';
      risk = 'HIGH';
      fillProb = 62;
      action = 'Pass; spread does not clear standard risk hurdle rate.';
    }

    if (microstructure && microstructure.length > 0) {
      const highTox = microstructure.some((m) => m.toxicityVpin > 0.65);
      if (highTox) {
        risk = 'HIGH';
        driver += ' Heightened adverse selection flow detected via VPIN.';
      }
    }

    return {
      headline: isActionable
        ? `Actionable +${netPct.toFixed(3)}% dislocation clears fee hurdle rate.`
        : `Sub-margin +${netPct.toFixed(3)}% spread within normal bid/ask jitter.`,
      anomalyDriver: driver,
      riskRating: risk,
      suggestedAction: action,
      estimatedFillProbabilityPct: fillProb,
      marketRegime: 'Sub-Millisecond Microstructure Skew',
      rawText: JSON.stringify({ driver, risk, fillProb }),
    };
  }

  /**
   * Chat query with the Quant Copilot
   */
  public static async askCopilot(query: string, terminalContext: string): Promise<string> {
    const systemPrompt = `You are Arbwire AI, an institutional Quant Researcher and Market Microstructure Strategist.
You have access to live WebSocket order book streams from Binance, Coinbase, and Kraken.
Answer user questions concisely, precisely, and with quantitative rigor. Use terms like TOB, VWAP slippage, OBI, VPIN, Bellman-Ford negative cycles, and ring buffers. Keep answers focused and actionable.`;

    try {
      const apiKey = this.getApiKey();
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://arbwire.quant',
          'X-Title': 'Arbwire Quant Terminal',
        },
        body: JSON.stringify({
          model: this.BACKUP_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `TERMINAL CONTEXT:\n${terminalContext}\n\nUSER QUESTION:\n${query}` },
          ],
          temperature: 0.3,
          max_tokens: 450,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Unable to retrieve quantitative analysis.';
    } catch (e) {
      return `[Heuristic Mode] Analyzing query "${query}". In current market conditions with low latency, optimum route fill occurs when Net Spread exceeds standard maker/taker fee hurdle rates with positive Order Book Imbalance (OBI > 0.25).`;
    }
  }
}
