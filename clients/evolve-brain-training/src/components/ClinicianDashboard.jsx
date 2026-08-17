import React, { useState } from 'react';
import { 
  FileText, Check, Download, 
  Share2, ArrowUpRight, Zap
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
  onOpenDemo 
}) {
  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const [activeSubTab, setActiveSubTab] = useState('programs'); // 'programs' | 'protocol' | 'brainmap' | 'sessions'
  const [noteText, setNoteText] = useState(selectedClient.doctorNote);
  const [threshold, setThreshold] = useState(selectedClient.protocolSensitivity || 65);
  const [orfHz, setOrfHz] = useState(selectedClient.optimalResponseFrequencyHz || 0.005);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  // Clinical PDF Report Generator (jsPDF)
  const handleExportPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryColor = [46, 111, 101]; // Teal #2E6F65
      const darkColor = [20, 20, 20];
      const grayColor = [100, 100, 100];
      const lightBg = [245, 247, 248];

      // Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('EVOLVE BRAIN TRAINING · CLINICAL PROGRESS REPORT', 14, 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Dr. Upasana Gala (PhD, BCN, QEEG-D) · Dubai Healthcare City & Abu Dhabi', 14, 18);

      // Report Metadata Bar
      doc.setFillColor(...lightBg);
      doc.rect(14, 30, 182, 22, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(14, 30, 182, 22, 'S');

      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Patient: ${selectedClient.name}`, 18, 37);
      doc.text(`File ID: ${selectedClient.id}`, 80, 37);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 145, 37);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...grayColor);
      doc.text(`Clinical Indication: ${selectedClient.indication}`, 18, 45);
      doc.text(`Active Protocol: ${selectedClient.protocol}`, 80, 45);

      // Section 1: Clinical Adherence & Progress Summary
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('1. Treatment Adherence & Neuroplastic Metrics', 14, 60);

      // Metric Boxes
      const metrics = [
        { label: 'Completed Sessions', val: `${selectedClient.completedSessions}/${selectedClient.totalPrescribed}` },
        { label: 'Adherence Streak', val: `${selectedClient.streakDays} Days` },
        { label: 'Baseline Score', val: `${selectedClient.baselineScore}/100` },
        { label: 'Current Score', val: `${selectedClient.currentAvg}/100` },
        { label: 'Net Gain', val: `+${selectedClient.gainPercent}%` }
      ];

      metrics.forEach((m, idx) => {
        const x = 14 + idx * 36.8;
        doc.setFillColor(255, 255, 255);
        doc.rect(x, 65, 34, 18, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.rect(x, 65, 34, 18, 'S');

        doc.setFontSize(7.5);
        doc.setTextColor(...grayColor);
        doc.text(m.label, x + 2, 71);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(m.val, x + 2, 79);
      });

      // Section 2: Session-by-Session Historical Log
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. Historical Session Analytics Log', 14, 94);

      // Table Header
      doc.setFillColor(235, 240, 240);
      doc.rect(14, 98, 182, 8, 'F');
      doc.setFontSize(8.5);
      doc.setTextColor(...darkColor);
      doc.text('Session #', 18, 103.5);
      doc.text('Date', 45, 103.5);
      doc.text('Duration', 75, 103.5);
      doc.text('Focus Score', 105, 103.5);
      doc.text('Calm Score', 135, 103.5);
      doc.text('In-Zone Target %', 165, 103.5);

      const recent = selectedClient.recentSessions || [
        { sessionNumber: 14, date: 'Today', durationMin: 15, focusScore: 88, calmScore: 86 },
        { sessionNumber: 13, date: 'Yesterday', durationMin: 15, focusScore: 86, calmScore: 84 },
        { sessionNumber: 12, date: 'Aug 14', durationMin: 15, focusScore: 84, calmScore: 82 },
        { sessionNumber: 11, date: 'Aug 12', durationMin: 15, focusScore: 81, calmScore: 79 },
      ];

      recent.forEach((sess, idx) => {
        const y = 110 + idx * 7.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...darkColor);
        doc.text(`Session ${sess.sessionNumber}`, 18, y);
        doc.text(`${sess.date}`, 45, y);
        doc.text(`${sess.durationMin} min`, 75, y);
        doc.text(`${sess.focusScore}%`, 105, y);
        doc.text(`${sess.calmScore}%`, 135, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(`${Math.round((sess.focusScore + sess.calmScore) / 2)}% Target`, 165, y);

        doc.setDrawColor(240, 240, 240);
        doc.line(14, y + 2, 196, y + 2);
      });

      // Section 3: Quantitative EEG Power Distribution
      const qeegY = 150;
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('3. Quantitative EEG (QEEG) Spectral Power Distribution', 14, qeegY);

      const bands = [
        { name: 'Delta (0.5–4Hz)', val: '12%', status: 'Normal' },
        { name: 'Theta (4–8Hz)', val: '14%', status: 'Within Inhibit Band' },
        { name: 'Alpha (8–12Hz)', val: '48%', status: 'Optimal Coherence' },
        { name: 'Beta / SMR (12–30Hz)', val: '22%', status: 'SMR Stabilized' },
        { name: 'Gamma (30–45Hz)', val: '4%', status: 'Normal Flow' },
      ];

      bands.forEach((b, idx) => {
        const y = qeegY + 8 + idx * 6.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...darkColor);
        doc.text(`• ${b.name}:`, 18, y);
        doc.setFont('helvetica', 'bold');
        doc.text(b.val, 75, y);
        doc.setTextColor(...grayColor);
        doc.setFont('helvetica', 'italic');
        doc.text(b.status, 110, y);
      });

      // Section 4: Clinician Assessment & Prescription Guidance
      const assessY = 195;
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("4. Dr. Upasana Gala's Clinical Impression & Recommendation", 14, assessY);

      doc.setFillColor(...lightBg);
      doc.rect(14, assessY + 4, 182, 30, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(14, assessY + 4, 182, 30, 'S');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(...darkColor);
      const splitNote = doc.splitTextToSize(`"${selectedClient.doctorNote}"`, 174);
      doc.text(splitNote, 18, assessY + 12);

      // Signature Section
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...darkColor);
      doc.text('Supervising Clinician Signature:', 14, 250);
      doc.text('Dr. Upasana Gala, PhD, BCN, QEEG-D', 14, 260);
      doc.setFontSize(7.5);
      doc.setTextColor(...grayColor);
      doc.text('Founder & Managing Director · Evolve Brain Training LLC', 14, 264);

      // Official Stamp Seal Simulation
      doc.setDrawColor(...primaryColor);
      doc.circle(165, 255, 12, 'S');
      doc.setFontSize(6);
      doc.setTextColor(...primaryColor);
      doc.text('EVOLVE CLINIC', 154, 254);
      doc.text('VERIFIED QEEG', 153, 257);

      // Save PDF
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
                  onClick={() => {
                    onSelectClient(c.id);
                    setNoteText(c.doctorNote);
                    setThreshold(c.protocolSensitivity || 65);
                    setOrfHz(c.optimalResponseFrequencyHz || 0.005);
                  }}
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

        {/* Right: Sub-Tabs & Program Prescriber */}
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
              Pre-Populated Programs (1-Click)
            </button>
            <button
              onClick={() => setActiveSubTab('protocol')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'protocol'
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                  : 'bg-[#161616] border border-[#222222] text-[#888888] hover:text-[#EDEDED]'
              }`}
            >
              Custom ORF Calibration & Note
            </button>
            <button
              onClick={() => setActiveSubTab('brainmap')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'brainmap'
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                  : 'bg-[#161616] border border-[#222222] text-[#888888] hover:text-[#EDEDED]'
              }`}
            >
              QEEG Cortical Topography
            </button>
          </div>

          {/* TAB 1: Pre-Populated Programs */}
          {activeSubTab === 'programs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#EDEDED]">
                    Pre-Populated Clinical Programs for {selectedClient.name}
                  </h3>
                  <p className="text-xs text-[#888888]">
                    Click any program below to instantly configure this patient&apos;s therapy protocol, video modulation, and guidance note.
                  </p>
                </div>
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
              <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#EDEDED]">
                    Custom Protocol Calibration: {selectedClient.name} ({selectedClient.id})
                  </h3>
                  <p className="text-xs text-[#888888]">
                    Fine-tune individual Optimal Response Frequency (ORF), sensitivity, and duration.
                  </p>
                </div>
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

          {/* TAB 3: QEEG Brain Map */}
          {activeSubTab === 'brainmap' && (
            <BrainMapViewer 
              baselineScore={selectedClient.baselineScore}
              currentScore={selectedClient.currentAvg}
            />
          )}

        </div>

      </div>

    </div>
  );
}
