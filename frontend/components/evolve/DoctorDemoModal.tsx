"use client";

import { useState } from "react";
import Image from "next/image";
import { DR_UPASANA_GALA } from "@/lib/evolve/patientStore";
import { mockEeg, BrainStateMode } from "@/lib/evolve/mockEegService";

interface DoctorDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchLiveSession: () => void;
}

export function DoctorDemoModal({ isOpen, onClose, onLaunchLiveSession }: DoctorDemoModalProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [testOrf, setTestOrf] = useState<number>(0.005);

  if (!isOpen) return null;

  const steps = [
    {
      title: "1. Infra-Low Frequency (ILF) Clinical Engine",
      subtitle: "0.0001 Hz – 0.05 Hz Slow Cortical Potentials (Othmer Method)",
      badge: "CORE METHODOLOGY",
      content: (
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            Unlike traditional neurofeedback that uses reward threshold beeps on fast EEG rhythms (e.g. SMR/Beta),
            <strong> Dr. Upasana Gala utilizes Infra-Low Frequency (ILF) neurofeedback</strong>.
          </p>
          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between text-text-primary font-medium">
              <span>Physiological Target:</span>
              <span className="text-accent font-mono text-[11px]">Subcortical Arousal & DMN</span>
            </div>
            <p className="text-[11px]">
              ILF engages the brain&apos;s master regulatory networks (Default Mode Network, Salience Network, and Central Executive Network) by continuously reflecting the ultra-slow metabolic vascular fluctuations of the brain.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2.5 rounded-lg bg-surface border border-border">
              <span className="text-text-secondary block text-[10px]">Optimal Range</span>
              <span className="font-bold text-text-primary">0.0001 – 0.0500 Hz</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border">
              <span className="text-text-secondary block text-[10px]">Montage Standard</span>
              <span className="font-bold text-teal-700">AF7–TP9 / AF8–TP10 Bipolar</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "2. Continuous Graded Sensory Reflection",
      subtitle: "Zero-Startle Visual & Acoustic Flow (No Jarring Pauses)",
      badge: "OPERANT REFLECTION",
      content: (
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            In ILF neurofeedback, <strong>abrupt pausing is clinically avoided</strong> because hard cuts evoke a startle response, triggering sympathetic nervous system arousal and high-beta tension spikes.
          </p>
          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between text-text-primary font-medium">
              <span>Graded Sensory Modulation Dynamics:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0" />
                <span><strong>Continuous Luminance:</strong> Video brightness smoothly glides between 25% and 100% in lockstep with the infra-low slow wave.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0" />
                <span><strong>Aperture Scaling:</strong> Subtle screen dilation (92%–100%) acts as an organic visual mirror for the subcortical regulatory centers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0" />
                <span><strong>Acoustic Ducking:</strong> Volume gently shifts proportional to arousal balance, providing effortless subconscious self-regulation.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "3. Optimal Response Frequency (ORF) Tuning",
      subtitle: "Individualized Patient Calibration by Dr. Upasana Gala",
      badge: "ORF CALIBRATION",
      content: (
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            Each patient possesses an individualized <strong>Optimal Response Frequency (ORF)</strong> where their nervous system achieves peak calming without lethargy, and peak alertness without agitation.
          </p>
          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-text-primary">
              <span>Interactive ORF Calibrator:</span>
              <span className="font-mono text-accent font-semibold">{testOrf} Hz</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 font-mono text-[10px]">
              {[0.002, 0.005, 0.012, 0.020, 0.035].map((freq) => (
                <button
                  key={freq}
                  onClick={() => {
                    setTestOrf(freq);
                    mockEeg.setOptimalResponseFrequency(freq);
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    testOrf === freq
                      ? "bg-accent text-white font-bold shadow-xs border-accent"
                      : "bg-white text-text-secondary hover:text-text-primary border-border"
                  }`}
                >
                  {freq}Hz
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-text-secondary">
            Adjusting ORF immediately updates the slow-wave synthesis engine and oscilloscope carrier frequency.
          </p>
        </div>
      ),
    },
    {
      title: "4. Muse Athena Sensor Fusion & Artifact Rejection",
      subtitle: "EMG Jaw Clench, Frontal EOG Blink, IMU Head Motion & HRV Coherence",
      badge: "ATHENA TELEMETRY",
      content: (
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            The platform integrates advanced <strong>Muse Athena research features</strong> to isolate pure cortical slow potentials from physiological artifacts:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] text-text-secondary block">Temporal EMG Clench</span>
              <span className="font-semibold text-text-primary block">Active (&gt;22Hz Inhibit)</span>
              <p className="text-[10px] text-text-secondary font-sans leading-tight">
                Gates somatic temporalis jaw clenching at TP9/TP10.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] text-text-secondary block">Frontal EOG Blink Filter</span>
              <span className="font-semibold text-teal-700 block">Active (AF7/AF8)</span>
              <p className="text-[10px] text-text-secondary font-sans leading-tight">
                Prevents eye blinks from contaminating slow wave telemetry.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] text-text-secondary block">6-Axis IMU Stability</span>
              <span className="font-semibold text-text-primary block">98% Head Stillness</span>
              <p className="text-[10px] text-text-secondary font-sans leading-tight">
                Tracks posture and rejects fidgeting artifacts.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] text-text-secondary block">Autonomic HRV Coherence</span>
              <span className="font-semibold text-teal-700 block">0.86 (Optimal Vagal Tone)</span>
              <p className="text-[10px] text-text-secondary font-sans leading-tight">
                PPG pulse wave autonomic coherence index.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[activeStep];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-xl bg-white border border-border-strong p-6 sm:p-7 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-accent/40 shrink-0">
              <Image
                src={DR_UPASANA_GALA.photoUrl}
                alt={DR_UPASANA_GALA.name}
                width={44}
                height={44}
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-text-primary">Clinician Platform Tour</h2>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                  {current.badge}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {DR_UPASANA_GALA.name} · {DR_UPASANA_GALA.methodology}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1 rounded-md transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step Title */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{current.title}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{current.subtitle}</p>
        </div>

        {/* Step Content */}
        <div>{current.content}</div>

        {/* Live Quick Brain State Triggers for Doctor Demo */}
        <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-text-primary">Test Live Brain State Response:</span>
            <span className="text-text-secondary text-[10px]">Updates telemetry instantly</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono">
            {[
              { mode: "ilf_flow" as BrainStateMode, label: "Balanced ILF Flow", sub: "100% Clarity" },
              { mode: "deep_calm" as BrainStateMode, label: "Deep Calm", sub: "98% Coherence" },
              { mode: "somatic_tension" as BrainStateMode, label: "Jaw Tension", sub: "EMG Inhibit" },
              { mode: "attentional_drift" as BrainStateMode, label: "Theta Drift", sub: "Graded Dim" },
            ].map((btn) => (
              <button
                key={btn.mode}
                onClick={() => mockEeg.setMode(btn.mode)}
                className="p-2 rounded-lg bg-white border border-border hover:border-accent hover:text-accent text-text-primary transition-all text-left"
              >
                <span className="font-semibold block">{btn.label}</span>
                <span className="text-[9px] text-text-secondary block mt-0.5">{btn.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeStep === idx ? "w-6 bg-accent" : "bg-border-strong hover:bg-text-secondary"
                }`}
                aria-label={`Step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {activeStep > 0 && (
              <button
                onClick={() => setActiveStep((prev) => prev - 1)}
                className="btn btn-outline text-xs py-1.5 px-3"
              >
                ← Back
              </button>
            )}
            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="btn btn-primary text-xs py-1.5 px-4"
              >
                Next Step →
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onLaunchLiveSession();
                }}
                className="btn btn-primary text-xs py-1.5 px-4 font-semibold"
              >
                Launch Live Session Demo →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
