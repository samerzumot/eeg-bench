"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EegTrace } from "@/components/EegTrace";
import { SampleDetailModal } from "@/components/SampleDetailModal";

export default function ClinicianPage() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <>
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Research Tool — Not for Clinical Diagnosis.</span>{" "}
            This analysis is for research and educational purposes only. It has not been cleared
            by the FDA or any regulatory body. All findings must be reviewed by a qualified
            neurologist.
          </p>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 mb-6">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-xs font-medium text-teal-700">Clinician Portal</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-light tracking-tight leading-tight text-text-primary">
                EEG Analysis
                <br />
                & Brain Health
              </h1>

              <p className="mt-4 text-lg text-text-secondary max-w-lg">
                Upload a clinical EEG recording. Get spectral analysis, brain health scoring,
                and automated pattern detection — powered by MNE-Python.
              </p>

              {/* Key metrics preview */}
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { label: "Frequency Bands", value: "5", sub: "δ θ α β γ" },
                  { label: "Biomarkers", value: "7", sub: "Composite score" },
                  { label: "Patterns", value: "6+", sub: "Auto-detected" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="font-data text-2xl text-accent font-light">{item.value}</p>
                    <p className="text-xs text-text-secondary mt-1">{item.label}</p>
                    <p className="text-[10px] text-text-secondary/60">{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/clinician/upload"
                  className="btn btn-primary text-base px-6 py-3"
                >
                  Upload EEG Recording
                </Link>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-text-secondary">
                    EDF · BDF · BrainVision · Resting-state or Sleep EEG
                  </p>
                  <Link
                    href="/clinician/report/demo"
                    className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
                  >
                    View example report →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: EEG trace */}
            <div className="hidden lg:block h-80 opacity-60">
              <EegTrace channels={8} />
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-light tracking-tight text-text-primary text-center">
            What you get
          </h2>
          <p className="text-center text-xs text-text-secondary mt-1 mb-8">
            Click any card to inspect live sample data
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: "spectral",
                svg: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d="M3 3v18h18" />
                    <path d="M18 17V9" />
                    <path d="M13 17V5" />
                    <path d="M8 17v-3" />
                  </svg>
                ),
                title: "Spectral Analysis",
                desc: "Power spectral density across all frequency bands with channel-wise resolution.",
                badge: "PSD & Topo",
              },
              {
                id: "brain_health",
                svg: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
                  </svg>
                ),
                title: "Brain Health Score",
                desc: "Composite 0–100 score from 7 EEG biomarkers — alpha peak, entropy, coherence, and more.",
                badge: "Biomarker Index",
              },
              {
                id: "pattern",
                svg: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d="M2 12h4l2-5 3 10 3-8 2 5h6" />
                    <circle cx="14" cy="9" r="2" className="fill-amber-500/20 stroke-amber-600" />
                  </svg>
                ),
                title: "Pattern Detection",
                desc: "Automated flagging of slowing, asymmetry, excess beta, and epileptiform activity.",
                badge: "Auto Detector",
              },
              {
                id: "report",
                svg: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                ),
                title: "Clinical Report",
                desc: "Downloadable PDF with visualizations, findings, and library version citations.",
                badge: "PDF / Web",
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveModal(item.id)}
                className="card p-6 cursor-pointer hover:border-accent/40 transition-all hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>{item.svg}</div>
                    <span className="text-[10px] font-data px-2 py-0.5 rounded bg-surface border border-border text-text-secondary group-hover:border-accent/30 group-hover:text-accent transition-colors">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-medium text-text-primary group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-accent font-medium">
                  <span>View Sample Data</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="card p-8 text-center">
          <h3 className="text-base font-medium text-text-primary mb-3">
            Supported Formats & Recording Types
          </h3>
          <p className="text-xs text-text-secondary mb-4">Click any format tag to preview sample header metadata</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-text-secondary">
            {[
              { name: "EDF (.edf)", detail: "European Data Format: 16-bit signals, standard 10-20 channels." },
              { name: "BDF (.bdf)", detail: "BioSemi 24-bit Data Format: ultra-high signal resolution." },
              { name: "BrainVision (.vhdr)", detail: "Brain Products format with header (.vhdr), marker (.vmrk), and binary (.eeg)." },
              { name: "Resting-state EEG", detail: "Eyes-closed & eyes-open 5-minute continuous baseline." },
              { name: "Sleep EEG", detail: "Overnight polysomnography & spindle/slow-wave scoring." },
              { name: "Standard 10-20 Montage", detail: "19-channel clinical standard (Fp1, Fp2, F7, F3, Fz, F4, F8, T3, C3, Cz, C4, T4, T5, P3, Pz, P4, T6, O1, O2)." },
            ].map((f) => (
              <button
                key={f.name}
                onClick={() => setActiveModal(`format_${f.name}`)}
                className="px-3.5 py-1.5 bg-surface hover:bg-teal-50 hover:text-teal-700 border border-border rounded-full text-xs font-medium transition-all"
              >
                {f.name}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-text-secondary/60">
            All processing uses MNE-Python v1.7.0 — no proprietary algorithms.
          </p>
        </div>
      </section>

      {/* Sample Modals */}
      <SampleDetailModal
        isOpen={activeModal === "spectral"}
        onClose={() => setActiveModal(null)}
        title="Sample Spectral Analysis Data"
        subtitle="Power Spectral Density (PSD) and band power distributions computed via Welch's method."
        badge="MNE-Python 1.7.0"
        actionText="View Full Interactive Report"
        onAction={() => router.push("/clinician/report/demo?tab=spectral")}
      >
        <div className="bg-surface p-4 rounded-xl border border-border space-y-3 font-data text-xs">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-text-secondary">Delta (1–4 Hz):</span>
            <span className="font-semibold text-text-primary">18.5% (Norm: 8-15%) [Elevated]</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-text-secondary">Theta (4–8 Hz):</span>
            <span className="font-semibold text-text-primary">12.1% (Norm: 6-14%) [Normal]</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-text-secondary">Alpha (8–13 Hz):</span>
            <span className="font-semibold text-text-primary">22.4% (Norm: 15-30%) [Normal]</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-text-secondary">Beta (13–30 Hz):</span>
            <span className="font-semibold text-text-primary">12.3% (Norm: 8-18%) [Normal]</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Gamma (30–45 Hz):</span>
            <span className="font-semibold text-text-primary">4.2% (Norm: 2-8%) [Normal]</span>
          </div>
        </div>
        <p className="text-xs text-text-secondary">
          Alpha peak frequency is centered at <strong>9.2 Hz</strong> in posterior channels (O1, O2, Pz).
        </p>
      </SampleDetailModal>

      <SampleDetailModal
        isOpen={activeModal === "brain_health"}
        onClose={() => setActiveModal(null)}
        title="Brain Health Composite Score (72/100)"
        subtitle="A normalized 0–100 index derived from 7 quantitative EEG biomarkers compared against normative database."
        badge="Biomarker Breakdown"
        actionText="Inspect Report Overview"
        onAction={() => router.push("/clinician/report/demo?tab=overview")}
      >
        <div className="space-y-2">
          {[
            { name: "Alpha Peak Frequency", val: "9.2 Hz", norm: "8.5–12.5 Hz", status: "Normal" },
            { name: "Alpha/Theta Ratio", val: "1.8", norm: "> 2.0", status: "Mild Slowing" },
            { name: "Delta Power Excess", val: "18.5%", norm: "< 15.0%", status: "Mild Excess" },
            { name: "Spectral Entropy", val: "0.74", norm: "0.70–0.90", status: "Normal" },
            { name: "Inter-hemispheric Coherence", val: "0.62", norm: "0.55–0.80", status: "Normal" },
          ].map((bm) => (
            <div key={bm.name} className="flex items-center justify-between p-2.5 bg-surface rounded-lg text-xs">
              <span className="font-medium text-text-primary">{bm.name}</span>
              <div className="text-right">
                <span className="font-data font-semibold text-text-primary">{bm.val}</span>
                <span className="ml-2 text-[10px] text-text-secondary">({bm.status})</span>
              </div>
            </div>
          ))}
        </div>
      </SampleDetailModal>

      <SampleDetailModal
        isOpen={activeModal === "pattern"}
        onClose={() => setActiveModal(null)}
        title="Automated Pattern Detection Sample"
        subtitle="Algorithmic flagging of clinical EEG abnormalities using normative reference bounds."
        badge="Pattern Engine"
        actionText="View Patterns Tab"
        onAction={() => router.push("/clinician/report/demo?tab=patterns")}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="font-semibold text-amber-900">1. Mild Delta Excess (18.5%)</p>
            <p className="text-amber-800 mt-1">Diffuse frontal predominance. Suggests mild drowsiness or early cognitive slowing.</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="font-semibold text-amber-900">2. Reduced Alpha/Theta Ratio (1.8)</p>
            <p className="text-amber-800 mt-1">Observed over posterior parietal/occipital channels (P3, Pz, P4, O1, O2).</p>
          </div>
        </div>
      </SampleDetailModal>

      <SampleDetailModal
        isOpen={activeModal === "report"}
        onClose={() => setActiveModal(null)}
        title="Clinical EEG Analysis Report Preview"
        subtitle="Complete structured report containing recording metadata, channel quality metrics, topomaps, and citations."
        badge="Demo Report"
        actionText="Open Full Interactive Report"
        onAction={() => router.push("/clinician/report/demo")}
      >
        <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs">
          <p><strong>Recording:</strong> patient_resting_state_001.edf (5 min 12 sec)</p>
          <p><strong>Channels:</strong> 19 Channels (Standard 10-20 Montage)</p>
          <p><strong>Quality:</strong> Good (2 bad channels auto-interpolated via spherical splines)</p>
          <p><strong>Processing Engine:</strong> MNE-Python 1.7.0 · scipy 1.11.0 · numpy 1.24.0</p>
        </div>
      </SampleDetailModal>

      {/* Format modals */}
      {["EDF (.edf)", "BDF (.bdf)", "BrainVision (.vhdr)", "Resting-state EEG", "Sleep EEG", "Standard 10-20 Montage"].map((f) => (
        <SampleDetailModal
          key={f}
          isOpen={activeModal === `format_${f}`}
          onClose={() => setActiveModal(null)}
          title={`Sample Format Info: ${f}`}
          subtitle="EEG recording parameters automatically parsed by MNE-Python backend."
          badge="Format Metadata"
          actionText="Upload EEG File"
          onAction={() => router.push("/clinician/upload")}
        >
          <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs font-data">
            <p><strong>Format Name:</strong> {f}</p>
            <p><strong>Sampling Frequency:</strong> 256 Hz (or 512 Hz native)</p>
            <p><strong>Amplitude Resolution:</strong> 16-bit / 24-bit floating point</p>
            <p><strong>Pre-filtering:</strong> 0.5–45.0 Hz Bandpass + 50/60 Hz Notch</p>
          </div>
        </SampleDetailModal>
      ))}
    </>
  );
}
