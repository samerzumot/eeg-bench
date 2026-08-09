"use client";

import { useEffect, useRef, useState } from "react";

type ClassState = "Resting" | "Left Hand MI" | "Right Hand MI" | "Eyes Closed";

export function InteractiveTelemetry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Real-time state readouts to represent our UVP
  const [decodingState, setDecodingState] = useState<ClassState>("Resting");
  const [probs, setProbs] = useState({ eegnet: 0.72, riemann: 0.68, csp: 0.65 });
  const [biomarkers, setBiomarkers] = useState({ alphaPeak: 9.2, deltaPower: 12.4, entropy: 0.76 });
  const [triggerActive, setTriggerActive] = useState(false);

  // Simulation loop to cycle between trials and update state parameters
  useEffect(() => {
    const states: ClassState[] = ["Resting", "Right Hand MI", "Resting", "Left Hand MI", "Eyes Closed"];
    let stateIdx = 0;

    const interval = setInterval(() => {
      stateIdx = (stateIdx + 1) % states.length;
      const nextState = states[stateIdx];
      setDecodingState(nextState);

      if (nextState === "Right Hand MI") {
        setTriggerActive(true);
        setProbs({ eegnet: 0.84, riemann: 0.81, csp: 0.76 });
        setBiomarkers({ alphaPeak: 9.4, deltaPower: 11.2, entropy: 0.79 });
      } else if (nextState === "Left Hand MI") {
        setTriggerActive(true);
        setProbs({ eegnet: 0.81, riemann: 0.79, csp: 0.74 });
        setBiomarkers({ alphaPeak: 9.1, deltaPower: 11.5, entropy: 0.78 });
      } else if (nextState === "Eyes Closed") {
        setTriggerActive(false);
        setProbs({ eegnet: 0.89, riemann: 0.86, csp: 0.81 }); // High accuracy decoding alpha rhythm
        setBiomarkers({ alphaPeak: 8.9, deltaPower: 9.6, entropy: 0.65 }); // Entropy drops, alpha rises
      } else {
        setTriggerActive(false);
        setProbs({ eegnet: 0.45, riemann: 0.42, csp: 0.38 });
        setBiomarkers({ alphaPeak: 9.2, deltaPower: 12.4, entropy: 0.76 });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

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

      // Draw background highlight band if a trial trigger is active
      // We grab the state from the external loop via variables or active check
      const isRightHand = canvas.dataset.state === "Left Hand MI" || canvas.dataset.state === "Right Hand MI";
      const isEyesClosed = canvas.dataset.state === "Eyes Closed";

      if (isRightHand) {
        ctx.fillStyle = "rgba(59, 155, 143, 0.05)";
        ctx.fillRect(w * 0.4, 0, w * 0.5, h);

        ctx.strokeStyle = "rgba(59, 155, 143, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w * 0.4, 0);
        ctx.lineTo(w * 0.4, h);
        ctx.moveTo(w * 0.9, 0);
        ctx.lineTo(w * 0.9, h);
        ctx.stroke();

        ctx.fillStyle = "rgba(59, 155, 143, 0.6)";
        ctx.font = "bold 18px var(--font-jetbrains-mono), monospace";
        ctx.fillText("TRIGGER: IMAGERY TRIAL", w * 0.42, 28);
      } else if (isEyesClosed) {
        ctx.fillStyle = "rgba(99, 102, 241, 0.05)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(99, 102, 241, 0.6)";
        ctx.font = "bold 18px var(--font-jetbrains-mono), monospace";
        ctx.fillText("SYNCHRONIZED ALPHA OSCILLATIONS (O2)", 25, 28);
      }

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

        // Generate new point (Brownian random walk + frequency modifications based on state)
        let ampFactor = 3.5;
        let walkVariance = 2.8;
        let sineMod = Math.sin(offset * 0.1) * 0.4;

        if (canvas.dataset.state === "Right Hand MI" && ch.name === "C4") {
          // Increase amplitude and frequency of C4 (contralateral motor activation)
          walkVariance = 4.5;
          sineMod = Math.sin(offset * 0.35) * 2.0;
        } else if (canvas.dataset.state === "Left Hand MI" && ch.name === "C3") {
          // Increase amplitude and frequency of C3
          walkVariance = 4.5;
          sineMod = Math.sin(offset * 0.35) * 2.0;
        } else if (canvas.dataset.state === "Eyes Closed" && ch.name === "O2") {
          // Strong sinusoidal Alpha rhythm in Occipital channel
          walkVariance = 1.0;
          sineMod = Math.sin(offset * 0.22) * 4.8;
        }

        let noiseStep = (Math.random() - 0.5) * walkVariance;
        let nextVal = buf[buf.length - 1];
        nextVal += noiseStep + sineMod;
        nextVal *= 0.93; // stability decay
        buf.push(nextVal);
        buf.shift();

        // Plot waveform trace
        ctx.strokeStyle = ch.name === "O2" && canvas.dataset.state === "Eyes Closed" 
          ? "rgba(99, 102, 241, 0.8)" 
          : (ch.name === "C4" && canvas.dataset.state === "Right Hand MI") || (ch.name === "C3" && canvas.dataset.state === "Left Hand MI")
            ? "rgba(59, 155, 143, 0.85)"
            : "rgba(71, 85, 105, 0.6)";
        ctx.lineWidth = ch.name === "O2" && canvas.dataset.state === "Eyes Closed" ? 1.5 : 1.0;
        ctx.beginPath();

        const stepX = w / (bufferSize - 1);
        for (let i = 0; i < buf.length; i++) {
          const x = i * stepX;
          const borderFade = Math.sin((i / (bufferSize - 1)) * Math.PI);
          const y = centerY + buf[i] * ampFactor * borderFade;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Channel descriptor labels
        ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
        ctx.font = "bold 15px var(--font-jetbrains-mono), monospace";
        ctx.fillText(ch.name, 25, idx * chHeight + 38);
        
        ctx.font = "400 11px var(--font-sans), sans-serif";
        ctx.fillStyle = "rgba(15, 23, 42, 0.3)";
        ctx.fillText(ch.desc, 60, idx * chHeight + 37);
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
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden flex flex-col md:flex-row h-[420px] md:h-[280px]">
      
      {/* Waveform Canvas Panel */}
      <div className="flex-1 relative overflow-hidden h-[180px] md:h-full border-b md:border-b-0 md:border-r border-slate-100">
        {/* Pass states to canvas element to let the canvas read it inside standard animation loop */}
        <canvas 
          ref={canvasRef} 
          data-state={decodingState} 
          className="w-full h-full block" 
        />
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 bg-white/70 px-2 py-0.5 rounded backdrop-blur-xs border border-slate-100">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-data text-slate-500 uppercase tracking-widest">
            256 Hz · 10-20 Standard Montage
          </span>
        </div>
      </div>

      {/* Live UVP Metrics Overlay Panel */}
      <div className="w-full md:w-[220px] bg-slate-50/50 p-4 flex flex-col justify-between border-t md:border-t-0 border-slate-100">
        
        {/* Section A: Live Decoder State */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-data font-bold tracking-widest text-slate-400 uppercase">
              EEG-Bench Decoder
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-data uppercase font-semibold">
              Simulated Replay
            </span>
          </div>

          <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-xs">
            <p className="text-[10px] text-slate-400 font-data">DECODED STATE</p>
            <p className={`text-sm font-semibold mt-0.5 transition-colors duration-300 ${
              decodingState !== "Resting" ? "text-accent" : "text-slate-700"
            }`}>
              {decodingState}
            </p>
          </div>
        </div>

        {/* Section B: Pipeline Confidence Indicators */}
        <div className="space-y-2 mt-3 md:mt-0">
          <p className="text-[10px] font-data font-bold tracking-widest text-slate-400 uppercase">
            Model Confidence
          </p>
          
          <div className="space-y-1.5 font-data text-[10px]">
            <div>
              <div className="flex justify-between text-slate-600 mb-0.5">
                <span>EEGNet</span>
                <span className="font-bold">{(probs.eegnet * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 w-full bg-slate-200/70 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-500 ease-out" 
                  style={{ width: `${probs.eegnet * 100}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-0.5">
                <span>Riemann MDM</span>
                <span className="font-bold">{(probs.riemann * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 w-full bg-slate-200/70 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                  style={{ width: `${probs.riemann * 100}%` }} 
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-slate-600">
                <span>CSP + LDA</span>
                <span className="font-bold">{(probs.csp * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Live Biomarker Readouts */}
        <div className="space-y-2 pt-2 border-t border-slate-200/60 mt-3 md:mt-0">
          <p className="text-[10px] font-data font-bold tracking-widest text-slate-400 uppercase">
            Spectral Biomarkers
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-center font-data">
            <div className="bg-white p-1 rounded border border-slate-100">
              <p className="text-[8px] text-slate-400">APF</p>
              <p className="text-xs font-semibold text-slate-700">{biomarkers.alphaPeak}Hz</p>
            </div>
            <div className="bg-white p-1 rounded border border-slate-100">
              <p className="text-[8px] text-slate-400">Delta</p>
              <p className="text-xs font-semibold text-slate-700">{biomarkers.deltaPower.toFixed(1)}</p>
            </div>
            <div className="bg-white p-1 rounded border border-slate-100">
              <p className="text-[8px] text-slate-400">Entropy</p>
              <p className="text-xs font-semibold text-slate-700">{biomarkers.entropy}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
