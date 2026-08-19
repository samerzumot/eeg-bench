import React, { useState } from 'react';
import { Brain, Layers, Activity, Sparkles, Eye, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';

const ELECTRODES = [
  { id: 'Fp1', label: 'Fp1', x: 38, y: 18, region: 'Left Prefrontal' },
  { id: 'Fp2', label: 'Fp2', x: 62, y: 18, region: 'Right Prefrontal' },
  { id: 'AF7', label: 'AF7', x: 25, y: 28, region: 'Left Frontal (Muse)', active: true },
  { id: 'AF8', label: 'AF8', x: 75, y: 28, region: 'Right Frontal (Muse)', active: true },
  { id: 'F3',  label: 'F3',  x: 35, y: 36, region: 'Left Frontal' },
  { id: 'Fz',  label: 'Fz',  x: 50, y: 34, region: 'Mid-Frontal' },
  { id: 'F4',  label: 'F4',  x: 65, y: 36, region: 'Right Frontal' },
  { id: 'T3',  label: 'T3',  x: 16, y: 50, region: 'Left Temporal' },
  { id: 'C3',  label: 'C3',  x: 35, y: 50, region: 'Left Central (SMR)' },
  { id: 'Cz',  label: 'Cz',  x: 50, y: 50, region: 'Vertex' },
  { id: 'C4',  label: 'C4',  x: 65, y: 50, region: 'Right Central (SMR)' },
  { id: 'T4',  label: 'T4',  x: 84, y: 50, region: 'Right Temporal' },
  { id: 'TP9', label: 'TP9', x: 18, y: 64, region: 'Left Temp-Parietal (Muse)', active: true },
  { id: 'TP10',label: 'TP10',x: 82, y: 64, region: 'Right Temp-Parietal (Muse)', active: true },
  { id: 'P3',  label: 'P3',  x: 35, y: 66, region: 'Left Parietal' },
  { id: 'Pz',  label: 'Pz',  x: 50, y: 66, region: 'Mid-Parietal' },
  { id: 'P4',  label: 'P4',  x: 65, y: 66, region: 'Right Parietal' },
  { id: 'O1',  label: 'O1',  x: 40, y: 82, region: 'Left Occipital (Alpha)' },
  { id: 'O2',  label: 'O2',  x: 60, y: 82, region: 'Right Occipital (Alpha)' },
];

const FREQUENCY_BANDS = [
  { id: 'ilf', name: 'ILF Slow-Wave', range: '0.0001–0.05 Hz', desc: 'Subcortical regulatory stability & DMN tone' },
  { id: 'theta_beta', name: 'Theta / Beta Ratio', range: '4-8Hz / 13-21Hz', desc: 'Executive attention & ADHD biomarker' },
  { id: 'smr', name: 'SMR (Sensorimotor)', range: '12.0–15.0 Hz', desc: 'Somatic stillness & motor inhibition' },
  { id: 'alpha', name: 'Alpha Synchrony', range: '8.0–12.0 Hz', desc: 'Cortical idling & autonomic calm' },
  { id: 'beta', name: 'High-Beta Power', range: '20.0–30.0 Hz', desc: 'Sympathetic arousal & rumination' },
];

export function BrainMapViewer({ baselineScore = 58, currentScore = 86 }) {
  const [selectedBand, setSelectedBand] = useState('theta_beta');
  const [viewMode, setViewMode] = useState('comparison'); // 'comparison' | 'current'
  const [selectedElectrode, setSelectedElectrode] = useState(ELECTRODES[2]); // AF7

  // Topographic power generator based on band & electrode
  const getElectrodePower = (e, isCurrent) => {
    const baseMult = isCurrent ? 1.0 : 0.65;
    let val = 50;
    if (selectedBand === 'ilf') {
      val = e.id.startsWith('AF') || e.id.startsWith('TP') ? 88 * baseMult : 72 * baseMult;
    } else if (selectedBand === 'theta_beta') {
      val = isCurrent ? 38 : 82;
      if (e.id.startsWith('Fp') || e.id.startsWith('AF') || e.id === 'Fz') {
        val = isCurrent ? 32 : 94;
      }
    } else if (selectedBand === 'smr') {
      val = (e.id === 'Cz' || e.id === 'C3' || e.id === 'C4') ? 85 * baseMult : 60 * baseMult;
    } else if (selectedBand === 'alpha') {
      val = (e.id.startsWith('O') || e.id.startsWith('P')) ? 90 * baseMult : 65 * baseMult;
    } else if (selectedBand === 'beta') {
      val = isCurrent ? 30 : 75;
    }
    return Math.min(100, Math.max(10, Math.round(val)));
  };

  const getColorForPower = (power) => {
    if (selectedBand === 'theta_beta' || selectedBand === 'beta') {
      if (power < 40) return '#10B981'; // Optimal Green
      if (power < 65) return '#F59E0B'; // Moderate Amber
      return '#EF4444'; // Elevated Red
    }
    if (power > 75) return '#10B981';
    if (power > 50) return '#0D9488';
    if (power > 30) return '#3B82F6';
    return '#6366F1';
  };

  const renderScalpMap = (isCurrent, label) => {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center justify-between w-full px-2 text-xs font-mono">
          <span className="font-semibold text-[#EDEDED]">{label}</span>
          <span className={isCurrent ? 'text-emerald-400 font-bold' : 'text-[#888888]'}>
            {isCurrent ? `Score: ${currentScore}/100` : `Baseline: ${baselineScore}/100`}
          </span>
        </div>

        {/* Scalp Circular Container */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#0D0D0D] border-2 border-[#262626] shadow-inner flex items-center justify-center p-3">
          
          {/* Nose Indicator */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-[#333333]" />
          
          {/* Ear Indicators */}
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-2 h-7 rounded-l-md bg-[#262626]" />
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-2 h-7 rounded-r-md bg-[#262626]" />

          {/* Interpolated Topo Power Gradient Mesh */}
          <div 
            className="absolute inset-4 rounded-full opacity-60 pointer-events-none transition-all duration-700"
            style={{
              background: isCurrent
                ? selectedBand === 'theta_beta' || selectedBand === 'beta'
                  ? 'radial-gradient(circle at 50% 30%, rgba(16,185,129,0.5) 0%, rgba(13,148,136,0.3) 50%, rgba(10,10,10,0.8) 100%)'
                  : 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.55) 0%, rgba(6,95,70,0.3) 60%, rgba(10,10,10,0.8) 100%)'
                : 'radial-gradient(circle at 50% 25%, rgba(239,68,68,0.55) 0%, rgba(245,158,11,0.35) 50%, rgba(10,10,10,0.8) 100%)'
            }}
          />

          {/* Scalp Coordinate Grid Crosshairs */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#222222]" strokeWidth="1">
            <line x1="50%" y1="6%" x2="50%" y2="94%" />
            <line x1="6%" y1="50%" x2="94%" y2="50%" />
            <circle cx="50%" cy="50%" r="35%" fill="none" />
          </svg>

          {/* Electrodes */}
          {ELECTRODES.map((el) => {
            const power = getElectrodePower(el, isCurrent);
            const color = getColorForPower(power);
            const isSelected = selectedElectrode?.id === el.id;

            return (
              <div
                key={el.id}
                onClick={() => setSelectedElectrode(el)}
                style={{ left: `${el.x}%`, top: `${el.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                title={`${el.label} (${el.region}) — Power: ${power}%`}
              >
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-mono font-bold transition-transform ${
                    isSelected ? 'ring-2 ring-white scale-125 z-20 shadow-md' : 'hover:scale-115'
                  } ${el.active ? 'border border-emerald-400/70' : 'border border-[#333333]'}`}
                  style={{
                    backgroundColor: color,
                    color: '#000000'
                  }}
                >
                  {el.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#888888]">
          <span>Low</span>
          <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400" />
          <span>Optimal</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 rounded-xl bg-[#111111] border border-[#222222] space-y-6 text-[#EDEDED] font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-[#EDEDED]">
              Quantitative EEG (QEEG) Cortical Topography
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300">
              Verified QEEG-D Map
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-0.5">
            Scalp-wide spatial distribution of spectral power across 10-20 montages vs. Dr. Upasana Gala&apos;s normative reference.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 bg-[#161616] rounded-lg border border-[#333333] text-xs font-mono shrink-0">
          <button
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1 rounded transition-all ${
              viewMode === 'comparison'
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                : 'text-[#888888] hover:text-[#EDEDED]'
            }`}
          >
            Baseline vs. Current
          </button>
          <button
            onClick={() => setViewMode('current')}
            className={`px-3 py-1 rounded transition-all ${
              viewMode === 'current'
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                : 'text-[#888888] hover:text-[#EDEDED]'
            }`}
          >
            Current Only
          </button>
        </div>
      </div>

      {/* Band Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
        {FREQUENCY_BANDS.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBand(b.id)}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              selectedBand === b.id
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-xs'
                : 'bg-[#161616] border-[#222222] text-[#888888] hover:text-[#EDEDED]'
            }`}
          >
            <span className="font-semibold block truncate">{b.name}</span>
            <span className="text-[10px] text-[#666666] block">{b.range}</span>
          </button>
        ))}
      </div>

      {/* Scalp Maps Container */}
      <div className="p-4 rounded-xl bg-[#161616] border border-[#222222]">
        <div className="flex flex-wrap items-center justify-center gap-8 py-2">
          {viewMode === 'comparison' ? (
            <>
              {renderScalpMap(false, 'Pre-Therapy Baseline (Session 1)')}
              <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                  →
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">+28% Gain</span>
                <span className="text-[9px] text-[#666666]">14 Sessions</span>
              </div>
              {renderScalpMap(true, 'Latest Post-Training Topography')}
            </>
          ) : (
            renderScalpMap(true, 'Active Post-Training Topography')
          )}
        </div>
      </div>

      {/* Selected Electrode Deep Dive & Clinical Biomarkers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        
        {/* Left: Lead Detail */}
        <div className="p-4 rounded-xl bg-[#161616] border border-[#222222] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#888888]">Selected Lead:</span>
            <span className="font-bold text-emerald-400 text-sm">
              {selectedElectrode.label} — {selectedElectrode.region}
            </span>
          </div>
          <div className="space-y-1 text-[#CCCCCC] font-sans text-[11px]">
            <p>
              {selectedElectrode.active 
                ? 'Primary Muse 2/S telemetry montage lead. Continuously captured at 256 Hz with active EOG/EMG artifact rejection.'
                : 'Interpolated 10-20 montage channel based on full clinical 19-channel QEEG intake assessment.'}
            </p>
          </div>
          <div className="pt-2 border-t border-[#2A2A2A] grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#888888] block text-[10px]">Pre-Treatment Z-Score:</span>
              <span className="text-rose-400 font-bold">+2.4σ (Hyperarousal)</span>
            </div>
            <div>
              <span className="text-[#888888] block text-[10px]">Current Normalized Z-Score:</span>
              <span className="text-emerald-400 font-bold">+0.3σ (Normative Zone)</span>
            </div>
          </div>
        </div>

        {/* Right: Key Objective Biomarkers */}
        <div className="p-4 rounded-xl bg-[#161616] border border-[#222222] space-y-2">
          <span className="text-[#888888] block">Core Clinical Biomarker Gains:</span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-[#111111] border border-[#222222]">
              <span className="text-[#888888] block text-[10px]">Theta/Beta Ratio (ADHD)</span>
              <span className="font-bold text-emerald-400">1.82 (was 3.40)</span>
            </div>
            <div className="p-2 rounded bg-[#111111] border border-[#222222]">
              <span className="text-[#888888] block text-[10px]">Frontal Asymmetry (Mood)</span>
              <span className="font-bold text-emerald-400">+0.18 (Left Dominant)</span>
            </div>
            <div className="p-2 rounded bg-[#111111] border border-[#222222]">
              <span className="text-[#888888] block text-[10px]">ILF Slow-Wave Stability</span>
              <span className="font-bold text-emerald-400">92% In-Zone</span>
            </div>
            <div className="p-2 rounded bg-[#111111] border border-[#222222]">
              <span className="text-[#888888] block text-[10px]">Peak Alpha Frequency</span>
              <span className="font-bold text-emerald-400">10.2 Hz (Optimal)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
