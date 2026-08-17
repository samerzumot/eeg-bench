"use client";

import { useEffect, useRef } from "react";

interface LiveWaveformCanvasProps {
  samples: {
    tp9: number[];
    af7: number[];
    af8: number[];
    tp10: number[];
    ilfSlowWave?: number[];
  };
  orfHz?: number;
  className?: string;
}

export function LiveWaveformCanvas({
  samples,
  orfHz = 0.005,
  className = "",
}: LiveWaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const step = 24;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const channels: Array<{
      name: string;
      sub: string;
      data: number[];
      color: string;
      isIlf?: boolean;
    }> = [
      {
        name: `ILF (${orfHz}Hz)`,
        sub: "Slow Cortical Potential",
        data: samples.ilfSlowWave || [],
        color: "#F59E0B",
        isIlf: true,
      },
      { name: "AF7", sub: "Left Prefrontal", data: samples.af7, color: "#3B9B8F" },
      { name: "AF8", sub: "Right Prefrontal", data: samples.af8, color: "#2DD4BF" },
      { name: "TP9", sub: "Left Temporal", data: samples.tp9, color: "#38BDF8" },
      { name: "TP10", sub: "Right Temporal", data: samples.tp10, color: "#818CF8" },
    ];

    const channelHeight = height / channels.length;

    channels.forEach((ch, idx) => {
      const centerY = idx * channelHeight + channelHeight / 2;

      // Channel zero line
      ctx.strokeStyle = ch.isIlf ? "rgba(245, 158, 11, 0.15)" : "rgba(255, 255, 255, 0.06)";
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(78, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Channel label
      ctx.fillStyle = ch.color;
      ctx.font = "600 9.5px var(--font-jetbrains-mono, monospace)";
      ctx.fillText(ch.name, 10, centerY - 2);

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "400 7.5px var(--font-inter, sans-serif)";
      ctx.fillText(ch.sub, 10, centerY + 9);

      // Waveform line
      const data = ch.data;
      if (data && data.length > 1) {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = ch.isIlf ? 1.75 : 1.15;
        ctx.beginPath();

        const startX = 85;
        const availableWidth = width - startX - 10;
        const stepX = availableWidth / (data.length - 1);

        for (let i = 0; i < data.length; i++) {
          const x = startX + i * stepX;
          // Scale raw signal: 1 uV approx 0.6px, ILF slow wave normalized (-1 to +1) scaled by 14px
          const y = ch.isIlf ? centerY - (data[i] || 0) * 14 : centerY - (data[i] || 0) * 0.6;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    });
  }, [samples, orfHz]);

  return (
    <div className={`relative w-full rounded-xl bg-[#0F1115] border border-white/10 overflow-hidden ${className}`}>
      <div className="absolute top-2 right-3 z-10 flex items-center gap-2">
        <span className="text-[9px] font-mono text-amber-400/80 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
          ILF {orfHz} Hz
        </span>
        <span className="text-[10px] font-mono text-white/40 tracking-wider">4-CH EEG + DC Slow Wave</span>
      </div>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
