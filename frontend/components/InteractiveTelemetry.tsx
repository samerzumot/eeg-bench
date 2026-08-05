"use client";

import { useEffect, useRef, useState } from "react";

interface InteractiveTelemetryProps {
  isDark?: boolean;
}

export function InteractiveTelemetry({ isDark = false }: InteractiveTelemetryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [latency, setLatency] = useState(45);
  const [classification, setClassification] = useState({ label: "IDLE", confidence: 92 });
  const [signalQuality, setSignalQuality] = useState(99.1);

  // Fluctuating stats
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(42 + Math.random() * 6));
      setSignalQuality(parseFloat((98.5 + Math.random() * 1.3).toFixed(1)));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Classification simulation loop
  useEffect(() => {
    const states = [
      { label: "LEFT HAND MOTOR IMAGERY", confidence: 89 },
      { label: "RIGHT HAND MOTOR IMAGERY", confidence: 94 },
      { label: "IDLE", confidence: 92 },
      { label: "LEFT HAND MOTOR IMAGERY", confidence: 87 },
      { label: "IDLE", confidence: 95 },
      { label: "RIGHT HAND MOTOR IMAGERY", confidence: 91 },
    ];
    let stateIdx = 0;
    const interval = setInterval(() => {
      stateIdx = (stateIdx + 1) % states.length;
      setClassification(states[stateIdx]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Waveform rendering loop
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
      { name: "C3 (Left Motor)", color: "#10B981", speed: 0.05, amp: 14, freq: 0.015 },
      { name: "C4 (Right Motor)", color: "#3B9B8F", speed: 0.06, amp: 12, freq: 0.018 },
      { name: "FCz (Frontal)", color: "#6366F1", speed: 0.04, amp: 10, freq: 0.012 },
      { name: "O2 (Occipital)", color: "#F59E0B", speed: 0.08, amp: 8, freq: 0.025 },
    ];

    const render = () => {
      offset += 1;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid background
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)";
      ctx.lineWidth = 1;
      const step = 30;
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

      // Render each channel
      const chHeight = h / channels.length;
      channels.forEach((ch, idx) => {
        const centerY = idx * chHeight + chHeight / 2;

        // Channel baseline
        ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(w, centerY);
        ctx.stroke();

        // Waveform
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < w; x += 3) {
          const ampModifier =
            classification.label !== "IDLE" && ch.name.includes(classification.label.includes("LEFT") ? "C4" : "C3")
              ? 2.2 // Desynchronization activation
              : 1.0;

          const y =
            centerY +
            Math.sin(x * ch.freq + offset * ch.speed) * ch.amp * ampModifier +
            Math.cos(x * 0.008 - offset * 0.02) * 4;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Channel Label text
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)";
        ctx.font = "bold 18px var(--font-jetbrains-mono), monospace";
        ctx.fillText(ch.name, 20, idx * chHeight + 30);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [classification, isDark]);

  return (
    <div className={`w-full rounded-2xl border overflow-hidden flex flex-col h-[340px] md:h-[400px] transition-all duration-300 ${
      isDark
        ? "border-white/10 bg-black/40 backdrop-blur-md"
        : "border-slate-200 bg-white/90 shadow-md backdrop-blur-md"
    }`}>
      {/* Telemetry Header */}
      <div className={`border-b px-4 py-3 flex items-center justify-between text-xs font-data ${
        isDark ? "border-white/10 bg-white/[0.02] text-white" : "border-slate-100 bg-slate-50/50 text-slate-700"
      }`}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold tracking-wider font-mono">LIVE TELEMETRY STREAM</span>
        </div>
        <div className={isDark ? "text-white/40" : "text-slate-400"}>bniAdam-1 ENGINE</div>
      </div>

      {/* Main Split Grid */}
      <div className={`flex-grow grid grid-cols-1 md:grid-cols-[1fr_240px] divide-y md:divide-y-0 md:divide-x ${
        isDark ? "divide-white/10" : "divide-slate-100"
      }`}>
        {/* Waveform Visualization */}
        <div className="relative overflow-hidden min-h-[180px]">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Decoder Status Panel */}
        <div className={`p-5 flex flex-col justify-between font-data ${
          isDark ? "bg-white/[0.01]" : "bg-slate-50/20"
        }`}>
          <div>
            <div className={`text-[10px] uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-400"}`}>Decoder State</div>
            <div className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE / DECODING
            </div>

            <div className={`mt-6 text-[10px] uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-400"}`}>Active Inference</div>
            <div className={`mt-1.5 text-sm font-semibold tracking-wide truncate ${isDark ? "text-white" : "text-slate-800"}`}>
              {classification.label}
            </div>

            {/* Confidence Bar */}
            <div className="mt-3">
              <div className={`flex items-center justify-between text-[11px] mb-1 ${isDark ? "text-white/60" : "text-slate-500"}`}>
                <span>Confidence</span>
                <span>{classification.confidence}%</span>
              </div>
              <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${classification.confidence}%` }}
                />
              </div>
            </div>
          </div>

          <div className={`mt-6 space-y-3 border-t pt-4 text-[11px] ${isDark ? "border-white/5" : "border-slate-100"}`}>
            <div className="flex justify-between">
              <span className={isDark ? "text-white/40" : "text-slate-400"}>Latency</span>
              <span className={isDark ? "text-white/80" : "text-slate-700"}>{latency}ms</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? "text-white/40" : "text-slate-400"}>Signal Quality</span>
              <span className="text-emerald-600 dark:text-emerald-400">{signalQuality}%</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? "text-white/40" : "text-slate-400"}>EEG Montage</span>
              <span className={isDark ? "text-white/80" : "text-slate-700"}>10-20 Standard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
