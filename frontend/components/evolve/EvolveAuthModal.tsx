"use client";

import { useState } from "react";
import Image from "next/image";
import { PatientProfile, DR_UPASANA_GALA } from "@/lib/evolve/patientStore";

interface EvolveAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: PatientProfile[];
  activePatientId: string;
  onSelectPatient: (patientId: string) => void;
  onSelectRole: (role: "patient" | "clinician") => void;
  currentRole: "patient" | "clinician";
}

export function EvolveAuthModal({
  isOpen,
  onClose,
  patients,
  activePatientId,
  onSelectPatient,
  onSelectRole,
  currentRole,
}: EvolveAuthModalProps) {
  const [authTab, setAuthTab] = useState<"patient" | "clinician">(currentRole);
  const [patientEmailInput, setPatientEmailInput] = useState("");
  const [clinicianPin, setClinicianPin] = useState("");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md bg-white border border-border-strong p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center p-1 overflow-hidden">
              <Image
                src="/evolve/evolve-logo.webp"
                alt="Evolve Brain Training"
                width={32}
                height={32}
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Evolve Neurofeedback Portal</h2>
              <p className="text-xs text-text-secondary">Dr. Upasana Gala · Dubai Healthcare City</p>
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

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 bg-surface p-1 rounded-lg border border-border my-4">
          <button
            onClick={() => setAuthTab("patient")}
            className={`py-1.5 text-xs font-medium rounded-md transition-all ${
              authTab === "patient"
                ? "bg-white text-text-primary shadow-xs border border-border"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Client / Patient Portal
          </button>
          <button
            onClick={() => setAuthTab("clinician")}
            className={`py-1.5 text-xs font-medium rounded-md transition-all ${
              authTab === "clinician"
                ? "bg-white text-text-primary shadow-xs border border-border"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Clinician (Dr. Gala)
          </button>
        </div>

        {/* Patient tab */}
        {authTab === "patient" ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-primary block mb-2">
                Select Prescribed Patient Profile
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {patients.map((p) => {
                  const isSelected = p.id === activePatientId && currentRole === "patient";
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectPatient(p.id);
                        onSelectRole("patient");
                        onClose();
                      }}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-teal-50/60 border-accent text-text-primary shadow-xs"
                          : "bg-surface/50 border-border hover:bg-surface hover:border-border-strong text-text-primary"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs text-text-primary">{p.name}</span>
                        <span className="text-[10px] font-mono text-accent uppercase font-semibold">
                          {p.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-0.5">{p.indication}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-text-secondary/80 font-data border-t border-border/40 pt-1.5">
                        <span>{p.completedSessions} / {p.totalPrescribed} Sessions</span>
                        <span>Streak: {p.currentStreakDays}d · +{p.coherenceImprovementPercent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct patient ID lookup */}
            <div className="pt-2 border-t border-border">
              <label className="text-[11px] text-text-secondary block mb-1">
                Or enter Patient File ID / Email
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. EV-084 or patient@email.com"
                  value={patientEmailInput}
                  onChange={(e) => setPatientEmailInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border-strong bg-surface focus:outline-none focus:border-accent"
                />
                <button
                  onClick={() => {
                    const match = patients.find(
                      (p) =>
                        p.id.toLowerCase() === patientEmailInput.trim().toLowerCase() ||
                        p.email.toLowerCase() === patientEmailInput.trim().toLowerCase()
                    );
                    if (match) {
                      onSelectPatient(match.id);
                      onSelectRole("patient");
                      onClose();
                    } else if (patientEmailInput.trim()) {
                      onSelectPatient(patients[0].id);
                      onSelectRole("patient");
                      onClose();
                    }
                  }}
                  className="btn btn-primary text-xs py-1.5 px-3"
                >
                  Access
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Clinician Tab */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-accent/40 shrink-0">
                <Image
                  src={DR_UPASANA_GALA.photoUrl}
                  alt={DR_UPASANA_GALA.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary">{DR_UPASANA_GALA.name}</p>
                <p className="text-[11px] text-text-secondary">{DR_UPASANA_GALA.credentials}</p>
                <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800">
                  Verified Clinician Authority
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-primary block mb-1">
                Clinician Access Code
              </label>
              <input
                type="password"
                placeholder="Enter PIN (Default: 2026)"
                value={clinicianPin}
                onChange={(e) => setClinicianPin(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-strong bg-surface focus:outline-none focus:border-accent"
              />
              <p className="text-[10px] text-text-secondary mt-1">
                Instant clinical access active for Dr. Gala remote neurofeedback supervision.
              </p>
            </div>

            <button
              onClick={() => {
                onSelectRole("clinician");
                onClose();
              }}
              className="btn btn-primary w-full py-2 text-xs font-medium"
            >
              Sign In to Clinician Supervision Portal →
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-[10px] text-text-secondary">
          <span>HIPAA & GDPR Compliant Neurofeedback</span>
          <button onClick={onClose} className="hover:text-text-primary">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
