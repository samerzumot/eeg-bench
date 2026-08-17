import React, { useState } from 'react';
import { X, CheckCircle2, ChevronRight, ChevronLeft, Play, Sliders } from 'lucide-react';
import { mockEEG } from '../services/mockEegService';

export function DoctorDemoModal({ isOpen, onClose, onLaunchLiveSession }) {
  const [activeStep, setActiveStep] = useState(0);
  const [testOrf, setTestOrf] = useState(0.005);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Infra-Low Frequency (ILF) Methodology',
      subtitle: '0.0001 Hz – 0.05 Hz Slow Cortical Potentials (Othmer Method)',
      badge: 'CORE METHODOLOGY',
      content: (
        <div className="space-y-3 text-xs text-[#AAAAAA] leading-relaxed font-sans">
          <p>
            Unlike traditional threshold operant methods with reward beeps on fast rhythms,
            <strong className="text-[#EDEDED]"> Dr. Upasana Gala utilizes Infra-Low Frequency (ILF) neurofeedback</strong>.
          </p>
          <div className="p-3.5 rounded-xl bg-[#161616] border border-[#2A2A2A] space-y-2">
            <div className="flex items-center justify-between text-[#EDEDED] font-medium">
              <span>Physiological Target:</span>
              <span className="text-emerald-400 font-mono text-[11px]">Subcortical Arousal & DMN</span>
            </div>
            <p className="text-[11px]">
              ILF engages the brain's master regulatory networks (Default Mode Network, Salience Network, and Central Executive Network) by continuously reflecting the ultra-slow metabolic fluctuations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2.5 rounded-lg bg-[#161616] border border-[#2A2A2A]">
              <span className="text-[#888888] block text-[10px]">Optimal Range</span>
              <span className="font-bold text-[#EDEDED]">0.0001 – 0.0500 Hz</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#161616] border border-[#2A2A2A]">
              <span className="text-[#888888] block text-[10px]">Standard Montage</span>
              <span className="font-bold text-emerald-400">AF7–TP9 / AF8–TP10 Bipolar</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '2. Continuous Graded Sensory Reflection',
      subtitle: 'Smooth Luminance, Aperture & Audio (Zero-Startle Flow)',
      badge: 'OPERANT REFLECTION',
      content: (
        <div className="space-y-3 text-xs text-[#AAAAAA] leading-relaxed font-sans">
          <p>
            In ILF neurofeedback, <strong className="text-[#EDEDED]">abrupt hard stops are avoided</strong> because sudden pauses trigger a sympathetic startle response and high-beta muscle tension.
          </p>
          <div className="p-3.5 rounded-xl bg-[#161616] border border-[#2A2A2A] space-y-2">
            <div className="text-[#EDEDED] font-medium">
              Graded Sensory Modulation Dynamics:
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#AAAAAA]">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <span><strong className="text-[#EDEDED]">Continuous Luminance:</strong> Video brightness glides smoothly between 25% and 100% in lockstep with the slow wave.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <span><strong className="text-[#EDEDED]">Aperture Scaling:</strong> Subtle screen expansion/contraction (92%–100%) acts as an organic subconscious visual mirror.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <span><strong className="text-[#EDEDED]">Acoustic Ducking:</strong> Volume gently shifts proportional to autonomic balance.</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: '3. Optimal Response Frequency (ORF) Tuning',
      subtitle: 'Individualized Patient Calibration by Dr. Upasana Gala',
      badge: 'ORF CALIBRATION',
      content: (
        <div className="space-y-3 text-xs text-[#AAAAAA] leading-relaxed font-sans">
          <p>
            Each patient has an individualized <strong className="text-[#EDEDED]">Optimal Response Frequency (ORF)</strong> where their nervous system achieves peak calming without lethargy.
          </p>
          <div className="p-3.5 rounded-xl bg-[#161616] border border-[#2A2A2A] space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-[#EDEDED]">
              <span>Interactive ORF Calibrator:</span>
              <span className="font-mono text-emerald-400 font-semibold">{testOrf} Hz</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 font-mono text-[10px]">
              {[0.002, 0.005, 0.012, 0.020, 0.035].map(freq => (
                <button
                  key={freq}
                  onClick={() => {
                    setTestOrf(freq);
                    mockEEG.setOptimalResponseFrequency(freq);
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    testOrf === freq
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold'
                      : 'bg-[#121212] text-[#888888] hover:text-[#EDEDED] border-[#2A2A2A]'
                  }`}
                >
                  {freq}Hz
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '4. Muse Athena Sensor Fusion & Artifact Rejection',
      subtitle: 'EMG Jaw Clench, Frontal EOG Blink, IMU Head Motion & HRV Coherence',
      badge: 'ATHENA TELEMETRY',
      content: (
        <div className="space-y-3 text-xs text-[#AAAAAA] leading-relaxed font-sans">
          <p>
            Advanced <strong className="text-[#EDEDED]">Muse Athena research features</strong> isolate pure cortical slow potentials from physiological artifacts:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] space-y-1">
              <span className="text-[10px] text-[#888888] block">Temporal EMG Clench</span>
              <span className="font-semibold text-[#EDEDED] block">Active (&gt;22Hz Inhibit)</span>
              <p className="text-[10px] text-[#888888] font-sans leading-tight">
                Gates somatic temporalis jaw clenching at TP9/TP10.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] space-y-1">
              <span className="text-[10px] text-[#888888] block">Frontal EOG Blink Filter</span>
              <span className="font-semibold text-emerald-400 block">Active (AF7/AF8)</span>
              <p className="text-[10px] text-[#888888] font-sans leading-tight">
                Prevents eye blinks from contaminating slow wave telemetry.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] space-y-1">
              <span className="text-[10px] text-[#888888] block">6-Axis IMU Stability</span>
              <span className="font-semibold text-[#EDEDED] block">98% Head Stillness</span>
              <p className="text-[10px] text-[#888888] font-sans leading-tight">
                Tracks posture and rejects fidgeting artifacts.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] space-y-1">
              <span className="text-[10px] text-[#888888] block">Autonomic HRV Coherence</span>
              <span className="font-semibold text-emerald-400 block">0.86 (Optimal Tone)</span>
              <p className="text-[10px] text-[#888888] font-sans leading-tight">
                Pulse wave autonomic coherence index.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const current = steps[activeStep];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in text-[#EDEDED]"
      onClick={onClose}
    >
      <div
        className="max-w-xl w-full p-6 sm:p-7 rounded-2xl bg-[#111111] border border-[#333333] shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-emerald-500/40 shrink-0">
              <img
                src="/dr-upasana-gala.png"
                alt="Dr. Upasana Gala"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold font-sans">Clinician Platform Tour</h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/80 text-emerald-400 font-bold">
                  {current.badge}
                </span>
              </div>
              <p className="text-xs text-[#888888] font-sans">
                Dr. Upasana Gala · Infra-Low Frequency (ILF) Specialist
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Title */}
        <div>
          <h4 className="text-sm font-semibold font-sans">{current.title}</h4>
          <p className="text-xs text-[#888888] mt-0.5 font-sans">{current.subtitle}</p>
        </div>

        {/* Step Content */}
        <div>{current.content}</div>

        {/* Live Test Trigger Buttons */}
        <div className="p-3.5 rounded-xl bg-[#161616] border border-[#2A2A2A] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-sans">
            <span className="font-semibold text-[#EDEDED]">Test Live Brain State Response:</span>
            <span className="text-[#888888] text-[10px]">Updates video & telemetry</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono">
            {[
              { mode: 'ilf_flow', label: 'Balanced ILF Flow', sub: '100% Clarity' },
              { mode: 'deep_calm', label: 'Deep Calm', sub: '98% Coherence' },
              { mode: 'somatic_tension', label: 'Jaw Tension', sub: 'EMG Inhibit' },
              { mode: 'attentional_drift', label: 'Theta Drift', sub: 'Graded Dim' },
            ].map(btn => (
              <button
                key={btn.mode}
                onClick={() => mockEEG.setMode(btn.mode)}
                className="p-2 rounded-lg bg-[#111111] border border-[#2A2A2A] hover:border-emerald-500 hover:text-emerald-400 text-[#EDEDED] transition-all text-left"
              >
                <span className="font-semibold block">{btn.label}</span>
                <span className="text-[9px] text-[#888888] block mt-0.5">{btn.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-[#222222]">
          <div className="flex items-center gap-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  activeStep === idx ? 'w-6 bg-emerald-500' : 'w-2 bg-[#333333] hover:bg-[#666666]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {activeStep > 0 && (
              <button
                onClick={() => setActiveStep(p => p - 1)}
                className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep(p => p + 1)}
                className="btn btn-primary text-xs py-1.5 px-4 flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onLaunchLiveSession();
                }}
                className="btn btn-primary text-xs py-1.5 px-4 font-semibold flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Live Session →</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
