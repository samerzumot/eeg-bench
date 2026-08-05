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
      setSignalQuality(parseFloat((98.5 + Math.random() * 1.1).toFixed(1)));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Classification simulation loop (reproducing event-related motor-imagery states)
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
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Waveform rendering loop using Brownian motion + Mu-rhythm modulation (physiological simulation)
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
      { name: "C3", desc: "Left Motor Cortex", color: "#10B981" },
      { name: "C4", desc: "Right Motor Cortex", color: "#06B6D4" },
      { name: "FCz", desc: "Frontal Midline", color: "#6366F1" },
      { name: "O2", desc: "Occipital Visual", color: "#F59E0B" },
    ];

    // Seed continuous waveforms buffers
    const bufferSize = 250;
    const buffers: number[][] = Array.from({ length: channels.length }, () => {
      const buf: number[] = [];
      let val = 0;
      for (let i = 0; i < bufferSize; i++) {
        val += (Math.random() - 0.5) * 2;
        val *= 0.95;
        buf.push(val);
      }
      return buf;
    });

    const render = () => {
      offset += 1;
      const w = canvas.width;
      const h = canvas.height;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, w, h);

      // Grid background (very faint)
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.015)" : "rgba(0, 0, 0, 0.015)";
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
        ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(w, centerY);
        ctx.stroke();

        // 1. Generate new point with physiological desynchronization simulation:
        // Motor imagery desynchronizes (attenuates) 10Hz Mu/Alpha power on the contralateral side.
        let isDesynced = false;
        if (classification.label === "LEFT HAND MOTOR IMAGERY" && ch.name === "C4") {
          isDesynced = true;
        } else if (classification.label === "RIGHT HAND MOTOR IMAGERY" && ch.name === "C3") {
          isDesynced = true;
        }

        // Brownian noise base step
        let noiseStep = (Math.random() - 0.5) * 3.5;

        // Add 10 Hz Mu component (desynchronizes during active motor imagery)
        const muAmp = isDesynced ? 0.4 : 2.5;
        const muComponent = Math.sin(offset * 0.22) * muAmp;

        let nextVal = buf[buf.length - 1];
        nextVal += noiseStep + muComponent;
        nextVal *= 0.94; // stability decay
        buf.push(nextVal);
        buf.shift();

        // 2. Plot waveform trace
        ctx.strokeStyle = isDark ? "rgba(255,255,255,0.7)" : "rgba(30,41,59,0.7)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();

        const stepX = w / (bufferSize - 1);
        for (let i = 0; i < buf.length; i++) {
          const x = i * stepX;
          // Apply windowing so it fades in/out cleanly at boundaries
          const borderFade = Math.sin((i / (bufferSize - 1)) * Math.PI);
          const y = centerY + buf[i] * 2.8 * borderFade;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 3. Channel descriptor labels
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(15, 23, 42, 0.5)";
        ctx.font = "500 18px var(--font-jetbrains-mono), monospace";
        ctx.fillText(ch.name, 25, idx * chHeight + 35);
        
        ctx.font = "400 13px var(--font-sans), sans-serif";
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(15, 23, 42, 0.3)";
        ctx.fillText(ch.desc, 65, idx * chHeight + 34);
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
        : "border-slate-200 bg-white/95 shadow-md backdrop-blur-md"
    }`}>
      {/* Telemetry Header */}
      <div className={`border-b px-4 py-3 flex items-center justify-between text-xs font-data ${
        isDark ? "border-white/10 bg-white/[0.02] text-white" : "border-slate-100 bg-slate-50/50 text-slate-700"
      }`}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500" />
          </span>
          <span className="font-semibold tracking-wider font-mono">SIMULATED DECODING FEED</span>
        </div>
        <div className={isDark ? "text-white/40" : "text-slate-400"}>bniAdam-1 ENGINE</div>
      </div>

      {/* Main Split Grid */}
      <div className={`flex-grow grid grid-cols-1 md:grid-cols-[1fr_230px] divide-y md:divide-y-0 md:divide-x ${
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
            <div className={`text-[10px] uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-400"}`}>Engine State</div>
            <div className="mt-1 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
              PLAYBACK / DEMO
            </div>

            <div className={`mt-6 text-[10px] uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-400"}`}>Predicted Intent</div>
            <div className={`mt-1.5 text-xs font-semibold tracking-wide truncate ${isDark ? "text-white" : "text-slate-800"}`}>
              {classification.label}
            </div>

            {/* Confidence Bar */}
            <div className="mt-3">
              <div className={`flex items-center justify-between text-[11px] mb-1 ${isDark ? "text-white/60" : "text-slate-500"}`}>
                <span>Accuracy Prob.</span>
                <span>{classification.confidence}%</span>
              </div>
              <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200/50"}`}>
                <div
                  className="h-full bg-slate-500 transition-all duration-500"
                  style={{ width: `${classification.confidence}%` }}
                />
              </div>
            </div>
          </div>

          <div className={`mt-6 space-y-3 border-t pt-4 text-[11px] ${isDark ? "border-white/5" : "border-slate-100"}`}>
            <div className="flex justify-between">
              <span className={isDark ? "text-white/40" : "text-slate-400"}>Simulated Latency</span>
              <span className={isDark ? "text-white/80" : "text-slate-700"}>{latency}ms</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? "text-white/40" : "text-slate-400"}>Signal Quality</span>
              <span className="text-slate-700">{signalQuality}%</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? "text-white/40" : "text-slate-400"}>Montage Standard</span>
              <span className={isDark ? "text-white/80" : "text-slate-700"}>10-20 EEG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
