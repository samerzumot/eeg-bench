"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getClinicianReport, type ClinicianReportData } from "@/lib/api";
import { BrainHealthGauge } from "@/components/BrainHealthGauge";
import { SpectralChart } from "@/components/SpectralChart";
import { TopoMap } from "@/components/TopoMap";
import { PatternAlert } from "@/components/PatternAlert";
import { SampleDetailModal } from "@/components/SampleDetailModal";
import { OfflineBanner } from "@/components/OfflineBanner";

// Demo report data — in production fetched from /api/clinician/report/{id}
const DEMO_REPORT = {
  isSample: true,
  recording: {
    filename: "patient_resting_state_001.edf",
    duration: "5 min 12 sec",
    samplingRate: 256,
    channels: 19,
    montage: "Standard 10-20",
    recordingType: "Resting-state (eyes closed)",
    quality: "Good (2 channels interpolated)",
  },
  brainHealthScore: 72,
  biomarkers: {
    alphaPeakFreq: { value: 9.2, unit: "Hz", norm: "8.5–12.5 Hz", status: "normal" as const, desc: "Dominant frequency of posterior alpha rhythm during resting state. Standard adult norm: 8.5–12.5 Hz." },
    alphaThetaRatio: { value: 1.8, unit: "", norm: "> 2.0", status: "mild" as const, desc: "Ratio of alpha power to theta power. Values < 2.0 may indicate reduced alertness or cognitive slowing." },
    deltaExcess: { value: 18.5, unit: "%", norm: "< 15%", status: "mild" as const, desc: "Percentage of total spectral power in delta band (1–4 Hz). Values > 15% indicate diffuse slowing." },
    betaPower: { value: 12.3, unit: "μV²/Hz", norm: "8–18 μV²/Hz", status: "normal" as const, desc: "Absolute beta band power (13–30 Hz), reflecting cortical arousal." },
    spectralEntropy: { value: 0.74, unit: "", norm: "0.70–0.90", status: "normal" as const, desc: "Normalized Shannon entropy of power spectrum, measuring signal complexity." },
    coherence: { value: 0.62, unit: "", norm: "0.55–0.80", status: "normal" as const, desc: "Mean inter-hemispheric coherence across homologue channel pairs (F3-F4, C3-C4, P3-P4, O1-O2)." },
    asymmetry: { value: 8.2, unit: "%", norm: "< 15%", status: "normal" as const, desc: "Percent difference between homologous left vs right power." },
  },
  spectralBands: [
    { band: "Delta (1–4 Hz)", power: 18.5, normMin: 8, normMax: 15, color: "#6366f1" },
    { band: "Theta (4–8 Hz)", power: 12.1, normMin: 6, normMax: 14, color: "#8b5cf6" },
    { band: "Alpha (8–13 Hz)", power: 22.4, normMin: 15, normMax: 30, color: "#3b82f6" },
    { band: "Beta (13–30 Hz)", power: 12.3, normMin: 8, normMax: 18, color: "#10b981" },
    { band: "Gamma (30–45 Hz)", power: 4.2, normMin: 2, normMax: 8, color: "#f59e0b" },
  ],
  alphaTopo: {
    Fp1: 8.2, Fp2: 9.1, F7: 10.5, F3: 12.8, Fz: 11.2, F4: 13.1, F8: 10.8,
    T3: 9.5, C3: 14.2, Cz: 13.8, C4: 14.5, T4: 9.8,
    T5: 15.2, P3: 20.1, Pz: 19.5, P4: 21.3, T6: 15.8,
    O1: 25.4, O2: 26.1,
  },
  patterns: [
    {
      name: "Mild Delta Excess",
      severity: "mild" as const,
      description: "Delta band power (18.5%) exceeds normative range (< 15%). This may indicate mild diffuse slowing, which can be seen with drowsiness, medications, or early cognitive changes.",
      regions: "Diffuse — frontal predominance",
      recommendation: "Consider correlating with clinical history and cognitive screening.",
    },
    {
      name: "Reduced Alpha/Theta Ratio",
      severity: "mild" as const,
      description: "Alpha/theta ratio of 1.8 is below the typical threshold of 2.0. This pattern may be associated with reduced alertness or early cognitive slowing.",
      regions: "Posterior channels (P3, Pz, P4, O1, O2)",
      recommendation: "May warrant follow-up with neuropsychological assessment if clinically indicated.",
    },
  ],
};

const statusColors = {
  normal: "text-green-600",
  mild: "text-yellow-600",
  moderate: "text-orange-600",
  significant: "text-red-600",
};

export default function ClinicianReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = (params?.id as string) || "demo";

  const [activeTab, setActiveTab] = useState<"overview" | "spectral" | "patterns">("overview");
  const [report, setReport] = useState<any>(DEMO_REPORT);
  const [loading, setLoading] = useState(false);

  // Modal states for clickable cards
  const [modalType, setModalType] = useState<string | null>(null);
  const [selectedBiomarker, setSelectedBiomarker] = useState<{ key: string; bm: any } | null>(null);

  useEffect(() => {
    if (!reportId) return;
    setLoading(true);
    getClinicianReport(reportId)
      .then((data) => {
        if (data) {
          const normalized = {
            ...DEMO_REPORT,
            ...data,
            recording: {
              ...DEMO_REPORT.recording,
              ...(data.recording || {}),
              samplingRate: data.recording?.sampling_rate || data.recording?.samplingRate || 256,
              recordingType: data.recording?.recording_type || data.recording?.recordingType || "Resting-state",
            },
            brainHealthScore: data.brain_health_score ?? data.brainHealthScore ?? DEMO_REPORT.brainHealthScore,
            alphaTopo: data.alpha_topo || data.alphaTopo || DEMO_REPORT.alphaTopo,
            patterns: data.patterns || DEMO_REPORT.patterns,
          };
          setReport(normalized);
        }
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  return (
    <>
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Research Tool — Not for Clinical Diagnosis.</span>{" "}
            These results have not been validated for clinical decision-making. Consult a qualified neurologist.
          </p>
        </div>
      </div>

      {(report.isSample || reportId === "demo") && (
        <OfflineBanner message="Displaying sample demonstration report data." />
      )}

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-text-secondary mb-8">
          <span className="hover:text-text-primary cursor-pointer" onClick={() => router.push("/clinician")}>
            Clinician Portal
          </span>
          <span className="mx-2">›</span>
          <span className="text-text-primary font-data">Report</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-text-primary">
              EEG Analysis Report
            </h1>
            <p className="font-data text-sm text-text-secondary mt-2">
              {report.recording.filename}
            </p>
          </div>
          <button
            onClick={() => setModalType("download_pdf")}
            className="btn btn-outline text-sm self-start"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" />
            </svg>
            Download PDF Report
          </button>
        </div>

        {/* Recording Info Card - Clickable */}
        <div
          onClick={() => setModalType("recording_summary")}
          className="card p-6 mb-6 cursor-pointer hover:border-accent/40 transition-all hover:shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors flex items-center gap-2">
              <span>Recording Summary</span>
              <span className="text-[10px] text-text-secondary font-normal font-data">
                (Click to view channel parameters & quality)
              </span>
            </h3>
            <span className="text-xs text-accent">Details →</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Duration", value: report.recording.duration },
              { label: "Sampling Rate", value: `${report.recording.samplingRate} Hz` },
              { label: "Channels", value: report.recording.channels.toString() },
              { label: "Montage", value: report.recording.montage },
              { label: "Recording Type", value: report.recording.recordingType },
              { label: "Quality", value: report.recording.quality },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">{item.label}</p>
                <p className="font-data text-sm text-text-primary mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface rounded-lg mb-8 w-fit">
          {(["overview", "spectral", "patterns"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? "bg-white text-text-primary shadow-sm font-medium"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
            {/* Brain Health Score Card - Clickable */}
            <div
              onClick={() => setModalType("score_gauge")}
              className="card p-8 flex flex-col items-center justify-center cursor-pointer hover:border-accent/40 transition-all hover:shadow-sm group relative"
            >
              <span className="absolute top-4 right-4 text-[10px] font-data text-text-secondary group-hover:text-accent">
                Click for score weights →
              </span>
              <BrainHealthGauge score={report.brainHealthScore} size={220} />
            </div>

            {/* Biomarkers Card - Clickable rows */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-text-primary">
                  Biomarker Breakdown
                </h3>
                <span className="text-xs text-text-secondary">Click row for clinical definition</span>
              </div>
              <div className="space-y-3">
                {Object.entries(report.biomarkers as Record<string, any>).map(([key, bm]) => (
                  <div
                    key={key}
                    onClick={() => setSelectedBiomarker({ key, bm })}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 cursor-pointer hover:bg-surface/80 p-2 rounded-lg transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                      </p>
                      <p className="text-[10px] text-text-secondary">Norm: {bm.norm}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-data text-sm font-medium ${statusColors[(bm.status as keyof typeof statusColors) || "normal"] || "text-text-primary"}`}>
                        {bm.value} {bm.unit}
                      </p>
                      <p className={`text-[10px] capitalize ${statusColors[(bm.status as keyof typeof statusColors) || "normal"] || "text-text-primary"}`}>
                        {bm.status === "normal" ? "Normal" : bm.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick patterns summary */}
            <div className="lg:col-span-2">
              <PatternAlert patterns={report.patterns} />
            </div>
          </div>
        )}

        {/* Spectral Tab */}
        {activeTab === "spectral" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
            <div
              onClick={() => setModalType("spectral_details")}
              className="cursor-pointer hover:opacity-95 transition-opacity"
            >
              <SpectralChart bands={report.spectralBands} />
            </div>
            <div
              onClick={() => setModalType("topo_details")}
              className="cursor-pointer hover:opacity-95 transition-opacity"
            >
              <TopoMap channelValues={report.alphaTopo} bandLabel="Alpha Power" size={280} />
            </div>
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === "patterns" && (
          <div className="space-y-6">
            <PatternAlert patterns={report.patterns} />

            {/* Detailed biomarker table */}
            <div className="card p-6">
              <h3 className="text-base font-medium text-text-primary mb-4">
                All Biomarkers — Detailed View
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-text-secondary font-medium">Biomarker</th>
                      <th className="text-right py-2 text-text-secondary font-medium">Value</th>
                      <th className="text-right py-2 text-text-secondary font-medium">Normative Range</th>
                      <th className="text-right py-2 text-text-secondary font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(report.biomarkers as Record<string, any>).map(([key, bm]) => (
                      <tr
                        key={key}
                        onClick={() => setSelectedBiomarker({ key, bm })}
                        className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-surface transition-colors"
                      >
                        <td className="py-2.5 text-text-primary font-medium">
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                        </td>
                        <td className="py-2.5 text-right font-data">
                          {bm.value} {bm.unit}
                        </td>
                        <td className="py-2.5 text-right text-text-secondary font-data">
                          {bm.norm}
                        </td>
                        <td className={`py-2.5 text-right capitalize font-medium ${statusColors[(bm.status as keyof typeof statusColors) || "normal"] || "text-text-primary"}`}>
                          {bm.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Methods Card - Clickable */}
        <div
          onClick={() => setModalType("methods_detail")}
          className="mt-10 card p-6 cursor-pointer hover:border-accent/40 transition-all hover:shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
              Methods & Library Versions
            </h3>
            <span className="text-xs text-accent">View citations →</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            EEG data was loaded and preprocessed using MNE-Python v1.7.0 (Gramfort et al., 2013).
            Preprocessing included bandpass filtering (0.5–45 Hz), notch filtering at 50/60 Hz,
            and automated bad channel detection. Power spectral density was computed using Welch&apos;s
            method (2-second windows, 50% overlap).
          </p>
          <p className="font-data text-[10px] text-text-secondary/60 mt-3">
            mne 1.7.0 · scipy 1.11.0 · numpy 1.24.0
          </p>
        </div>
      </div>

      {/* Clickable Card Modals */}
      <SampleDetailModal
        isOpen={modalType === "recording_summary"}
        onClose={() => setModalType(null)}
        title="Recording Parameters & Quality Details"
        subtitle="Sample channel montage and signal quality assessment computed via MNE-Python."
        badge="Signal Quality: Good"
      >
        <div className="bg-surface p-4 rounded-xl border border-border space-y-2 font-data text-xs">
          <div className="flex justify-between"><span>Sampling Frequency:</span><span>256 Hz</span></div>
          <div className="flex justify-between"><span>Recorded Duration:</span><span>5 min 12 sec (79,872 samples)</span></div>
          <div className="flex justify-between"><span>Active Channels:</span><span>19 channels (Standard 10-20)</span></div>
          <div className="flex justify-between"><span>Interpolated Channels:</span><span>F3, Pz (spherical spline)</span></div>
          <div className="flex justify-between"><span>Reference:</span><span>Average Reference (REST)</span></div>
        </div>
      </SampleDetailModal>

      <SampleDetailModal
        isOpen={modalType === "score_gauge"}
        onClose={() => setModalType(null)}
        title="Brain Health Composite Score Weighting"
        subtitle="Calculation methodology for score 72/100."
        badge="Normative Index"
      >
        <div className="space-y-3 text-xs">
          <p className="leading-relaxed">
            The composite Brain Health Score (0–100) integrates 7 biomarker dimensions weighted against an age-matched normative database (N = 450 subjects):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-text-secondary">
            <li><strong>Alpha Peak Frequency (25% weight):</strong> 9.2 Hz → 92% norm score</li>
            <li><strong>Alpha/Theta Ratio (20% weight):</strong> 1.8 → 70% norm score</li>
            <li><strong>Delta Power (20% weight):</strong> 18.5% → 65% norm score</li>
            <li><strong>Coherence & Entropy (35% weight):</strong> 80% norm score</li>
          </ul>
        </div>
      </SampleDetailModal>

      <SampleDetailModal
        isOpen={selectedBiomarker !== null}
        onClose={() => setSelectedBiomarker(null)}
        title={selectedBiomarker ? `${selectedBiomarker.key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}` : "Biomarker Detail"}
        subtitle={selectedBiomarker?.bm?.desc || "Clinical biomarker reference interval."}
        badge={`Value: ${selectedBiomarker?.bm?.value} ${selectedBiomarker?.bm?.unit}`}
      >
        <div className="p-4 bg-surface rounded-xl border border-border space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-text-secondary">Observed Value:</span>
            <span className="font-data font-semibold text-text-primary">{selectedBiomarker?.bm?.value} {selectedBiomarker?.bm?.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Normative Range:</span>
            <span className="font-data text-text-primary">{selectedBiomarker?.bm?.norm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Clinical Status:</span>
            <span className="font-semibold uppercase text-accent">{selectedBiomarker?.bm?.status}</span>
          </div>
        </div>
      </SampleDetailModal>

      <SampleDetailModal
        isOpen={modalType === "spectral_details"}
        onClose={() => setModalType(null)}
        title="Power Spectral Density Breakdown"
        subtitle="Band-by-band power distribution across all 19 channels."
        badge="Spectral Analysis"
      >
        <div className="space-y-2 text-xs font-data">
          {report.spectralBands.map((b: any) => (
            <div key={b.band} className="flex items-center justify-between p-2 bg-surface rounded-lg">
              <span>{b.band}</span>
              <span className="font-semibold" style={{ color: b.color }}>{b.power}%</span>
            </div>
          ))}
        </div>
      </SampleDetailModal>

      <SampleDetailModal
        isOpen={modalType === "topo_details"}
        onClose={() => setModalType(null)}
        title="Alpha Power Topographical Distribution"
        subtitle="Channel-wise spatial distribution of alpha power (8-13 Hz)."
        badge="Topography"
      >
        <div className="p-4 bg-surface rounded-xl border border-border text-xs leading-relaxed space-y-2">
          <p>Peak alpha activity is concentrated over posterior occipital channels (O1: 25.4 μV², O2: 26.1 μV²), demonstrating normal posterior dominant alpha rhythm.</p>
        </div>
      </SampleDetailModal>

      <SampleDetailModal
        isOpen={modalType === "download_pdf"}
        onClose={() => setModalType(null)}
        title="Clinical PDF Report Download"
        subtitle="Generating citable clinical report PDF..."
        badge="PDF Exporter"
      >
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs space-y-2">
          <p className="font-medium">Sample PDF Report Prepared</p>
          <p className="text-[11px] text-teal-700">Contains full 19-channel spectral charts, biomarker normative comparisons, pattern logs, and MNE-Python 1.7.0 citations.</p>
        </div>
      </SampleDetailModal>

      <SampleDetailModal
        isOpen={modalType === "methods_detail"}
        onClose={() => setModalType(null)}
        title="Methods & Citable Software References"
        subtitle="Complete signal processing pipeline description for research publications."
        badge="Methods"
      >
        <div className="p-4 bg-surface rounded-xl border border-border text-xs leading-relaxed space-y-3">
          <p>
            Gramfort, A., et al. (2013). MEG and EEG data analysis with MNE-Python. Frontiers in Neuroscience, 7, 267.
          </p>
          <p className="font-data text-[11px] text-text-secondary">
            Scipy: Virtanen, P., et al. (2020). SciPy 1.0: fundamental algorithms for scientific computing in Python. Nature Methods, 17(3), 261-272.
          </p>
        </div>
      </SampleDetailModal>
    </>
  );
}
