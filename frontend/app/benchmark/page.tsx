"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BenchmarkBars, type PipelineResult } from "@/components/BenchmarkBars";
import { EegTrace } from "@/components/EegTrace";
import { PipelineTooltip } from "@/components/PipelineTooltip";
import { SampleDetailModal } from "@/components/SampleDetailModal";

import { startDemoBenchmark, pollJobStatus } from "@/lib/api";

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

export default function BenchmarkPage() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeStepModal, setActiveStepModal] = useState<string | null>(null);

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    try {
      const demoResp = await startDemoBenchmark("BNCI2014_001");
      await pollJobStatus(demoResp.job_id);
      setIsRunning(false);
      setShowResults(true);
      router.push(`/results?jobId=${demoResp.job_id}`);
    } catch (err) {
      setIsRunning(false);
      router.push(`/results?jobId=demo-job-001`);
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="border-b border-border bg-surface/60 py-2 px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-xs text-text-secondary font-data">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>ACADEMIC RESEARCHER BENCHMARK ENGINE</span>
          </div>
          <span>OPEN SCIENTIFIC STANDARDS</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-16 md:pt-20 md:pb-24">
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
    </>
  );
}
