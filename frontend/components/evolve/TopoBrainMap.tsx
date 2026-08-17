"use client";

import { useEffect, useRef, useState } from "react";

const ELECTRODES = [
  { name: "AF7", x: -0.38, y: -0.70, active: true },
  { name: "AF8", x: 0.38, y: -0.70, active: true },
  { name: "TP9", x: -0.75, y: 0.28, active: true },
  { name: "TP10", x: 0.75, y: 0.28, active: true },
  { name: "Fz", x: 0, y: -0.50, active: false },
  { name: "Cz", x: 0, y: 0, active: false },
  { name: "Pz", x: 0, y: 0.50, active: false },
  { name: "Oz", x: 0, y: 0.85, active: false },
];

function interpolateColor(value: number, min: number, max: number): string {
  const norm = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0.5;
  let r: number, g: number, b: number;

  if (norm < 0.25) {
    const s = norm / 0.25;
    r = Math.floor(40 + s * 10);
    g = Math.floor(70 + s * 70);
    b = Math.floor(160 + s * 20);
  } else if (norm < 0.5) {
    const s = (norm - 0.25) / 0.25;
    r = Math.floor(50 + s * 10);
    g = Math.floor(140 + s * 40);
    b = Math.floor(180 - s * 80);
  } else if (norm < 0.75) {
    const s = (norm - 0.5) / 0.25;
    r = Math.floor(60 + s * 160);
    g = Math.floor(180 - s * 20);
    b = Math.floor(100 - s * 60);
  } else {
    const s = (norm - 0.75) / 0.25;
    r = Math.floor(220 + s * 25);
    g = Math.floor(160 - s * 90);
    b = Math.floor(40 - s * 30);
  }

  return `rgb(${r}, ${g}, ${b})`;
}

interface TopoBrainMapProps {
  className?: string;
  baselineCoherence?: number;
  currentCoherence?: number;
}

export function TopoBrainMap({ className = "", baselineCoherence = 45, currentCoherence = 78 }: TopoBrainMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedBand, setSelectedBand] = useState<"alpha" | "beta" | "theta" | "delta">("alpha");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 260;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.38;

    const bandWeights = {
      alpha: [82, 86, 74, 76],
      beta: [48, 54, 62, 59],
      theta: [26, 28, 22, 25],
      delta: [14, 16, 12, 15],
    };

    const channelValues = bandWeights[selectedBand];
    const nodes = ELECTRODES.map((e, idx) => ({
      ...e,
      xPos: cx + e.x * radius,
      yPos: cy + e.y * radius,
      val: e.active ? channelValues[idx] || 50 : 50,
    }));

    const vals = nodes.filter((n) => n.active).map((n) => n.val);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);

    ctx.clearRect(0, 0, size, size);

    // Inverse Distance Weighting interpolation
    const res = 2;
    for (let gx = 0; gx < size; gx += res) {
      for (let gy = 0; gy < size; gy += res) {
        const dx = gx - cx;
        const dy = gy - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius * 1.02) continue;

        let wSum = 0;
        let vSum = 0;
        for (const node of nodes.filter((n) => n.active)) {
          const edx = gx - node.xPos;
          const edy = gy - node.yPos;
          const d = Math.sqrt(edx * edx + edy * edy) + 1;
          const w = 1 / (d * d);
          wSum += w;
          vSum += w * node.val;
        }

        const interpolated = vSum / wSum;
        ctx.fillStyle = interpolateColor(interpolated, minVal - 5, maxVal + 5);
        ctx.fillRect(gx, gy, res, res);
      }
    }

    // Head Outline
    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Nose
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - radius);
    ctx.lineTo(cx, cy - radius - 10);
    ctx.lineTo(cx + 8, cy - radius);
    ctx.stroke();

    // Ears
    ctx.beginPath();
    ctx.ellipse(cx - radius - 4, cy, 4, 10, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + radius + 4, cy, 4, 10, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Nodes
    for (const node of nodes) {
      ctx.fillStyle = node.active ? "#1D1D1F" : "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.arc(node.xPos, node.yPos, node.active ? 3.5 : 2, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = node.active ? "#1D1D1F" : "rgba(0, 0, 0, 0.35)";
      ctx.font = "600 8.5px var(--font-jetbrains-mono, monospace)";
      ctx.textAlign = "center";
      ctx.fillText(node.name, node.xPos, node.yPos - 6);
    }
  }, [selectedBand]);

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">QEEG Cortical Topography</h3>
          <p className="text-xs text-text-secondary">Standard 10-20 system spatial power distribution</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-secondary">
          Z-SCORE RESTING
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-center">
        {/* Scalp canvas & band pills */}
        <div className="flex flex-col items-center">
          <div className="p-3 bg-surface rounded-2xl border border-border/70 shadow-inner">
            <canvas ref={canvasRef} className="block" />
          </div>

          <div className="flex items-center gap-1.5 mt-3">
            {(["delta", "theta", "alpha", "beta"] as const).map((band) => (
              <button
                key={band}
                onClick={() => setSelectedBand(band)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono capitalize transition-all ${
                  selectedBand === band
                    ? "bg-accent text-white font-semibold shadow-xs"
                    : "bg-surface text-text-secondary hover:text-text-primary hover:bg-border/30 border border-border"
                }`}
              >
                {band}
              </button>
            ))}
          </div>
        </div>

        {/* Diagnostics & clinical metrics */}
        <div className="space-y-3 font-data text-xs">
          <div className="p-3.5 rounded-xl bg-surface border border-border">
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-primary">Prefrontal SMR Coherence (AF7 / AF8)</span>
              <span className="text-accent font-semibold">+{((currentCoherence - baselineCoherence) / baselineCoherence * 100).toFixed(1)}%</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1 font-sans leading-relaxed">
              Targeted alpha-SMR enhancement with slow-wave theta suppression across bilateral prefrontal cortical nodes.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border">
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-primary">Temporal ILF Stabilization (TP9 / TP10)</span>
              <span className="text-teal-700 font-semibold">0.005 Hz Locked</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1 font-sans leading-relaxed">
              Infra-low frequency oscillation stabilized at 0.005 Hz, supporting central autonomic nervous system regulation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between text-text-secondary">
            <span>Normative Database Deviation:</span>
            <span className="font-medium text-text-primary">Z = +0.82 SD (Normalized)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
