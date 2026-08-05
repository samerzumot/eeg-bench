"use client";

import { useEffect, useRef } from "react";

export function InteractiveTelemetry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Waveform rendering loop using Brownian motion / random walk signal traces (realistic EEG representation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
    };
    resize();
    window.addEventListener("resize", resize);

    const channels = [
      { name: "C3", desc: "Motor Left" },
      { name: "C4", desc: "Motor Right" },
      { name: "FCz", desc: "Frontal" },
      { name: "O2", desc: "Occipital" },
    ];

    // Seed continuous waveforms buffers
    const bufferSize = 250;
    const buffers: number[][] = Array.from({ length: channels.length }, () => {
      const buf: number[] = [];
      let val = 0;
      for (let i = 0; i < bufferSize; i++) {
        val += (Math.random() - 0.5) * 1.5;
        val *= 0.95;
        buf.push(val);
      }
      return buf;
    });

    const render = () => {
      offset += 1;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid background (faint EEG paper grids)
      ctx.strokeStyle = "rgba(0, 0, 0, 0.015)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const chHeight = h / channels.length;

      channels.forEach((ch, idx) => {
        const buf = buffers[idx];
        const centerY = idx * chHeight + chHeight / 2;

        // Baseline reference line
        ctx.strokeStyle = "rgba(0, 0, 0, 0.02)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(w, centerY);
        ctx.stroke();

        // Generate new point (Brownian random walk + minor noise)
        let noiseStep = (Math.random() - 0.5) * 2.8;
        let nextVal = buf[buf.length - 1];
        nextVal += noiseStep + Math.sin(offset * 0.1) * 0.4;
        nextVal *= 0.94; // stability decay
        buf.push(nextVal);
        buf.shift();

        // Plot waveform trace
        ctx.strokeStyle = "rgba(71, 85, 105, 0.65)"; // Slate-600
        ctx.lineWidth = 1.0;
        ctx.beginPath();

        const stepX = w / (bufferSize - 1);
        for (let i = 0; i < buf.length; i++) {
          const x = i * stepX;
          const borderFade = Math.sin((i / (bufferSize - 1)) * Math.PI);
          const y = centerY + buf[i] * 3.5 * borderFade;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Channel descriptor labels
        ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
        ctx.font = "bold 15px var(--font-jetbrains-mono), monospace";
        ctx.fillText(ch.name, 25, idx * chHeight + 35);
        
        ctx.font = "400 11px var(--font-sans), sans-serif";
        ctx.fillStyle = "rgba(15, 23, 42, 0.25)";
        ctx.fillText(ch.desc, 60, idx * chHeight + 34);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col h-[280px]">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-2 flex items-center justify-between text-[11px] font-data text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="font-semibold tracking-wider uppercase font-mono">Continuous EEG Signal Stream</span>
        </div>
        <div>256 Hz · 10-20 system</div>
      </div>

      {/* Waveform Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
