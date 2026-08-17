"use client";

import { useState } from "react";
import Image from "next/image";
import { jsPDF } from "jspdf";
import { PatientProfile, DR_UPASANA_GALA } from "@/lib/evolve/patientStore";
import { TopoBrainMap } from "./TopoBrainMap";

interface ClinicianViewProps {
  patients: PatientProfile[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onUpdateNote: (patientId: string, note: string) => void;
  onUpdateProtocol: (
    patientId: string,
    updates: Partial<
      Pick<
        PatientProfile,
        | "protocolType"
        | "protocolName"
        | "optimalResponseFrequencyHz"
        | "thresholdScore"
        | "sessionDurationMin"
        | "electrodeMontage"
      >
    >
  ) => void;
  onOpenDemo?: () => void;
}

const PREPOPULATED_PROGRAMS = [
  {
    id: "adhd_focus",
    title: "ADHD & Attentional Focus Protocol",
    condition: "ADHD / Attention Drift",
    orfHz: 0.005,
    threshold: 65,
    duration: 15,
    montage: "AF7–TP9 Prefrontal-Temporal",
    protocolType: "ilf_adhd" as const,
    protocolName: "Prefrontal SMR Focus + ILF Slow Wave (0.005 Hz)",
    guidanceNote:
      "Targeting prefrontal slow-wave stability (0.005 Hz). Focus gently on the video; your calm alpha-SMR rhythm will keep the video bright and sharp without straining.",
  },
  {
    id: "anxiety_calm",
    title: "Anxiety & Autonomic Down-Regulation",
    condition: "Anxiety / Chronic Stress",
    orfHz: 0.002,
    threshold: 65,
    duration: 15,
    montage: "T4–P4 Right Temporal-Parietal",
    protocolType: "ilf_anxiety" as const,
    protocolName: "Right Temporal Alpha Calming + ILF Slow Wave (0.002 Hz)",
    guidanceNote:
      "Significant reduction in autonomic hyperarousal observed. Relax your shoulders, breathe with gentle diaphragmatic ease, and allow the soothing sensory flow to quiet your nervous system.",
  },
  {
    id: "sleep_insomnia",
    title: "Insomnia & Sleep Architecture Stabilization",
    condition: "Sleep Disruption / Insomnia",
    orfHz: 0.001,
    threshold: 60,
    duration: 20,
    montage: "Pz–Oz Parietal-Occipital Synchrony",
    protocolType: "ilf_dual" as const,
    protocolName: "Parieto-Occipital Theta-Alpha Synchrony + ILF (0.001 Hz)",
    guidanceNote:
      "Promotes deep thalamocortical slow-wave synchrony. Best performed 30 minutes before bed in dim lighting to anchor your circadian restorative rhythms.",
  },
  {
    id: "peak_performance",
    title: "Executive Bandwidth & Peak Cognitive Flow",
    condition: "Executive Peak Flow",
    orfHz: 0.012,
    threshold: 72,
    duration: 20,
    montage: "Bilateral Frontal-Temporal 40Hz",
    protocolType: "ilf_peak" as const,
    protocolName: "Dual Frontal-Temporal Gamma Coherence + ILF (0.012 Hz)",
    guidanceNote:
      "High-performance executive integration protocol. Challenge yourself to sustain effortless attentional flow and high coherence without somatic tension.",
  },
];

export function ClinicianView({
  patients,
  selectedPatientId,
  onSelectPatient,
  onUpdateNote,
  onUpdateProtocol,
  onOpenDemo,
}: ClinicianViewProps) {
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"programs" | "protocol" | "brainmap" | "data_architecture">("programs");
  const [noteText, setNoteText] = useState(selectedPatient.doctorNote);
  const [threshold, setThreshold] = useState(selectedPatient.thresholdScore);
  const [duration, setDuration] = useState(selectedPatient.sessionDurationMin || 15);
  const [orfHz, setOrfHz] = useState<number>(selectedPatient.optimalResponseFrequencyHz || 0.005);
  const [protocolType, setProtocolType] = useState(selectedPatient.protocolType);
  const [toastMsg, setToastMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.indication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyProgram = (prog: typeof PREPOPULATED_PROGRAMS[0]) => {
    setOrfHz(prog.orfHz);
    setThreshold(prog.threshold);
    setDuration(prog.duration);
    setProtocolType(prog.protocolType);
    setNoteText(prog.guidanceNote);

    onUpdateProtocol(selectedPatient.id, {
      protocolType: prog.protocolType,
      protocolName: prog.protocolName,
      optimalResponseFrequencyHz: prog.orfHz,
      thresholdScore: prog.threshold,
      sessionDurationMin: prog.duration,
      electrodeMontage: prog.montage,
    });
    onUpdateNote(selectedPatient.id, prog.guidanceNote);

    setToastMsg(`Prescribed "${prog.title}" applied to ${selectedPatient.name} (${selectedPatient.id}).`);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleSaveCustomProtocol = () => {
    const protocolNames = {
      ilf_adhd: `Prefrontal-Temporal ILF (${orfHz} Hz) + High-Beta Inhibit`,
      ilf_anxiety: `Right Temporal-Parietal ILF (${orfHz} Hz) + Alpha Synchrony`,
      ilf_dual: `Bilateral Frontal-Temporal Dual ILF (${orfHz} Hz)`,
      ilf_peak: `Peak Alpha & Infra-Low Slow Wave Harmonization (${orfHz} Hz)`,
    };

    onUpdateProtocol(selectedPatient.id, {
      protocolType,
      protocolName: protocolNames[protocolType],
      optimalResponseFrequencyHz: orfHz,
      thresholdScore: threshold,
      sessionDurationMin: duration,
    });
    onUpdateNote(selectedPatient.id, noteText);

    setToastMsg(`Custom ILF Protocol saved & pushed to patient device.`);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/evolve?patient=${selectedPatient.id.toLowerCase()}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const primaryColor: [number, number, number] = [46, 111, 101]; // Teal #2E6F65
      const darkColor: [number, number, number] = [20, 20, 20];
      const grayColor: [number, number, number] = [100, 100, 100];
      const lightBg: [number, number, number] = [245, 247, 248];

      // Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("EVOLVE BRAIN TRAINING · CLINICAL PROGRESS REPORT", 14, 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(
        "Dr. Upasana Gala (PhD, BCN, QEEG-D) · Dubai Healthcare City & Abu Dhabi",
        14,
        18
      );

      // Report Metadata Bar
      doc.setFillColor(...lightBg);
      doc.rect(14, 30, 182, 22, "F");
      doc.setDrawColor(220, 220, 220);
      doc.rect(14, 30, 182, 22, "S");

      doc.setTextColor(...darkColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(`Patient: ${selectedPatient.name}`, 18, 37);
      doc.text(`File ID: ${selectedPatient.id}`, 80, 37);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 145, 37);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...grayColor);
      doc.text(`Clinical Indication: ${selectedPatient.indication}`, 18, 45);
      doc.text(
        `Active Protocol: ${selectedPatient.protocolName || selectedPatient.protocolType}`,
        80,
        45
      );

      // Section 1: Clinical Adherence & Progress Summary
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("1. Treatment Adherence & Neuroplastic Metrics", 14, 60);

      // Metric Boxes
      const gain = Math.round(
        ((selectedPatient.currentScore - selectedPatient.baselineScore) /
          selectedPatient.baselineScore) *
          100
      );
      const metrics = [
        {
          label: "Completed Sessions",
          val: `${selectedPatient.completedSessions}/${selectedPatient.totalPrescribed}`,
        },
        {
          label: "Adherence Streak",
          val: `${selectedPatient.currentStreakDays} Days`,
        },
        {
          label: "Baseline Score",
          val: `${selectedPatient.baselineScore}/100`,
        },
        {
          label: "Current Score",
          val: `${selectedPatient.currentScore}/100`,
        },
        {
          label: "Net Coherence Gain",
          val: `+${gain}%`,
        },
      ];

      metrics.forEach((m, idx) => {
        const x = 14 + idx * 36.8;
        doc.setFillColor(255, 255, 255);
        doc.rect(x, 65, 34, 18, "F");
        doc.setDrawColor(220, 220, 220);
        doc.rect(x, 65, 34, 18, "S");

        doc.setFontSize(7.5);
        doc.setTextColor(...grayColor);
        doc.text(m.label, x + 2, 71);

        doc.setFontSize(10.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text(m.val, x + 2, 79);
      });

      // Section 2: Session-by-Session Historical Log
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("2. Historical Session Analytics Log", 14, 94);

      // Table Header
      doc.setFillColor(235, 240, 240);
      doc.rect(14, 98, 182, 8, "F");
      doc.setFontSize(8);
      doc.setTextColor(...darkColor);
      doc.text("Session #", 18, 103.5);
      doc.text("Date", 45, 103.5);
      doc.text("Duration", 75, 103.5);
      doc.text("Focus Score", 105, 103.5);
      doc.text("Calm Score", 135, 103.5);
      doc.text("In-Zone Target %", 165, 103.5);

      const recent = [
        { sessionNumber: 14, date: "Today", durationMin: 15, focusScore: 88, calmScore: 86 },
        { sessionNumber: 13, date: "Yesterday", durationMin: 15, focusScore: 86, calmScore: 84 },
        { sessionNumber: 12, date: "Aug 14", durationMin: 15, focusScore: 84, calmScore: 82 },
        { sessionNumber: 11, date: "Aug 12", durationMin: 15, focusScore: 81, calmScore: 79 },
      ];

      recent.forEach((sess, idx) => {
        const y = 110 + idx * 7.5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...darkColor);
        doc.text(`Session ${sess.sessionNumber}`, 18, y);
        doc.text(`${sess.date}`, 45, y);
        doc.text(`${sess.durationMin} min`, 75, y);
        doc.text(`${sess.focusScore}%`, 105, y);
        doc.text(`${sess.calmScore}%`, 135, y);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text(`${Math.round((sess.focusScore + sess.calmScore) / 2)}% Target`, 165, y);

        doc.setDrawColor(240, 240, 240);
        doc.line(14, y + 2, 196, y + 2);
      });

      // Section 3: Quantitative EEG Power Distribution
      const qeegY = 150;
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("3. Quantitative EEG (QEEG) Spectral Power Distribution", 14, qeegY);

      const bands = [
        { name: "Delta (0.5–4Hz)", val: "12%", status: "Normal Baseline" },
        { name: "Theta (4–8Hz)", val: "14%", status: "Within Inhibit Threshold" },
        { name: "Alpha (8–12Hz)", val: "48%", status: "Optimal Synchrony" },
        { name: "Beta / SMR (12–30Hz)", val: "22%", status: "SMR Stabilized" },
        { name: "Gamma (30–45Hz)", val: "4%", status: "Normal Executive Flow" },
      ];

      bands.forEach((b, idx) => {
        const y = qeegY + 8 + idx * 6.5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...darkColor);
        doc.text(`• ${b.name}:`, 18, y);
        doc.setFont("helvetica", "bold");
        doc.text(b.val, 75, y);
        doc.setTextColor(...grayColor);
        doc.setFont("helvetica", "italic");
        doc.text(b.status, 110, y);
      });

      // Section 4: Clinician Assessment & Prescription Guidance
      const assessY = 195;
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("4. Dr. Upasana Gala's Clinical Impression & Recommendation", 14, assessY);

      doc.setFillColor(...lightBg);
      doc.rect(14, assessY + 4, 182, 30, "F");
      doc.setDrawColor(220, 220, 220);
      doc.rect(14, assessY + 4, 182, 30, "S");

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...darkColor);
      const splitNote = doc.splitTextToSize(`"${selectedPatient.doctorNote}"`, 174);
      doc.text(splitNote, 18, assessY + 12);

      // Signature Section
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...darkColor);
      doc.text("Supervising Clinician Signature:", 14, 248);
      doc.text("Dr. Upasana Gala, PhD, BCN, QEEG-D", 14, 258);
      doc.setFontSize(7.5);
      doc.setTextColor(...grayColor);
      doc.text("Founder & Managing Director · Evolve Brain Training LLC", 14, 263);

      // Official Stamp
      doc.setDrawColor(...primaryColor);
      doc.circle(165, 252, 12, "S");
      doc.setFontSize(6);
      doc.setTextColor(...primaryColor);
      doc.text("EVOLVE CLINIC", 154, 251);
      doc.text("VERIFIED QEEG", 153, 254);

      // Download
      doc.save(`Evolve_Clinical_Report_${selectedPatient.id}_${selectedPatient.name.replace(/\s+/g, "_")}.pdf`);
      setToastMsg(`Clinical PDF Report downloaded for ${selectedPatient.name}.`);
      setTimeout(() => setToastMsg(""), 3500);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Clinician Profile Banner */}
      <section className="card p-6 bg-surface border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-accent/40 shadow-sm shrink-0">
            <Image
              src={DR_UPASANA_GALA.photoUrl}
              alt={DR_UPASANA_GALA.name}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-primary">{DR_UPASANA_GALA.name}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-medium">
                Supervising Neurofeedback Clinician
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              {DR_UPASANA_GALA.credentials} · {DR_UPASANA_GALA.clinic} ({DR_UPASANA_GALA.locations.join(", ")})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Clinical PDF Report Button */}
          <button
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
            className="btn btn-primary text-xs py-2 px-3.5 font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{isGeneratingPdf ? "Generating PDF..." : "Download Clinical PDF Report"}</span>
          </button>

          {onOpenDemo && (
            <button
              onClick={onOpenDemo}
              className="btn btn-outline text-xs py-2 px-3 border-teal-300 text-teal-800 bg-teal-50/50 hover:bg-teal-50 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
              <span>Interactive Tour</span>
            </button>
          )}
          <button
            onClick={handleCopyLink}
            className="btn btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
          >
            {copiedLink ? (
              <span className="text-teal-700 font-medium">Patient Link Copied!</span>
            ) : (
              <span>Share Link for {selectedPatient.name}</span>
            )}
          </button>
        </div>
      </section>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-700 shrink-0">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Main Grid: Patient List on Left, Protocol / QEEG on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left: Patient Selector */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
              Patient Roster ({patients.length})
            </h3>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredPatients.map((p) => {
              const isSelected = p.id === selectedPatient.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPatient(p.id);
                    setNoteText(p.doctorNote);
                    setThreshold(p.thresholdScore);
                    setDuration(p.sessionDurationMin || 15);
                    setOrfHz(p.optimalResponseFrequencyHz || 0.005);
                    setProtocolType(p.protocolType);
                  }}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-teal-50/70 border-accent shadow-xs"
                      : "bg-surface/50 border-border hover:bg-surface text-text-primary"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary">{p.name}</span>
                    <span className="text-[10px] font-mono font-bold text-accent">{p.id}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5 truncate">{p.indication}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-text-secondary/70 font-data border-t border-border/40 pt-1">
                    <span>ORF: {p.optimalResponseFrequencyHz} Hz</span>
                    <span>{p.completedSessions}/{p.totalPrescribed} Done</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Clinician Program Prescriber & Data Architecture */}
        <div className="space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
            <button
              onClick={() => setActiveTab("programs")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "programs"
                  ? "bg-text-primary text-white font-semibold"
                  : "bg-surface text-text-secondary hover:text-text-primary border border-border"
              }`}
            >
              Pre-Populated Clinical Programs (1-Click)
            </button>
            <button
              onClick={() => setActiveTab("protocol")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "protocol"
                  ? "bg-text-primary text-white font-semibold"
                  : "bg-surface text-text-secondary hover:text-text-primary border border-border"
              }`}
            >
              Custom ORF Calibration & Note
            </button>
            <button
              onClick={() => setActiveTab("brainmap")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "brainmap"
                  ? "bg-text-primary text-white font-semibold"
                  : "bg-surface text-text-secondary hover:text-text-primary border border-border"
              }`}
            >
              QEEG Cortical Topography
            </button>
            <button
              onClick={() => setActiveTab("data_architecture")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "data_architecture"
                  ? "bg-text-primary text-white font-semibold"
                  : "bg-surface text-text-secondary hover:text-text-primary border border-border"
              }`}
            >
              Data Recording & Muse SDK Info
            </button>
          </div>

          {/* TAB 1: Pre-Populated Programs */}
          {activeTab === "programs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    Pre-Populated Clinical Programs for {selectedPatient.name}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Click any program below to instantly configure this patient&apos;s therapy protocol, video modulation, and guidance note.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PREPOPULATED_PROGRAMS.map((prog) => (
                  <div
                    key={prog.id}
                    className="card p-5 space-y-3 border-border hover:border-accent/60 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary">{prog.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-semibold">
                          {prog.condition}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        &ldquo;{prog.guidanceNote}&rdquo;
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border grid grid-cols-3 gap-2 text-[10px] font-mono">
                      <div className="p-1.5 rounded bg-surface border border-border">
                        <span className="text-text-secondary block">Target ORF</span>
                        <span className="font-bold text-text-primary">{prog.orfHz} Hz</span>
                      </div>
                      <div className="p-1.5 rounded bg-surface border border-border">
                        <span className="text-text-secondary block">Sensitivity</span>
                        <span className="font-bold text-text-primary">{prog.threshold}%</span>
                      </div>
                      <div className="p-1.5 rounded bg-surface border border-border">
                        <span className="text-text-secondary block">Duration</span>
                        <span className="font-bold text-text-primary">{prog.duration} min</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyProgram(prog)}
                      className="btn btn-primary w-full py-2 text-xs font-semibold mt-1"
                    >
                      Apply & Push Protocol to Patient →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Custom Protocol Fine-Tuning */}
          {activeTab === "protocol" && (
            <div className="space-y-6">
              <div className="card p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      Custom Protocol Prescriber: {selectedPatient.name} ({selectedPatient.id})
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Fine-tune individual Optimal Response Frequency (ORF), sensitivity, and duration.
                    </p>
                  </div>
                </div>

                {/* ORF Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-text-primary">
                      Optimal Response Frequency (ORF) Fine-Tuning:
                    </label>
                    <span className="font-mono text-xs font-bold text-accent">{orfHz} Hz Slow Wave</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono text-xs">
                    {[0.001, 0.002, 0.005, 0.010, 0.015, 0.025].map((hz) => (
                      <button
                        key={hz}
                        onClick={() => setOrfHz(hz)}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          orfHz === hz
                            ? "bg-accent text-white font-bold shadow-xs border-accent"
                            : "bg-surface border-border hover:bg-white text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {hz} Hz
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders: Threshold & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-surface border border-border">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium text-text-primary">Target In-Zone Sensitivity:</span>
                      <span className="font-data font-semibold text-accent">{threshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="90"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-border">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium text-text-primary">Prescribed Daily Duration:</span>
                      <span className="font-data font-semibold text-accent">{duration} min</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="30"
                      step="5"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>
                </div>

                {/* Guidance Note */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-text-primary block">
                    Personalized Clinical Guidance Note:
                  </label>
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-border bg-surface focus:outline-none focus:border-accent text-text-primary leading-relaxed"
                    placeholder="Enter clinical advice for patient..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveCustomProtocol}
                    className="btn btn-primary text-xs py-2.5 px-6 font-semibold"
                  >
                    Save & Push Custom Protocol to Patient Device →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QEEG Topography */}
          {activeTab === "brainmap" && (
            <TopoBrainMap
              baselineCoherence={selectedPatient.baselineScore}
              currentCoherence={selectedPatient.currentScore}
            />
          )}

          {/* TAB 4: Data Architecture & Muse SDK Technical Breakdown */}
          {activeTab === "data_architecture" && (
            <div className="card p-6 space-y-6 text-xs text-text-secondary leading-relaxed">
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-text-primary">
                  Technical Architecture: Data Recording, Storage & Muse SDK Integration
                </h3>
                <p className="text-xs text-text-secondary">
                  Complete breakdown of hardware communication, telemetry storage, and clinical reporting.
                </p>
              </div>

              {/* Question 1: Do we need Muse SDK access? */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                <div className="flex items-center gap-2 text-text-primary font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>1. Do we need Muse SDK access or software downloads?</span>
                </div>
                <p>
                  <strong>No special SDK download or installation is required for clients.</strong> The platform uses the native <strong>W3C Web Bluetooth API</strong> directly inside the browser (Google Chrome, Microsoft Edge, Opera, and Bluefy Browser on iOS).
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] pl-1">
                  <li>
                    <strong>Hardware Pairing:</strong> Connects to Muse 2 and Muse S using standard Bluetooth Low Energy GATT UUID (<code className="font-mono text-teal-800">0000fe8d-0000-1000-8000-00805f9b34fb</code>).
                  </li>
                  <li>
                    <strong>Raw EEG Decoding:</strong> Decodes 256 Hz 12-bit compressed EEG across all 4 channels (<code className="font-mono text-teal-800">AF7, AF8, TP9, TP10</code>) in client-side WebAssembly / JavaScript.
                  </li>
                  <li>
                    <strong>Zero Client Friction:</strong> Patients do not need to install third-party apps or drivers.
                  </li>
                </ul>
              </div>

              {/* Question 2: Where and how does all the data get recorded? */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                <div className="flex items-center gap-2 text-text-primary font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>2. Where and how does data get recorded and used?</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-white border border-border space-y-1">
                    <strong className="text-text-primary block text-[11px]">Real-Time DSP Stream:</strong>
                    <p className="text-[10px]">
                      EEG samples are filtered (0.5–45Hz Welch PSD + 0.0001–0.05Hz Slow Cortical Potentials). Artifact rejection gates out eye blinks (EOG) and jaw clenches (EMG &gt;22Hz).
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-border space-y-1">
                    <strong className="text-text-primary block text-[11px]">Session Record Storage:</strong>
                    <p className="text-[10px]">
                      At session completion, a structured record (In-Zone %, Average Focus/Calm scores, duration, artifact count, and daily streak) is saved to the clinical database.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-border space-y-1">
                    <strong className="text-text-primary block text-[11px]">Clinical Analytics & Reports:</strong>
                    <p className="text-[10px]">
                      Dr. Upasana Gala reviews longitudinal neuroplastic gain curves, compliance rates, QEEG topographic progression, and exports clinical consultation reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
