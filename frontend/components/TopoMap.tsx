"use client";

import { useEffect, useRef } from "react";

// Standard 10-20 electrode positions (normalized 0-1 on a circular head)
const ELECTRODE_POSITIONS: Record<string, [number, number]> = {
  Fp1: [0.35, 0.12], Fp2: [0.65, 0.12],
  F7: [0.15, 0.28], F3: [0.35, 0.28], Fz: [0.50, 0.28], F4: [0.65, 0.28], F8: [0.85, 0.28],
  T3: [0.08, 0.50], C3: [0.30, 0.50], Cz: [0.50, 0.50], C4: [0.70, 0.50], T4: [0.92, 0.50],
  T5: [0.15, 0.72], P3: [0.35, 0.72], Pz: [0.50, 0.72], P4: [0.65, 0.72], T6: [0.85, 0.72],
  O1: [0.35, 0.88], O2: [0.65, 0.88],
};

interface TopoMapProps {
  channelValues: Record<string, number>;
  bandLabel?: string;
  size?: number;
  isDark?: boolean;
}

function interpolateColor(value: number, min: number, max: number): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  // Blue (low) → Green (mid) → Red (high)
  const r = t < 0.5 ? Math.round(t * 2 * 100) : Math.round(200 + (t - 0.5) * 2 * 55);
  const g = t < 0.5 ? Math.round(100 + t * 2 * 155) : Math.round(255 - (t - 0.5) * 2 * 200);
  const b = t < 0.5 ? Math.round(200 - t * 2 * 200) : Math.round(55 - (t - 0.5) * 2 * 55);
  return `rgb(${r},${g},${b})`;
}

export function TopoMap({ channelValues, bandLabel = "Alpha Power", size = 240, isDark = false }: TopoMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const values = Object.values(channelValues);
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Head outline
    const cx = size / 2;
    const cy = size / 2;
    const headRadius = size * 0.42;

    // Background fill
    ctx.clearRect(0, 0, size, size);
    if (!isDark) {
      ctx.fillStyle = "#fafafa";
      ctx.fillRect(0, 0, size, size);
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      ctx.beginPath();
      ctx.arc(cx, cy, headRadius, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Head circle
    ctx.beginPath();
    ctx.arc(cx, cy, headRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.15)" : "#d1d1d6";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Nose indicator
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - headRadius);
    ctx.lineTo(cx, cy - headRadius - 10);
    ctx.lineTo(cx + 8, cy - headRadius);
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.15)" : "#d1d1d6";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Interpolated color blobs at each electrode
    Object.entries(channelValues).forEach(([ch, val]) => {
      const pos = ELECTRODE_POSITIONS[ch];
      if (!pos) return;

      const x = pos[0] * size;
      const y = pos[1] * size;
      const color = interpolateColor(val, min, max);

      // Gradient blob
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.12);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, isDark ? "rgba(0,0,0,0)" : "rgba(250,250,250,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.12, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Electrode dots + labels
    Object.entries(channelValues).forEach(([ch, val]) => {
      const pos = ELECTRODE_POSITIONS[ch];
      if (!pos) return;

      const x = pos[0] * size;
      const y = pos[1] * size;

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = isDark ? "#ffffff" : "#1d1d1f";
      ctx.fill();

      // Label
      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.4)" : "#86868b";
      ctx.font = `400 ${size * 0.04}px "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(ch, x, y + 5);
    });
  }, [channelValues, size, isDark]);

  return (
    <div className={`flex flex-col items-center p-6 rounded-2xl border transition-colors ${
      isDark
        ? "bg-white/[0.02] border-white/10"
        : "bg-surface border-border shadow-xs"
    }`}>
      <h3 className={`text-sm font-medium mb-3 ${isDark ? "text-white" : "text-text-primary"}`}>
        {bandLabel} Topography
      </h3>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="rounded-lg"
      />
      <div className="flex items-center gap-2 mt-4">
        <span className={`text-[10px] ${isDark ? "text-white/40" : "text-text-secondary"}`}>Low Activation</span>
        <div className="w-24 h-2 rounded-full" style={{
          background: "linear-gradient(90deg, rgb(0,100,200), rgb(100,255,100), rgb(255,55,0))"
        }} />
        <span className={`text-[10px] ${isDark ? "text-white/40" : "text-text-secondary"}`}>High Activation</span>
      </div>
    </div>
  );
}
