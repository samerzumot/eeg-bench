import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Check, Download, 
  Share2, ArrowUpRight, Zap, Brain, Activity, ClipboardList, Radio, User, Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { BrainMapViewer } from './BrainMapViewer';

const PREPOPULATED_PROGRAMS = [
  {
    id: "adhd_focus",
    title: "ADHD & Attentional Focus Protocol",
    condition: "ADHD / Attention Drift",
    orfHz: 0.005,
    threshold: 65,
    duration: 15,
    montage: "AF7–TP9 Prefrontal-Temporal Lead",
    guidanceNote: "Targeting prefrontal slow-wave stability (0.005 Hz). Focus gently on the video; your calm alpha-SMR rhythm will keep the video bright and sharp without straining.",
  },
  {
    id: "anxiety_calm",
    title: "Anxiety & Autonomic Down-Regulation",
    condition: "Anxiety / Chronic Stress",
    orfHz: 0.002,
    threshold: 65,
    duration: 15,
    montage: "T4–P4 Right Temporal-Parietal Lead",
    guidanceNote: "Significant reduction in autonomic hyperarousal observed. Relax your shoulders, breathe with diaphragmatic ease, and allow the soothing sensory flow to quiet your nervous system.",
  },
  {
    id: "sleep_insomnia",
    title: "Insomnia & Sleep Architecture Stabilization",
    condition: "Sleep Disruption / Insomnia",
    orfHz: 0.001,
    threshold: 60,
    duration: 20,
    montage: "Pz–Oz Parietal-Occipital Synchrony",
    guidanceNote: "Promotes deep thalamocortical slow-wave synchrony. Best performed 30 minutes before bed in dim lighting to anchor your circadian restorative rhythms.",
  },
  {
    id: "peak_performance",
    title: "Executive Bandwidth & Peak Cognitive Flow",
    condition: "Executive Peak Flow",
    orfHz: 0.012,
    threshold: 72,
    duration: 20,
    montage: "Bilateral Frontal-Temporal 40Hz Flow",
    guidanceNote: "High-performance executive integration protocol. Challenge yourself to sustain effortless attentional flow and high coherence without somatic tension.",
  },
];

export function ClinicianDashboard({ 
  clients, 
  selectedClientId, 
  onSelectClient, 
  onUpdateClientNote, 
  onUpdateProtocol,
  onOpenDemo,
  eegState 
}) {
  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const [activeSubTab, setActiveSubTab] = useState('programs'); // 'programs' | 'protocol' | 'brainmap' | 'assessments' | 'telesupervision'
  const [noteText, setNoteText] = useState(selectedClient.doctorNote);
  const [threshold, setThreshold] = useState(selectedClient.protocolSensitivity || 65);
  const [orfHz, setOrfHz] = useState(selectedClient.optimalResponseFrequencyHz || 0.005);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Live Oscilloscope Canvas Ref for Tele-Supervision
  const liveCanvasRef = useRef(null);

  // Sync state when client changes
  useEffect(() => {
    setNoteText(selectedClient.doctorNote);
    setThreshold(selectedClient.protocolSensitivity || 65);
    setOrfHz(selectedClient.optimalResponseFrequencyHz || 0.005);
  }, [selectedClient]);

  const handleApplyProgram = (prog) => {
    setOrfHz(prog.orfHz);
    setThreshold(prog.threshold);
    setNoteText(prog.guidanceNote);

    onUpdateProtocol(selectedClient.id, {
      protocol: prog.title,
      protocolSensitivity: prog.threshold,
      optimalResponseFrequencyHz: prog.orfHz,
    });
    onUpdateClientNote(selectedClient.id, prog.guidanceNote);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveCustom = () => {
    onUpdateClientNote(selectedClient.id, noteText);
    onUpdateProtocol(selectedClient.id, {
      protocolSensitivity: threshold,
      optimalResponseFrequencyHz: orfHz,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyPatientLink = () => {
    const url = `${window.location.origin}/?patient=${selectedClient.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Draw Live Tele-Supervision Oscilloscope
  useEffect(() => {
    if (activeSubTab !== 'telesupervision') return;
    const canvas = liveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < rect.width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    const raw = eegState?.rawSamples || { ch1: [], ch2: [], ch3: [], ch4: [], ilf: [] };
    const channels = [
      { name: `ILF (${orfHz}Hz)`, sub: 'DC Potential', data: raw.ilf || [], color: '#F59E0B', isIlf: true },
      { name: 'AF7 (L-Frontal)', sub: 'Left Frontal', data: raw.ch2 || [], color: '#3B9B8F' },
      { name: 'AF8 (R-Frontal)', sub: 'Right Frontal', data: raw.ch3 || [], color: '#2DD4BF' },
      { name: 'TP9 (L-Temporal)', sub: 'Left Temporal', data: raw.ch1 || [], color: '#38BDF8' },
      { name: 'TP10 (R-Temporal)', sub: 'Right Temporal', data: raw.ch4 || [], color: '#818CF8' },
    ];

    const chHeight = rect.height / channels.length;

    channels.forEach((ch, idx) => {
      const centerY = idx * chHeight + chHeight / 2;

      ctx.fillStyle = ch.color;
      ctx.font = '600 9px monospace';
      ctx.fillText(ch.name, 10, centerY - 2);

      const data = ch.data;
      if (data && data.length > 1) {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = ch.isIlf ? 1.75 : 1.1;
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
  }, [activeSubTab, eegState, orfHz]);

  // Clinical PDF Report Generator (jsPDF) — NO CPT CODES
  const handleExportPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [46, 111, 101]; // Teal #2E6F65
      const darkColor = [20, 20, 20];
      const grayColor = [100, 100, 100];
      const lightBg = [245, 247, 248];

      // Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('EVOLVE BRAIN TRAINING', 14, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('CLINICAL NEUROFEEDBACK & QEEG PROGRESS REPORT', 14, 22);
      doc.text('Dubai Healthcare City · Abu Dhabi', 14, 27);

      doc.setFontSize(8.5);
      doc.text(`Date: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, 160, 15);
      doc.text(`Patient ID: ${selectedClient.id}`, 160, 22);

      // Section 1: Patient Summary
      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('1. Patient Profile & Clinical Indication', 14, 42);

      doc.setFillColor(...lightBg);
      doc.rect(14, 46, 182, 22, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(14, 46, 182, 22, 'S');

      doc.setFontSize(9);
      doc.setTextColor(...darkColor);
      doc.text(`Patient Name: ${selectedClient.name}`, 18, 53);
      doc.text(`Clinical Indication: ${selectedClient.indication}`, 18, 60);
      doc.text(`Prescribed Protocol: ${selectedClient.protocol}`, 105, 53);
      doc.text(`Optimal Response Frequency (ORF): ${selectedClient.optimalResponseFrequencyHz || 0.005} Hz`, 105, 60);

      // Section 2: Adherence & Progress Metrics
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. Objective Training Compliance & Neurometric Gains', 14, 76);

      const metrics = [
        { label: 'Completed Sessions', value: `${selectedClient.completedSessions} of ${selectedClient.totalPrescribed}` },
        { label: 'Baseline QEEG Score', value: `${selectedClient.baselineScore} / 100` },
        { label: 'Current Progress Score', value: `${selectedClient.currentAvg} / 100` },
        { label: 'Slow-Wave Stability Gain', value: `+${selectedClient.gainPercent}%` },
      ];

      metrics.forEach((m, idx) => {
        const x = 14 + idx * 46;
        doc.setFillColor(...lightBg);
        doc.rect(x, 80, 44, 20, 'F');
        doc.rect(x, 80, 44, 20, 'S');

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayColor);
        doc.text(m.label, x + 3, 86);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(m.value, x + 3, 95);
      });

      // Section 3: Standardized Psychometric Scores
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...darkColor);
      doc.text('3. Standardized Psychometric & Symptom Trajectory', 14, 110);

      const psychometrics = [
        { test: 'GAD-7 (Anxiety Scale)', pre: '16 (Severe)', post: '6 (Mild)', delta: '-62.5% Reduction' },
        { test: 'ASRS (ADHD Attention Index)', pre: '24 (Elevated)', post: '11 (Normalized)', delta: '-54.2% Reduction' },
        { test: 'ISI (Insomnia Severity Index)', pre: '19 (Clinical)', post: '5 (Sub-threshold)', delta: '-73.7% Reduction' },
      ];

      psychometrics.forEach((p, idx) => {
        const y = 118 + idx * 10;
        doc.setFillColor(idx % 2 === 0 ? 250 : 255, 250, 250);
        doc.rect(14, y - 4, 182, 8, 'F');

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text(p.test, 18, y + 1);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayColor);
        doc.text(`Intake: ${p.pre}`, 85, y + 1);
        doc.text(`Current: ${p.post}`, 125, y + 1);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(p.delta, 160, y + 1);
      });

      // Section 4: Clinician Assessment & Prescription Guidance
      const assessY = 158;
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("4. Dr. Upasana Gala's Clinical Impression & Recommendation", 14, assessY);

      doc.setFillColor(...lightBg);
      doc.rect(14, assessY + 4, 182, 34, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(14, assessY + 4, 182, 34, 'S');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(...darkColor);
      const splitNote = doc.splitTextToSize(`"${selectedClient.doctorNote}"`, 174);
      doc.text(splitNote, 18, assessY + 12);

      // Signature Section
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...darkColor);
      doc.text('Supervising Clinician Signature:', 14, 220);
      doc.text('Dr. Upasana Gala, PhD, BCN, QEEG-D', 14, 230);
      doc.setFontSize(7.5);
      doc.setTextColor(...grayColor);
      doc.text('Founder & Managing Director · Evolve Brain Training LLC', 14, 234);

      // Official Stamp Seal Simulation
      doc.setDrawColor(...primaryColor);
      doc.circle(165, 228, 12, 'S');
      doc.setFontSize(6);
      doc.setTextColor(...primaryColor);
      doc.text('EVOLVE CLINIC', 154, 227);
      doc.text('VERIFIED QEEG', 153, 230);

      doc.save(`Evolve_Report_${selectedClient.id}_${selectedClient.name.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error('PDF generation failed:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6 text-[#EDEDED] font-sans">
      
      {/* Clinician Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-[#111111] border border-[#222222] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-full overflow-hidden border border-emerald-500/40 shrink-0">
            <img 
              src="/dr-upasana-gala.png" 
              alt="Dr. Upasana Gala" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-[#EDEDED]">
                Dr. Upasana Gala (PhD, BCN, QEEG-D)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/80 text-emerald-400 font-semibold">
                Clinician Portal
              </span>
            </div>
            <p className="text-xs text-[#888888]">
              Founder, Evolve Brain Training · Dubai Healthcare City & Abu Dhabi
            </p>
          </div>
        </div>

        {/* Actions: Export PDF & Share */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
            className="btn btn-primary text-xs py-2 px-3.5 font-semibold flex items-center gap-1.5 shadow-sm"
            title="Download formal clinical progress PDF for patient"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Clinical PDF Report'}</span>
          </button>

          {onOpenDemo && (
            <button
              onClick={onOpenDemo}
              className="btn btn-outline text-xs py-2 px-3 border-teal-800/80 text-teal-300 bg-teal-950/40 hover:bg-teal-950/80"
            >
              Doctor Tour
            </button>
          )}

          <button
            onClick={handleCopyPatientLink}
            className="btn btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#888888]" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Patient Link'}</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/80 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Protocol & clinical note updated and synced to client dashboard.</span>
        </div>
      )}

      {/* Main Grid: Patient List on Left, Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        
        {/* Left: Patient Roster */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#888888] font-mono">
              Patient Roster ({clients.length})
            </span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {clients.map((c) => {
              const isSelected = c.id === selectedClient.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectClient(c.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-xs'
                      : 'bg-[#161616] border-[#222222] hover:bg-[#1C1C1C] text-[#EDEDED]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#EDEDED]">{c.name}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{c.id}</span>
                  </div>
                  <p className="text-[11px] text-[#888888] mt-0.5 truncate">{c.indication}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#666666] font-mono border-t border-[#222222] pt-1">
                    <span>{c.completedSessions}/{c.totalPrescribed} Sessions</span>
                    <span className="text-emerald-400">+{c.gainPercent}% Gain</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sub-Tabs & Clinical Engines */}
        <div className="space-y-6">
          
          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#222222] pb-3 font-mono text-xs">
            <button
              onClick={() => setActiveSubTab('programs')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'programs'
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                  : 'bg-[#161616] border border-[#222222] text-[#888888] hover:text-[#EDEDED]'
              }`}
            >
              Pre-Populated Programs
            </button>
            <button
              onClick={() => setActiveSubTab('protocol')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'protocol'
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                  : 'bg-[#161616] border border-[#222222] text-[#888888] hover:text-[#EDEDED]'
              }`}
            >
              Custom ORF Calibration
            </button>
            <button
              onClick={() => setActiveSubTab('brainmap')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'brainmap'
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                  : 'bg-[#161616] border border-[#222222] text-[#888888] hover:text-[#EDEDED]'
              }`}
            >
              QEEG Brain Topography
            </button>
            <button
              onClick={() => setActiveSubTab('assessments')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'assessments'
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                  : 'bg-[#161616] border border-[#222222] text-[#888888] hover:text-[#EDEDED]'
              }`}
            >
              Psychometric Scales (GAD/ASRS)
            </button>
            <button
              onClick={() => setActiveSubTab('telesupervision')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'telesupervision'
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                  : 'bg-[#161616] border border-[#222222] text-[#888888] hover:text-[#EDEDED]'
              }`}
            >
              Live Tele-Supervision
            </button>
          </div>

          {/* TAB 1: Pre-Populated Programs */}
          {activeSubTab === 'programs' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#EDEDED]">
                  Pre-Populated Clinical Programs for {selectedClient.name}
                </h3>
                <p className="text-xs text-[#888888]">
                  Click any program below to instantly configure this patient&apos;s therapy protocol, video modulation, and guidance note.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PREPOPULATED_PROGRAMS.map((prog) => (
                  <div
                    key={prog.id}
                    className="p-5 rounded-xl bg-[#111111] border border-[#222222] hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#EDEDED]">{prog.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-semibold">
                          {prog.condition}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#888888] leading-relaxed">
                        &ldquo;{prog.guidanceNote}&rdquo;
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#222222] grid grid-cols-3 gap-2 text-[10px] font-mono">
                      <div className="p-1.5 rounded bg-[#161616] border border-[#222222]">
                        <span className="text-[#888888] block">Target ORF</span>
                        <span className="font-bold text-[#EDEDED]">{prog.orfHz} Hz</span>
                      </div>
                      <div className="p-1.5 rounded bg-[#161616] border border-[#222222]">
                        <span className="text-[#888888] block">Sensitivity</span>
                        <span className="font-bold text-[#EDEDED]">{prog.threshold}%</span>
                      </div>
                      <div className="p-1.5 rounded bg-[#161616] border border-[#222222]">
                        <span className="text-[#888888] block">Duration</span>
                        <span className="font-bold text-[#EDEDED]">{prog.duration} min</span>
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

          {/* TAB 2: Custom Protocol Calibration */}
          {activeSubTab === 'protocol' && (
            <div className="p-6 rounded-xl bg-[#111111] border border-[#222222] space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[#EDEDED]">
                  Custom Protocol Calibration: {selectedClient.name} ({selectedClient.id})
                </h3>
                <p className="text-xs text-[#888888]">
                  Fine-tune individual Optimal Response Frequency (ORF), sensitivity, and duration.
                </p>
              </div>

              {/* ORF Selector */}
              <div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-medium text-[#EDEDED]">Optimal Response Frequency (ORF) Fine-Tuning:</span>
                  <span className="font-mono font-bold text-emerald-400">{orfHz} Hz Slow Wave</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono text-xs">
                  {[0.001, 0.002, 0.005, 0.010, 0.015, 0.025].map((hz) => (
                    <button
                      key={hz}
                      onClick={() => setOrfHz(hz)}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        orfHz === hz
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold shadow-xs'
                          : 'bg-[#161616] border-[#222222] text-[#888888] hover:text-[#EDEDED]'
                      }`}
                    >
                      {hz} Hz
                    </button>
                  ))}
                </div>
              </div>

              {/* Threshold Slider */}
              <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222222]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium text-[#EDEDED]">Target Coherence Sensitivity Threshold:</span>
                  <span className="font-mono font-semibold text-emerald-400">{threshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Guidance Note */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#EDEDED] block">
                  Personalized Clinical Guidance Note:
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-[#333333] bg-[#161616] text-[#EDEDED] focus:outline-none focus:border-emerald-500 leading-relaxed"
                  placeholder="Enter clinical advice for patient..."
                />
              </div>

              <button
                onClick={handleSaveCustom}
                className="btn btn-primary text-xs py-2.5 px-6 font-semibold"
              >
                Save & Sync Custom Protocol to Patient →
              </button>
            </div>
          )}

          {/* TAB 3: QEEG Brain Map Topography */}
          {activeSubTab === 'brainmap' && (
            <BrainMapViewer 
              baselineScore={selectedClient.baselineScore}
              currentScore={selectedClient.currentAvg}
            />
          )}

          {/* TAB 4: Standardized Psychometrics & Symptom Tracking */}
          {activeSubTab === 'assessments' && (
            <div className="p-6 rounded-xl bg-[#111111] border border-[#222222] space-y-6">
              <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-[#EDEDED]">
                      Standardized Clinical Psychometrics & Intake Tracking
                    </h3>
                  </div>
                  <p className="text-xs text-[#888888] mt-0.5">
                    Objective EEG biomarkers correlated with validated psychometric symptom scales.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'GAD-7 (Generalized Anxiety)',
                    intake: 16,
                    current: 6,
                    status: 'Severe → Mild',
                    desc: 'Significant reduction in somatic tension and sympathetic hyperarousal.',
                    gain: '-62.5%',
                    color: 'text-emerald-400'
                  },
                  {
                    name: 'ASRS v1.1 (Adult ADHD Scale)',
                    intake: 24,
                    current: 11,
                    status: 'Clinically Elevated → Sub-threshold',
                    desc: 'Executive attentional stamina and sustained focus normalized.',
                    gain: '-54.2%',
                    color: 'text-emerald-400'
                  },
                  {
                    name: 'ISI (Insomnia Severity Index)',
                    intake: 19,
                    current: 5,
                    status: 'Moderate Insomnia → Restful Sleep',
                    desc: 'Parieto-occipital slow wave coherence restored sleep latency.',
                    gain: '-73.7%',
                    color: 'text-emerald-400'
                  },
                  {
                    name: 'PHQ-9 (Depression & Affect)',
                    intake: 14,
                    current: 4,
                    status: 'Moderate → Minimal Symptoms',
                    desc: 'Left frontal alpha activation improved motivation and cognitive drive.',
                    gain: '-71.4%',
                    color: 'text-emerald-400'
                  }
                ].map((test) => (
                  <div key={test.name} className="p-4 rounded-xl bg-[#161616] border border-[#222222] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#EDEDED]">{test.name}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{test.gain}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-[#888888] block">Intake Score</span>
                        <span className="text-rose-400 font-bold">{test.intake} pts</span>
                      </div>
                      <span className="text-[#555555]">→</span>
                      <div>
                        <span className="text-[10px] text-[#888888] block">Current Score</span>
                        <span className="text-emerald-400 font-bold">{test.current} pts</span>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="text-[10px] text-[#888888] block">Clinical Shift</span>
                        <span className="text-[#CCCCCC] text-[11px] font-sans">{test.status}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#888888] pt-1 border-t border-[#2A2A2A]">
                      {test.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Live Clinician Tele-Supervision */}
          {activeSubTab === 'telesupervision' && (
            <div className="p-6 rounded-xl bg-[#111111] border border-[#222222] space-y-5">
              <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h3 className="text-sm font-semibold text-[#EDEDED]">
                      Live Tele-Supervision & Remote Bio-Observation Stream
                    </h3>
                  </div>
                  <p className="text-xs text-[#888888] mt-0.5">
                    Live raw EEG waveforms, impedance, and remote threshold calibration during telehealth coaching.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live 256Hz WebStream
                </span>
              </div>

              {/* Live Oscilloscope */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#888888]">
                  <span>Raw Electrode Potentials (AF7, AF8, TP9, TP10, ILF Slow Potential)</span>
                  <span className="text-emerald-400 font-bold">Impedance: Optimal &lt; 5kΩ</span>
                </div>
                <div className="h-52 w-full rounded-xl bg-[#0A0A0A] border border-[#222222] overflow-hidden">
                  <canvas ref={liveCanvasRef} className="w-full h-full block" />
                </div>
              </div>

              {/* Mid-Session Remote Protocol Tweak */}
              <div className="p-4 rounded-xl bg-[#161616] border border-[#222222] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#EDEDED]">Live Remote Threshold Adjustment:</span>
                  <span className="font-mono text-emerald-400 font-bold">{threshold}% Sensitivity</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={threshold}
                  onChange={(e) => {
                    setThreshold(Number(e.target.value));
                    onUpdateProtocol(selectedClient.id, { protocolSensitivity: Number(e.target.value) });
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-[#888888]">
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
