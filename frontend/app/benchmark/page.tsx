"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BenchmarkBars, type PipelineResult } from "@/components/BenchmarkBars";
import { EegTrace } from "@/components/EegTrace";
import { PipelineTooltip } from "@/components/PipelineTooltip";
import { SampleDetailModal } from "@/components/SampleDetailModal";
import {
  ResolutionRecoveryLeaderboard,
  type ResolutionRecoveryModel,
} from "@/components/ResolutionRecoveryLeaderboard";

import { startDemoBenchmark, pollJobStatus, isBackendOffline } from "@/lib/api";
import { OfflineBanner } from "@/components/OfflineBanner";

// Sample data — fallback when backend is offline
const SAMPLE_PIPELINES: PipelineResult[] = [
  { name: "CSP + LDA", accuracy: 78.2, ci: 3.1, auc: 0.84, aucCi: 0.03 },
  { name: "Riemannian MDM", accuracy: 81.4, ci: 2.8, auc: 0.87, aucCi: 0.02 },
  { name: "EEGNet", accuracy: 83.1, ci: 2.5, auc: 0.89, aucCi: 0.02 },
];

const PIPELINE_DESCRIPTIONS: Record<string, string> = {
  "CSP + LDA": "Extracts spatial patterns that maximize variance between classes.",
  "Riemannian MDM": "Classifies EEG covariance matrices using geometric distances.",
  "EEGNet": "Compact convolutional neural network designed for EEG signals.",
};

// Resolution Recovery baseline leaderboard data
const RESOLUTION_RECOVERY_MODELS: ResolutionRecoveryModel[] = [
  {
    name: "Linear Regression",
    correlationR: 0.42,
    rmseUv: 18.7,
    snrImprovementDb: 1.2,
    paramCount: 160,
    description: "Channel-to-channel multivariate linear mapping.",
    provenance: "computed_synthetic",
  },
  {
    name: "CNN Autoencoder (U-Net)",
    correlationR: 0.68,
    rmseUv: 11.3,
    snrImprovementDb: 4.8,
    paramCount: 50000,
    description: "Small 1D U-Net-style encoder-decoder with skip connections.",
    provenance: "placeholder_precomputed",
  },
];

export default function BenchmarkPage() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeStepModal, setActiveStepModal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<"mi" | "gait" | "resolution">("mi");

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const demoResp = await startDemoBenchmark("BNCI2014_001");
      const statusResp = await pollJobStatus(demoResp.job_id);
      if (statusResp.status === "error") {
        throw new Error(statusResp.error || "Benchmark failed on the backend.");
      }
      setIsRunning(false);
      setShowResults(true);
      router.push(`/results?jobId=${demoResp.job_id}`);
    } catch (err) {
      setIsRunning(false);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the benchmark backend. Please check your connection and try again."
      );
    }
  };

  return (
    <>
      {/* Offline / Error banners */}
      {isBackendOffline() && (
        <OfflineBanner message="Backend is currently unreachable. Benchmark execution requires a live backend connection." />
      )}

      {error && (
        <div className="bg-red-50 border-b border-red-200 py-3 px-6">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-red-800">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="font-medium">Benchmark Error:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => { setError(null); handleRunBenchmark(); }}
              className="text-xs font-semibold text-red-700 hover:text-red-900 px-3 py-1 rounded border border-red-300 hover:bg-red-100 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar />

      {/* Top Banner */}
      <div className="border-b border-border bg-surface/60 py-2 px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-xs text-text-secondary font-data">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>ACADEMIC RESEARCHER BENCHMARK ENGINE</span>
          </div>
          <span>POWERED BY BNIADAM AI RESEARCH LAB</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-16 md:pt-16 md:pb-24">
          {/* Track Selection Tabs */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setActiveTrack("mi")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all font-data ${
                activeTrack === "mi"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-surface text-text-secondary hover:text-text-primary border border-border"
              }`}
            >
              Motor Imagery Track
            </button>
            <button
              onClick={() => setActiveTrack("gait")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all font-data flex items-center gap-2 ${
                activeTrack === "gait"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-surface text-text-secondary hover:text-text-primary border border-border"
              }`}
            >
              <span>Mobility & Gait Decoding</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold uppercase">
                In Progress
              </span>
            </button>
            <button
              onClick={() => setActiveTrack("resolution")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all font-data flex items-center gap-2 ${
                activeTrack === "resolution"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-surface text-text-secondary hover:text-text-primary border border-border"
              }`}
            >
              <span>Resolution Recovery</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[9px] font-bold uppercase">
                New
              </span>
            </button>
          </div>

          {activeTrack === "resolution" ? (
            <div className="max-w-3xl">
              {/* Track Title */}
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-light tracking-tight leading-tight text-text-primary">
                Resolution Recovery
                <br />
                Benchmark
              </h1>

              <p className="mt-4 text-lg text-text-secondary max-w-xl">
                Recovering high-resolution neural structure from low-resolution sensors.
              </p>

              {/* Task Definition */}
              <div className="mt-8 p-6 rounded-2xl bg-white border border-border">
                <div className="flex items-center gap-2 text-xs font-data text-text-secondary mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="tracking-wider">TASK DEFINITION</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-[10px] font-data text-text-secondary mb-2 tracking-wider">INPUT</div>
                    <p className="text-text-primary font-medium">Low-resolution / Broad-coverage Signal</p>
                    <p className="text-xs text-text-secondary mt-1">e.g. 19-channel scalp EEG (10-20 montage)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-border flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 text-accent mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[10px] font-data text-text-secondary">MODEL PREDICTS</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-[10px] font-data text-text-secondary mb-2 tracking-wider">OUTPUT</div>
                    <p className="text-text-primary font-medium">High-resolution / Narrow-coverage Signal</p>
                    <p className="text-xs text-text-secondary mt-1">e.g. intracranial EEG or MEG-like detail</p>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 font-data leading-relaxed">
                  <strong>Evaluation:</strong> Predicted high-res output is scored against ground-truth paired recordings using signal reconstruction fidelity metrics — not classification accuracy.
                </div>
              </div>

              {/* Metrics Explanation */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    metric: "Correlation (r)",
                    desc: "Pearson correlation between predicted and ground-truth signals, averaged across channels. Higher is better.",
                    icon: "📈",
                  },
                  {
                    metric: "RMSE (μV)",
                    desc: "Root mean square error between predicted and ground-truth signals. Lower is better.",
                    icon: "📐",
                  },
                  {
                    metric: "SNR Gain (dB)",
                    desc: "Signal-to-noise ratio improvement over naive baseline (dB). Positive means better than identity mapping.",
                    icon: "📊",
                  },
                ].map((m) => (
                  <div key={m.metric} className="p-4 rounded-xl bg-white border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{m.icon}</span>
                      <span className="text-xs font-semibold text-text-primary font-data">{m.metric}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>

              {/* Leaderboard */}
              <div className="mt-8">
                <ResolutionRecoveryLeaderboard
                  models={RESOLUTION_RECOVERY_MODELS}
                  animate={true}
                  datasetLabel="Placeholder — Synthetic Paired Data"
                />
              </div>

              {/* Data Spec Note */}
              <div className="mt-6 p-4 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-2 text-xs font-data text-text-secondary mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="tracking-wider">PAIRED DATA SPECIFICATION</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  This track requires paired recordings: two time-aligned arrays <code className="font-data text-text-primary bg-white px-1 py-0.5 rounded border border-border">(broad, narrow)</code> per session.
                  Input and target signals must share the same sampling rate and temporal alignment.
                </p>
                <p className="text-xs text-text-secondary leading-relaxed mt-2">
                  <strong>Integration roadmap:</strong> Simultaneous EEG+MEG recordings (e.g. HCP dataset),
                  simultaneous scalp EEG + intracranial EEG (e.g. Fedele et al. 2017),
                  and EEG+ECoG from epilepsy monitoring (e.g. iEEG.org).
                </p>
              </div>

              {/* Back button */}
              <button
                onClick={() => setActiveTrack("mi")}
                className="mt-6 btn btn-outline text-xs font-medium px-4 py-2"
              >
                ← Return to Motor Imagery Benchmark
              </button>
            </div>
          ) : activeTrack === "gait" ? (
            <div className="p-8 rounded-2xl bg-white border border-border max-w-2xl">
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs font-data mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Dataset Integration in Active Development</span>
              </div>
              <h2 className="text-2xl font-light text-text-primary">
                Mobility-State & Gait Decoding Track
              </h2>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                This track evaluates locomotion state classification (sit vs. stand vs. walking phase) from continuous electrophysiology, central to adaptive-DBS gait research for movement disorders.
              </p>
              <p className="mt-3 text-xs text-text-secondary font-data">
                BIDS-formatted walking datasets from OpenNeuro and EEG-Dash are currently being integrated into MNE pipeline loaders. In accordance with strict EEG-Bench data policies, no placeholder data is shown.
              </p>
              <button
                onClick={() => setActiveTrack("mi")}
                className="mt-6 btn btn-outline text-xs font-medium px-4 py-2"
              >
                ← Return to Motor Imagery Benchmark
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 items-start">
              {/* Left: content */}
              <div>
                {/* Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-light tracking-tight leading-tight text-text-primary">
                  Motor Imagery
                  <br />
                  Academic Benchmark
                </h1>

              <p className="mt-4 text-lg text-text-secondary max-w-lg">
                Three pipelines. One click. Reproducible scientific results.
              </p>

              {/* Pipeline one-liners */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {SAMPLE_PIPELINES.map((p) => (
                  <PipelineTooltip
                    key={p.name}
                    name={p.name}
                    description={PIPELINE_DESCRIPTIONS[p.name]}
                  >
                    <span className="text-sm text-text-secondary hover:text-accent cursor-pointer transition-colors font-medium">
                      {p.name}
                    </span>
                  </PipelineTooltip>
                ))}
              </div>

              {/* Benchmark bars */}
              <div className="mt-10 max-w-xl">
                <BenchmarkBars pipelines={SAMPLE_PIPELINES} animate={showResults} />
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
                <button
                  onClick={handleRunBenchmark}
                  disabled={isRunning}
                  className="btn btn-primary text-base px-6 py-3 disabled:opacity-60"
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      Running...
                    </span>
                  ) : showResults ? (
                    "View Results →"
                  ) : (
                    "Run Academic Benchmark"
                  )}
                </button>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-text-secondary">
                    Pre-loaded dataset · No upload needed · Results in ~45 seconds
                  </p>
                  <Link
                    href="/wizard"
                    className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
                  >
                    Use your own data →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: EEG trace */}
            <div className="hidden lg:block h-80 opacity-60">
              <EegTrace channels={5} />
            </div>
          </div>
        )}
      </div>
    </section>

      {/* How it works — brief */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-light tracking-tight text-text-primary text-center">
            How it works
          </h2>
          <p className="text-center text-xs text-text-secondary mt-1 mb-8">
            Click any step card to preview sample workflow data
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                id: "step1",
                title: "Choose data",
                desc: "Use a pre-loaded MOABB dataset or upload your own EDF/BDF file.",
              },
              {
                step: "2",
                id: "step2",
                title: "Run pipelines",
                desc: "CSP+LDA, Riemannian MDM, and EEGNet run with MOABB's within-session cross-validation.",
              },
              {
                step: "3",
                id: "step3",
                title: "Get results",
                desc: "Accuracy, AUC, per-subject breakdown, MOABB comparison, and a reproducible script.",
              },
            ].map((item) => (
              <div
                key={item.step}
                onClick={() => setActiveStepModal(item.id)}
                className="card p-6 flex flex-col items-center text-center cursor-pointer hover:border-accent/40 transition-all hover:shadow-md group"
              >
                <span className="font-data text-3xl text-accent font-light group-hover:scale-110 transition-transform">
                  {item.step}
                </span>
                <h3 className="mt-3 text-base font-medium text-text-primary group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-xs">
                  {item.desc}
                </p>
                <span className="mt-4 text-xs text-accent font-medium opacity-80 group-hover:opacity-100">
                  Inspect Step {item.step} →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Step Modals */}
      <SampleDetailModal
        isOpen={activeStepModal === "step1"}
        onClose={() => setActiveStepModal(null)}
        title="Step 1: Dataset & File Support"
        subtitle="Pre-loaded MOABB datasets or custom EDF/BDF file upload."
        badge="Data Pipeline"
        actionText="Configure Custom Data in Wizard"
        onAction={() => router.push("/wizard")}
      >
        <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs font-data">
          <p><strong>Supported Datasets:</strong> BNCI2014_001, Cho2017, Lee2019_MI</p>
          <p><strong>Supported Formats:</strong> .edf, .bdf, BrainVision (.vhdr/.vmrk/.eeg)</p>
          <p><strong>Montage Support:</strong> Standard 10-20, Standard 10-10, BioSemi 64</p>
        </div>
      </SampleDetailModal>

      <SampleDetailModal
        isOpen={activeStepModal === "step2"}
        onClose={() => setActiveStepModal(null)}
        title="Step 2: Standardized Benchmark Execution"
        subtitle="Execution of 3 state-of-the-art BCI classification pipelines."
        badge="Standard Pipelines"
      >
        <div className="p-4 bg-surface rounded-xl border border-border space-y-3 text-xs">
          <p><strong>1. CSP + LDA:</strong> Common Spatial Patterns (8 filters) + Linear Discriminant Analysis</p>
          <p><strong>2. Riemannian MDM:</strong> Covariances estimation + Minimum Distance to Mean on Riemannian manifold</p>
          <p><strong>3. EEGNet:</strong> Compact 2D convolutional neural network (Braindecode PyTorch execution)</p>
        </div>
      </SampleDetailModal>

      <SampleDetailModal
        isOpen={activeStepModal === "step3"}
        onClose={() => setActiveStepModal(null)}
        title="Step 3: Reproducible Results & Export"
        subtitle="Full statistical analysis, subject tables, and downloadable Python reproduction scripts."
        badge="Results & Code"
        actionText="View Demo Results Page"
        onAction={() => router.push("/results?jobId=demo-job-001")}
      >
        <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs font-data">
          <p><strong>Mean Accuracy:</strong> CSP+LDA (78.2%), Riemannian MDM (81.4%), EEGNet (83.1%)</p>
          <p><strong>MOABB Cross-Validation:</strong> 5-fold within-session per subject</p>
          <p><strong>Export:</strong> 1-click Python reproduction script generation</p>
        </div>
      </SampleDetailModal>
      <Footer />
    </>
  );
}
