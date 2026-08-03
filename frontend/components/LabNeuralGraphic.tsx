"use client";

import { useEffect, useRef } from "react";

export function LabNeuralGraphic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      time += 0.015;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Clean background grid (ultra subtle)
      ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw 3 smooth wave lines
      const waves = [
        { freq: 0.008, amp: 24, offset: 0, color: "rgba(59, 155, 143, 0.4)", width: 2 },
        { freq: 0.012, amp: 16, offset: 2, color: "rgba(29, 29, 31, 0.15)", width: 1.5 },
        { freq: 0.006, amp: 30, offset: 4, color: "rgba(59, 155, 143, 0.25)", width: 1.5 },
      ];

      const centerY = height / 2;

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.width;

        for (let x = 0; x <= width; x += 4) {
          const y =
            centerY +
            Math.sin(x * wave.freq + time + wave.offset) * wave.amp * Math.sin(x / width * Math.PI) +
            Math.cos(x * 0.003 + time * 0.5) * 8;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Central neural node array
      const nodeCount = 5;
      for (let i = 0; i < nodeCount; i++) {
        const cx = width * (0.2 + i * 0.15);
        const cy = centerY + Math.sin(time + i) * 12;
        const radius = 4 + Math.sin(time * 2 + i) * 1.5;

        // Outer pulse ring
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(59, 155, 143, 0.04)";
        ctx.fill();

        // Core node
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#3B9B8F";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-48 md:h-64 rounded-2xl bg-surface/50 border border-border overflow-hidden flex items-center justify-center backdrop-blur-xs">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute bottom-3 left-4 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-[11px] font-data text-text-secondary uppercase tracking-widest">
          BNIADAM-1 LATENT SIGNAL STREAM · 256 Hz
        </span>
      </div>
    </div>
  );
}
