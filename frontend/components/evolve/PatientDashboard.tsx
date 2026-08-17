"use client";

import { useState } from "react";
import Image from "next/image";
import { PatientProfile, DR_UPASANA_GALA } from "@/lib/evolve/patientStore";

interface PatientDashboardProps {
  patient: PatientProfile;
  patients: PatientProfile[];
  onSelectPatient: (patientId: string) => void;
  onStartSession: () => void;
  onOpenAuth: () => void;
  onOpenDemo: () => void;
  onOpenMuseModal?: () => void;
  isMuseConnected?: boolean;
}

export function PatientDashboard({
  patient,
  patients,
  onSelectPatient,
  onStartSession,
  onOpenDemo,
  onOpenMuseModal,
  isMuseConnected = false,
}: PatientDashboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/evolve?patient=${patient.id.toLowerCase()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const progressPercent = Math.round((patient.completedSessions / patient.totalPrescribed) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Patient Switcher & Clinical Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-border">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-text-secondary">Patient Profile: </span>
          <select
            value={patient.id}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="font-semibold text-text-primary bg-white border border-border rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-accent shadow-2xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.indication} ({p.id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMuseModal && (
            <button
              onClick={onOpenMuseModal}
              className={`btn text-xs py-1 px-3 rounded-lg border flex items-center gap-1.5 transition-all ${
                isMuseConnected
                  ? "bg-teal-50 border-teal-300 text-teal-800 font-semibold"
                  : "bg-white border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isMuseConnected ? "bg-teal-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <span>{isMuseConnected ? "Muse Headset: Connected" : "Connect Muse Headset"}</span>
            </button>
          )}

          <button
            onClick={handleCopyShareLink}
            className="btn btn-outline text-xs py-1 px-3 flex items-center gap-1.5"
            title="Copy link for this patient"
          >
            {copied ? (
              <span className="text-teal-700 font-medium">Link Copied!</span>
            ) : (
              <span>Share My Portal</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Welcome Hero */}
      <section className="card p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-semibold text-teal-800">
                At-Home Neurofeedback Continuation
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-light text-text-primary tracking-tight">
                Welcome back, {patient.name}
              </h1>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                Your personalized neurofeedback therapy from <strong>Dr. Upasana Gala</strong> is ready.
              </p>
            </div>

            {/* How It Works Explainer (Friendly & Jargon-Free) */}
            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 text-xs space-y-2 text-text-secondary">
              <div className="flex items-center gap-1.5 text-teal-900 font-semibold text-xs">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>How Your Session Works:</span>
              </div>
              <p className="leading-relaxed">
                Put on your Muse headband and click <strong>Start Session</strong>. As you watch the video, your brainwaves will guide the playback:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-teal-200/60 flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-text-primary block text-[11px]">When In The Focused Zone:</strong>
                    <span className="text-[11px] text-text-secondary">The video stays bright, clear, and sharp.</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-teal-200/60 flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                  <div>
                    <strong className="text-text-primary block text-[11px]">When Mind Drifts or Tenses:</strong>
                    <span className="text-[11px] text-text-secondary">The video gently dims to help you breathe and refocus.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Note */}
            <div className="p-4 rounded-xl bg-surface border border-border text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Dr. Gala&apos;s Advice for Today:
                </span>
                <span className="text-[10px] text-text-secondary">Prescribed for {patient.indication}</span>
              </div>
              <p className="text-text-secondary leading-relaxed italic">
                &ldquo;{patient.doctorNote}&rdquo;
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onStartSession}
                className="btn btn-primary text-sm px-7 py-3.5 font-semibold shadow-md flex items-center gap-2 hover:scale-[1.01] transition-transform"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Start Today&apos;s 15-Minute Session</span>
              </button>
              <span className="text-xs text-text-secondary font-medium">
                Goal: 15 minutes of relaxed focus
              </span>
            </div>
          </div>

          {/* Clinician Card */}
          <div className="p-5 rounded-2xl bg-surface border border-border text-center space-y-3 shadow-2xs">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-accent/40 shadow-sm">
              <Image
                src={DR_UPASANA_GALA.photoUrl}
                alt={DR_UPASANA_GALA.name}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">{DR_UPASANA_GALA.name}</h4>
              <p className="text-[11px] text-text-secondary">{DR_UPASANA_GALA.title}</p>
              <p className="text-[10px] text-text-secondary/70 font-mono mt-0.5">
                {DR_UPASANA_GALA.credentials}
              </p>
            </div>
            <div className="pt-2 border-t border-border text-[10px] text-text-secondary">
              <p className="font-semibold text-text-primary">{DR_UPASANA_GALA.clinic}</p>
              <p>Dubai Healthcare City · Abu Dhabi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Progress Cards (Customer Friendly) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Sessions Completed",
            value: `${patient.completedSessions} / ${patient.totalPrescribed}`,
            sub: `${progressPercent}% of Therapy Finished`,
          },
          {
            label: "Daily Streak",
            value: `${patient.currentStreakDays} Days`,
            sub: "Consistent Training",
          },
          {
            label: "Focus & Calm Level",
            value: `${patient.currentScore}/100`,
            sub: `+${patient.coherenceImprovementPercent}% Since Starting`,
          },
          {
            label: "Prescribed Time",
            value: `${patient.sessionDurationMin} Mins`,
            sub: "Daily Therapy Window",
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-5 text-center">
            <span className="text-xs text-text-secondary block font-medium">{stat.label}</span>
            <span className="text-2xl font-light font-data text-accent block mt-1">
              {stat.value}
            </span>
            <span className="text-[11px] text-text-secondary/80 block mt-0.5">
              {stat.sub}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
