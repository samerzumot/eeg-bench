"use client";

import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { 
  FileText, Check, Download, 
  Share2, ArrowUpRight, Zap, Brain, Activity, ClipboardList, Radio, User, Sparkles
} from "lucide-react";
import { PatientProfile, DR_UPASANA_GALA } from "@/lib/evolve/patientStore";
import { TopoBrainMap } from "./TopoBrainMap";
import { mockEeg, EegTelemetryState } from "@/lib/evolve/mockEegService";

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
  const [activeTab, setActiveTab] = useState<"programs" | "protocol" | "brainmap" | "assessments" | "telesupervision">("programs");
  const [noteText, setNoteText] = useState(selectedPatient.doctorNote);
  const [threshold, setThreshold] = useState(selectedPatient.thresholdScore);
  const [duration, setDuration] = useState(selectedPatient.sessionDurationMin || 15);
  const [orfHz, setOrfHz] = useState<number>(selectedPatient.optimalResponseFrequencyHz || 0.005);
  const [protocolType, setProtocolType] = useState(selectedPatient.protocolType);
  const [toastMsg, setToastMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [eegState, setEegState] = useState<EegTelemetryState | null>(null);

  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setNoteText(selectedPatient.doctorNote);
    setThreshold(selectedPatient.thresholdScore);
    setDuration(selectedPatient.sessionDurationMin || 15);
    setOrfHz(selectedPatient.optimalResponseFrequencyHz || 0.005);
    setProtocolType(selectedPatient.protocolType);
  }, [selectedPatient]);

  useEffect(() => {
    mockEeg.start(45);
    const unsub = mockEeg.subscribe(st => setEegState(st));
    return () => {
      unsub();
    };
  }, []);

  // Live Oscilloscope Canvas for Tele-Supervision
  useEffect(() => {
    if (activeTab !== "telesupervision") return;
    const canvas = liveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < rect.width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    const raw = eegState?.rawSamples || { tp9: [], af7: [], af8: [], tp10: [], ilfSlowWave: [] };
    const channels = [
      { name: `ILF (${orfHz}Hz)`, data: raw.ilfSlowWave || [], color: "#D97706", isIlf: true },
      { name: "AF7 (L-Frontal)", data: raw.af7 || [], color: "#0D9488" },
      { name: "AF8 (R-Frontal)", data: raw.af8 || [], color: "#059669" },
      { name: "TP9 (L-Temporal)", data: raw.tp9 || [], color: "#0284C7" },
      { name: "TP10 (R-Temporal)", data: raw.tp10 || [], color: "#4F46E5" },
    ];

    const chHeight = rect.height / channels.length;

    channels.forEach((ch, idx) => {
      const centerY = idx * chHeight + chHeight / 2;

      ctx.fillStyle = ch.color;
      ctx.font = "600 10px monospace";
      ctx.fillText(ch.name, 10, centerY - 2);

      const data = ch.data;
      if (data && data.length > 1) {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = ch.isIlf ? 1.75 : 1.2;
        ctx.beginPath();
        const startX = 110;
        const availableW = rect.width - startX - 10;
        const step = availableW / (data.length - 1);

        for (let i = 0; i < data.length; i++) {
          const x = startX + i * step;
          const y = ch.isIlf ? centerY - (data[i] || 0) * 14 : centerY - (data[i] || 0) * 0.6;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    });
  }, [activeTab, eegState, orfHz]);

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

  // Clinical PDF Report Generator (NO CPT CODES)
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
      doc.rect(0, 0, 210, 32, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("EVOLVE BRAIN TRAINING", 14, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("CLINICAL NEUROFEEDBACK & QEEG PROGRESS REPORT", 14, 22);
      doc.text("Dubai Healthcare City · Abu Dhabi", 14, 27);

      doc.setFontSize(8.5);
      doc.text(`Date: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`, 160, 15);
      doc.text(`Patient ID: ${selectedPatient.id}`, 160, 22);

      // Section 1: Patient Summary
      doc.setTextColor(...darkColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("1. Patient Profile & Clinical Indication", 14, 42);

      doc.setFillColor(...lightBg);
      doc.rect(14, 46, 182, 22, "F");
      doc.setDrawColor(220, 220, 220);
      doc.rect(14, 46, 182, 22, "S");

      doc.setFontSize(9);
      doc.setTextColor(...darkColor);
      doc.text(`Patient Name: ${selectedPatient.name}`, 18, 53);
      doc.text(`Clinical Indication: ${selectedPatient.indication}`, 18, 60);
      doc.text(`Prescribed Protocol: ${selectedPatient.protocolName}`, 105, 53);
      doc.text(`Optimal Response Frequency (ORF): ${selectedPatient.optimalResponseFrequencyHz || 0.005} Hz`, 105, 60);

      // Section 2: Adherence & Progress Metrics
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("2. Objective Training Compliance & Neurometric Gains", 14, 76);

      const metrics = [
        { label: "Completed Sessions", value: `${selectedPatient.completedSessions} of ${selectedPatient.totalPrescribed}` },
        { label: "Baseline QEEG Score", value: `${selectedPatient.baselineScore} / 100` },
        { label: "Current Progress Score", value: `${selectedPatient.currentScore} / 100` },
        { label: "Slow-Wave Stability Gain", value: `+${selectedPatient.coherenceImprovementPercent}%` },
      ];

      metrics.forEach((m, idx) => {
        const x = 14 + idx * 46;
        doc.setFillColor(...lightBg);
        doc.rect(x, 80, 44, 20, "F");
        doc.rect(x, 80, 44, 20, "S");

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...grayColor);
        doc.text(m.label, x + 3, 86);

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text(m.value, x + 3, 95);
      });

      // Section 3: Standardized Psychometric Scores
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...darkColor);
      doc.text("3. Standardized Psychometric & Symptom Trajectory", 14, 110);

      const psychometrics = [
        { test: "GAD-7 (Anxiety Scale)", pre: "16 (Severe)", post: "6 (Mild)", delta: "-62.5% Reduction" },
        { test: "ASRS (ADHD Attention Index)", pre: "24 (Elevated)", post: "11 (Normalized)", delta: "-54.2% Reduction" },
        { test: "ISI (Insomnia Severity Index)", pre: "19 (Clinical)", post: "5 (Sub-threshold)", delta: "-73.7% Reduction" },
      ];

      psychometrics.forEach((p, idx) => {
        const y = 118 + idx * 10;
        doc.setFillColor(idx % 2 === 0 ? 250 : 255, 250, 250);
        doc.rect(14, y - 4, 182, 8, "F");

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkColor);
        doc.text(p.test, 18, y + 1);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...grayColor);
        doc.text(`Intake: ${p.pre}`, 85, y + 1);
        doc.text(`Current: ${p.post}`, 125, y + 1);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text(p.delta, 160, y + 1);
      });

      // Section 4: Clinician Assessment & Prescription Guidance
      const assessY = 158;
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("4. Dr. Upasana Gala's Clinical Impression & Recommendation", 14, assessY);

      doc.setFillColor(...lightBg);
      doc.rect(14, assessY + 4, 182, 34, "F");
      doc.setDrawColor(220, 220, 220);
      doc.rect(14, assessY + 4, 182, 34, "S");

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...darkColor);
      const splitNote = doc.splitTextToSize(`"${selectedPatient.doctorNote}"`, 174);
      doc.text(splitNote, 18, assessY + 12);

      // Signature Section
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...darkColor);
      doc.text("Supervising Clinician Signature:", 14, 220);
      doc.text("Dr. Upasana Gala, PhD, BCN, QEEG-D", 14, 230);
      doc.setFontSize(7.5);
      doc.setTextColor(...grayColor);
      doc.text("Founder & Managing Director · Evolve Brain Training LLC", 14, 234);

      // Official Stamp Seal Simulation
      doc.setDrawColor(...primaryColor);
      doc.circle(165, 228, 12, "S");
      doc.setFontSize(6);
      doc.setTextColor(...primaryColor);
      doc.text("EVOLVE CLINIC", 154, 227);
      doc.text("VERIFIED QEEG", 153, 230);

      doc.save(`Evolve_Report_${selectedPatient.id}_${selectedPatient.name.replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Clinician Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-teal-600 shadow-sm shrink-0 bg-slate-100">
            <img
              src="/evolve/dr-upasana-gala.png"
              alt="Dr. Upasana Gala"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/dr-upasana-gala.png";
              }}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-slate-900">
                Dr. Upasana Gala (PhD, BCN, QEEG-D)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 border border-teal-300 text-teal-800 font-bold">
                Clinician Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Founder, Evolve Brain Training · Dubai Healthcare City & Abu Dhabi
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
            className="btn btn-primary text-xs py-2 px-3.5 font-semibold flex items-center gap-1.5 shadow-sm"
            title="Download formal clinical progress PDF for patient"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? "Generating PDF..." : "Download Clinical PDF Report"}</span>
          </button>

          {onOpenDemo && (
            <button
              onClick={onOpenDemo}
              className="btn btn-outline text-xs py-2 px-3 border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100 font-medium"
            >
              Doctor Tour
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="btn btn-outline text-xs py-2 px-3 flex items-center gap-1.5 text-slate-700"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? "Link Copied" : "Share Patient Link"}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-300 text-teal-900 text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <Check className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Main Layout Grid: Responsive on mobile/desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        
        {/* Patient Roster Left */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Patient Roster ({patients.length})
            </span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredPatients.map((p) => {
              const isSelected = p.id === selectedPatient.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPatient(p.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-teal-50/90 border-teal-500 text-slate-900 shadow-xs ring-1 ring-teal-400"
                      : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.name}</span>
                    <span className="text-[10px] font-mono font-bold text-teal-700">{p.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 truncate">{p.indication}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200/60 pt-1">
                    <span>{p.completedSessions}/{p.totalPrescribed} Sessions</span>
                    <span className="text-teal-700 font-bold">+{p.coherenceImprovementPercent}% Gain</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-Tabs Right */}
        <div className="space-y-6">
          
          {/* Horizontally scrollable sub-tabs for mobile screens */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 font-mono text-xs overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => setActiveTab("programs")}
              className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
                activeTab === "programs"
                  ? "bg-teal-700 text-white font-semibold shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              Pre-Populated Programs
            </button>
            <button
              onClick={() => setActiveTab("protocol")}
              className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
                activeTab === "protocol"
                  ? "bg-teal-700 text-white font-semibold shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              Custom ORF Calibration
            </button>
            <button
              onClick={() => setActiveTab("brainmap")}
              className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
                activeTab === "brainmap"
                  ? "bg-teal-700 text-white font-semibold shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              QEEG Brain Topography
            </button>
            <button
              onClick={() => setActiveTab("assessments")}
              className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
                activeTab === "assessments"
                  ? "bg-teal-700 text-white font-semibold shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              Psychometric Scales (GAD/ASRS)
            </button>
            <button
              onClick={() => setActiveTab("telesupervision")}
              className={`px-3.5 py-1.5 rounded-lg transition-all shrink-0 ${
                activeTab === "telesupervision"
                  ? "bg-teal-700 text-white font-semibold shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              Live Tele-Supervision
            </button>
          </div>

          {/* TAB 1: Programs */}
          {activeTab === "programs" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pre-Populated Clinical Programs for {selectedPatient.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Click any program below to instantly configure this patient&apos;s therapy protocol, video modulation, and guidance note.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PREPOPULATED_PROGRAMS.map((prog) => (
                  <div
                    key={prog.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 shadow-sm transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{prog.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                          {prog.condition}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed italic">
                        &ldquo;{prog.guidanceNote}&rdquo;
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-[10px] font-mono">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                        <span className="text-slate-500 block text-[9px]">Target ORF</span>
                        <span className="font-bold text-slate-900">{prog.orfHz} Hz</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                        <span className="text-slate-500 block text-[9px]">Sensitivity</span>
                        <span className="font-bold text-slate-900">{prog.threshold}%</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                        <span className="text-slate-500 block text-[9px]">Duration</span>
                        <span className="font-bold text-slate-900">{prog.duration} min</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyProgram(prog)}
                      className="btn btn-primary w-full py-2 text-xs font-semibold mt-1 shadow-xs"
                    >
                      Apply & Push Protocol to Patient →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Custom Protocol Calibration */}
          {activeTab === "protocol" && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Custom Protocol Calibration: {selectedPatient.name} ({selectedPatient.id})
                </h3>
                <p className="text-xs text-slate-500">
                  Fine-tune individual Optimal Response Frequency (ORF), sensitivity, and duration.
                </p>
              </div>

              {/* ORF Selector */}
              <div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-semibold text-slate-800">Optimal Response Frequency (ORF) Fine-Tuning:</span>
                  <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{orfHz} Hz Slow Wave</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono text-xs">
                  {[0.001, 0.002, 0.005, 0.010, 0.015, 0.025].map((hz) => (
                    <button
                      key={hz}
                      onClick={() => setOrfHz(hz)}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        orfHz === hz
                          ? "bg-teal-700 text-white font-bold shadow-xs border-teal-700"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {hz} Hz
                    </button>
                  ))}
                </div>
              </div>

              {/* Threshold Slider */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Target Coherence Sensitivity Threshold:</span>
                  <span className="font-mono font-bold text-teal-700">{threshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              {/* Guidance Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">
                  Personalized Clinical Guidance Note:
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-teal-600 leading-relaxed shadow-2xs"
                  placeholder="Enter clinical advice for patient..."
                />
              </div>

              <button
                onClick={handleSaveCustomProtocol}
                className="btn btn-primary text-xs py-2.5 px-6 font-semibold shadow-sm"
              >
                Save & Sync Custom Protocol to Patient →
              </button>
            </div>
          )}

          {/* TAB 3: QEEG Brain Map Topography */}
          {activeTab === "brainmap" && (
            <TopoBrainMap
              baselineScore={selectedPatient.baselineScore}
              currentScore={selectedPatient.currentScore}
            />
          )}

          {/* TAB 4: Standardized Psychometrics */}
          {activeTab === "assessments" && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-teal-700" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Standardized Clinical Psychometrics & Intake Tracking
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Objective EEG biomarkers correlated with validated psychometric symptom scales.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: "GAD-7 (Generalized Anxiety)",
                    intake: 16,
                    current: 6,
                    status: "Severe → Mild",
                    desc: "Significant reduction in somatic tension and sympathetic hyperarousal.",
                    gain: "-62.5%",
                  },
                  {
                    name: "ASRS v1.1 (Adult ADHD Scale)",
                    intake: 24,
                    current: 11,
                    status: "Clinically Elevated → Sub-threshold",
                    desc: "Executive attentional stamina and sustained focus normalized.",
                    gain: "-54.2%",
                  },
                  {
                    name: "ISI (Insomnia Severity Index)",
                    intake: 19,
                    current: 5,
                    status: "Moderate Insomnia → Restful Sleep",
                    desc: "Parieto-occipital slow wave coherence restored sleep latency.",
                    gain: "-73.7%",
                  },
                  {
                    name: "PHQ-9 (Depression & Affect)",
                    intake: 14,
                    current: 4,
                    status: "Moderate → Minimal Symptoms",
                    desc: "Left frontal alpha activation improved motivation and cognitive drive.",
                    gain: "-71.4%",
                  },
                ].map((test) => (
                  <div key={test.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{test.name}</span>
                      <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{test.gain}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Intake Score</span>
                        <span className="text-rose-600 font-bold">{test.intake} pts</span>
                      </div>
                      <span className="text-slate-400">→</span>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Current Score</span>
                        <span className="text-teal-700 font-bold">{test.current} pts</span>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="text-[10px] text-slate-500 block">Clinical Shift</span>
                        <span className="text-slate-800 text-[11px] font-sans font-medium">{test.status}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                      {test.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Live Clinician Tele-Supervision */}
          {activeTab === "telesupervision" && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-teal-700 animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Live Tele-Supervision & Remote Bio-Observation Stream
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live raw EEG waveforms, impedance, and remote threshold calibration during telehealth coaching.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-teal-50 border border-teal-300 text-teal-900 font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" />
                  Live 256Hz WebStream
                </span>
              </div>

              {/* Live Oscilloscope */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-2">
                  <span>Raw Electrodes (AF7, AF8, TP9, TP10, ILF Slow Potential)</span>
                  <span className="text-teal-700 font-bold">Impedance: Optimal &lt; 5kΩ</span>
                </div>
                <div className="h-52 w-full rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shadow-inner">
                  <canvas ref={liveCanvasRef} className="w-full h-full block" />
                </div>
              </div>

              {/* Mid-Session Remote Protocol Tweak */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Live Remote Threshold Adjustment:</span>
                  <span className="font-mono text-teal-700 font-bold">{threshold}% Sensitivity</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={threshold}
                  onChange={(e) => {
                    setThreshold(Number(e.target.value));
                    onUpdateProtocol(selectedPatient.id, { thresholdScore: Number(e.target.value) });
                  }}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Adjusting this slider pushes instantaneous threshold changes to the patient&apos;s active session screen in real time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
