"use client";

import { useEffect, useRef } from "react";

interface BrainHealthGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

export function BrainHealthGauge({ score, label = "Brain Health Score", size = 200 }: BrainHealthGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getColor = (s: number) => {
    if (s >= 80) return "#22c55e"; // green
    if (s >= 60) return "#eab308"; // yellow
    if (s >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const getLabel = (s: number) => {
    if (s >= 80) return "Within normal range";
    if (s >= 60) return "Mild abnormalities";
    if (s >= 40) return "Moderate abnormalities";
    return "Significant abnormalities";
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 16;
    const lineWidth = 12;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0.75 * Math.PI, 2.25 * Math.PI);
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Score arc
    const scoreAngle = 0.75 * Math.PI + (score / 100) * 1.5 * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0.75 * Math.PI, scoreAngle);
    ctx.strokeStyle = getColor(score);
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Score text
    ctx.fillStyle = "#1d1d1f";
    ctx.font = `300 ${size * 0.22}px "JetBrains Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(score.toString(), cx, cy - 4);

    // Label
    ctx.fillStyle = "#86868b";
    ctx.font = `400 ${size * 0.06}px "Inter", sans-serif`;
    ctx.fillText("/ 100", cx, cy + size * 0.12);
  }, [score, size]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
      />
      <p className="text-sm font-medium text-text-primary -mt-2">{label}</p>
      <p className="text-xs mt-1" style={{ color: getColor(score) }}>
        {getLabel(score)}
      </p>
    </div>
  );
}
