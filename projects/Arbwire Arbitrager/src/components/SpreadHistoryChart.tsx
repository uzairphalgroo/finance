import React, { useEffect, useRef } from 'react';
import { LineChart } from 'lucide-react';
import type { ArbitrageOpportunity, EngineConfig } from '../engine/types';

interface SpreadHistoryChartProps {
  currentOpportunity: ArbitrageOpportunity | null;
  config: EngineConfig;
}

interface DataPoint {
  time: number;
  grossSpread: number;
  netSpread: number;
  isActionable: boolean;
}

export const SpreadHistoryChart: React.FC<SpreadHistoryChartProps> = ({
  currentOpportunity,
  config,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dataPointsRef = useRef<DataPoint[]>([]);
  const maxPoints = 90;

  useEffect(() => {
    if (!currentOpportunity) return;

    const points = dataPointsRef.current;
    points.push({
      time: Date.now(),
      grossSpread: currentOpportunity.grossSpreadPct,
      netSpread: currentOpportunity.netSpreadPct,
      isActionable: currentOpportunity.isActionable,
    });

    if (points.length > maxPoints) {
      points.shift();
    }
  }, [currentOpportunity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const points = dataPointsRef.current;

      ctx.clearRect(0, 0, width, height);

      // Background Clean Monospace Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      for (let y = 20; y < height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      for (let x = 40; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if (points.length < 2) {
        animationId = requestAnimationFrame(render);
        return;
      }

      // Dynamic scale
      const spreads = points.map((p) => p.netSpread);
      const minVal = Math.min(-0.12, ...spreads);
      const maxVal = Math.max(config.actionableThresholdPct * 1.5, ...spreads, 0.28);
      const range = maxVal - minVal || 1;

      const getY = (val: number) => {
        const norm = (val - minVal) / range;
        return height - norm * (height - 44) - 22;
      };

      // 1. Draw Zero Reference Line
      const zeroY = getY(0);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(width, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Draw Actionable Threshold Line (Emerald / White)
      const threshY = getY(config.actionableThresholdPct);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, threshY);
      ctx.lineTo(width, threshY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Threshold Label Tag
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillText(`ACTIONABLE THRESHOLD (${config.actionableThresholdPct}%)`, 12, threshY - 6);

      // 3. Draw Institutional Gradient Fill
      const stepX = width / (maxPoints - 1);
      const startOffset = (maxPoints - points.length) * stepX;

      // Clean Emerald to Slate Fill
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)'); // Emerald
      gradient.addColorStop(0.6, 'rgba(16, 185, 129, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      points.forEach((p, idx) => {
        const x = startOffset + idx * stepX;
        const y = getY(p.netSpread);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      const lastX = startOffset + (points.length - 1) * stepX;
      ctx.lineTo(lastX, height);
      ctx.lineTo(startOffset, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke Waveform Line
      ctx.beginPath();
      points.forEach((p, idx) => {
        const x = startOffset + idx * stepX;
        const y = getY(p.netSpread);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Actionable Dislocation Nodes
      points.forEach((p, idx) => {
        if (p.isActionable) {
          const x = startOffset + idx * stepX;
          const y = getY(p.netSpread);

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Latest point marker
      if (points.length > 0) {
        const latest = points[points.length - 1];
        const latestY = getY(latest.netSpread);

        ctx.fillStyle = latest.isActionable ? '#34d399' : '#ffffff';
        ctx.beginPath();
        ctx.arc(lastX, latestY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [config.actionableThresholdPct]);

  return (
    <div className="glass-tile rounded-2xl border border-white/10 p-4.5 h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-tech font-bold text-sm text-slate-100 tracking-wider">
              REAL-TIME SPREAD HORIZON
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              60FPS Micro-Batched Net Yield Dynamics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            Net Spread
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono">90 Ticks</span>
        </div>
      </div>

      <div className="relative w-full h-52 sm:h-56 bg-[#03050a]/80 rounded-xl border border-white/[0.06] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={240}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
