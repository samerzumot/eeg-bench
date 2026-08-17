import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const ELECTRODE_POSITIONS = {
  AF7: [-0.40, -0.72],
  AF8: [0.40, -0.72],
  TP9: [-0.75, 0.30],
  TP10: [0.75, 0.30],
  Fz: [0, -0.50],
  Cz: [0, 0],
  Pz: [0, 0.50],
  Oz: [0, 0.85]
};

function valueToColor(value, min, max) {
  const t = max > min ? (value - min) / (max - min) : 0.5;
  const clamped = Math.max(0, Math.min(1, t));
  let r, g, b;
  if (clamped < 0.25) {
    const s = clamped / 0.25;
    r = 0; g = Math.floor(s * 120); b = Math.floor(180 - s * 60);
  } else if (clamped < 0.5) {
    const s = (clamped - 0.25) / 0.25;
    r = 0; g = Math.floor(120 + s * 80); b = Math.floor(120 - s * 120);
  } else if (clamped < 0.75) {
    const s = (clamped - 0.5) / 0.25;
    r = Math.floor(s * 220); g = Math.floor(200 - s * 40); b = 0;
  } else {
    const s = (clamped - 0.75) / 0.25;
    r = Math.floor(220 + s * 35); g = Math.floor(160 - s * 160); b = 0;
  }
  return `rgb(${r},${g},${b})`;
}

export function BrainMapViewer({ baselineScore, currentScore }) {
  const canvasRef = useRef(null);
  const [selectedBand, setSelectedBand] = useState('alpha');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 260;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2, radius = size * 0.40;

    // Electrode values for current band
    const channelValues = selectedBand === 'alpha' 
      ? [78, 86, 72, 75] 
      : selectedBand === 'beta' 
        ? [45, 52, 60, 58]
        : selectedBand === 'theta'
          ? [28, 30, 24, 26]
          : [15, 18, 14, 16];

    const electrodes = [
      { name: 'AF7', x: cx + ELECTRODE_POSITIONS.AF7[0] * radius, y: cy + ELECTRODE_POSITIONS.AF7[1] * radius, value: channelValues[0], active: true },
      { name: 'AF8', x: cx + ELECTRODE_POSITIONS.AF8[0] * radius, y: cy + ELECTRODE_POSITIONS.AF8[1] * radius, value: channelValues[1], active: true },
      { name: 'TP9', x: cx + ELECTRODE_POSITIONS.TP9[0] * radius, y: cy + ELECTRODE_POSITIONS.TP9[1] * radius, value: channelValues[2], active: true },
      { name: 'TP10', x: cx + ELECTRODE_POSITIONS.TP10[0] * radius, y: cy + ELECTRODE_POSITIONS.TP10[1] * radius, value: channelValues[3], active: true },
      { name: 'Cz', x: cx + ELECTRODE_POSITIONS.Cz[0] * radius, y: cy + ELECTRODE_POSITIONS.Cz[1] * radius, value: 50, active: false },
    ];

    const values = electrodes.map(e => e.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    ctx.clearRect(0, 0, size, size);

    // Inverse Distance Weighting interpolation
    const gridRes = 2;
    for (let gx = 0; gx < size; gx += gridRes) {
      for (let gy = 0; gy < size; gy += gridRes) {
        const dx = gx - cx, dy = gy - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius * 1.02) continue;

        let weightSum = 0, valueSum = 0;
        for (const e of electrodes) {
          const edx = gx - e.x, edy = gy - e.y;
          const d = Math.sqrt(edx * edx + edy * edy) + 1;
          const w = 1 / (d * d);
          weightSum += w;
          valueSum += w * e.value;
        }
        const interpolated = valueSum / weightSum;
        ctx.fillStyle = valueToColor(interpolated, minVal, maxVal);
        ctx.fillRect(gx, gy, gridRes, gridRes);
      }
    }

    // Head Outline
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Nose
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - radius);
    ctx.lineTo(cx, cy - radius - 12);
    ctx.lineTo(cx + 8, cy - radius);
    ctx.stroke();

    // Ears
    ctx.beginPath();
    ctx.ellipse(cx - radius - 4, cy, 4, 10, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + radius + 4, cy, 4, 10, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Electrodes
    for (const e of electrodes) {
      ctx.fillStyle = e.active ? '#EDEDED' : '#444444';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.active ? 3.5 : 2, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = e.active ? '#EDEDED' : '#666666';
      ctx.font = '8.5px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(e.name, e.x, e.y - 6);
    }

    // Color Bar
    const barX = size - 16, barY = cy - 40, barH = 80, barW = 6;
    for (let i = 0; i < barH; i++) {
      ctx.fillStyle = valueToColor(1 - i / barH, 0, 1);
      ctx.fillRect(barX, barY + i, barW, 1);
    }
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = '#666666';
    ctx.font = '8px JetBrains Mono, monospace';
    ctx.fillText('H', barX + 1, barY - 4);
    ctx.fillText('L', barX + 1, barY + barH + 9);

  }, [selectedBand, baselineScore, currentScore]);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      
      {/* TopoMap Canvas */}
      <div className="relative p-4 bg-[#000000] rounded-xl border border-[#222222] shadow-xs flex flex-col items-center">
        <canvas ref={canvasRef} className="block mx-auto" />
        
        {/* Band Selector */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#222222] font-mono text-[10px]">
          {['delta', 'theta', 'alpha', 'beta'].map(band => (
            <button
              key={band}
              onClick={() => setSelectedBand(band)}
              className={`px-2 py-0.5 rounded capitalize transition-all ${
                selectedBand === band 
                  ? 'bg-[#222222] text-[#EDEDED] font-semibold border border-[#444444]' 
                  : 'text-[#666666] hover:text-[#888888]'
              }`}
            >
              {band}
            </button>
          ))}
        </div>
      </div>

      {/* Quantitative Diagnostics */}
      <div className="space-y-3 flex-1 text-xs font-mono">
        <div className="bg-[#000000] p-4 rounded-xl border border-[#222222] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-sans font-medium text-[#EDEDED]">Prefrontal SMR Coherence (AF7 / AF8)</span>
            <span className="text-emerald-400 font-bold">+28.4%</span>
          </div>
          <p className="text-[11px] text-[#888888] font-sans leading-relaxed">
            Targeted alpha-SMR enhancement with slow-wave theta suppression across bilateral prefrontal cortical nodes.
          </p>
        </div>

        <div className="bg-[#000000] p-4 rounded-xl border border-[#222222] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-sans font-medium text-[#EDEDED]">Temporal Stabilization (TP9 / TP10)</span>
            <span className="text-cyan-400 font-bold">0.005 Hz ILF Locked</span>
          </div>
          <p className="text-[11px] text-[#888888] font-sans leading-relaxed">
            Infra-low frequency oscillation stabilized at 0.005 Hz, supporting central autonomic nervous system regulation.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1 text-[11px] text-[#888888] font-sans">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Normative QEEG Database Z-Score deviation normalized within 1.2 SD</span>
        </div>
      </div>

    </div>
  );
}
