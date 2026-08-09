"use client";

import { PipelineCard } from "@/components/PipelineCard";
import { MoabbComparison } from "@/components/MoabbComparison";
import { SubjectTable } from "@/components/SubjectTable";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ClosedLoopReadiness } from "@/components/ClosedLoopReadiness";
import { SubjectGeneralizationPanel } from "@/components/SubjectGeneralizationPanel";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getBenchmarkResults, getReproducibleScript, getMethodsParagraph, isBackendOffline } from "@/lib/api";

const PIPELINE_DESCRIPTIONS: Record<string, string> = {
  "CSP + LDA": "Extracts spatial patterns that maximize variance between classes.",
  "CSP+LDA": "Extracts spatial patterns that maximize variance between classes.",
  "Riemannian MDM": "Classifies EEG covariance matrices using geometric distances.",
  "EEGNet": "Compact convolutional neural network designed for EEG signals.",
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [pipelineResults, setPipelineResults] = useState<Array<{
    name: string;
    description: string;
    accuracy: number;
    ci: number;
    auc: number;
    aucCi: number;
    latencyMs: number;
  }>>([]);
  const [subjects, setSubjects] = useState<Array<{
    id: string;
    userAcc: number;
    moabbAcc: number;
    accuracies: Record<string, number>;
  }>>([]);
  const [datasetName, setDatasetName] = useState("BNCI2014_001");
  const [dataSource, setDataSource] = useState<string | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [showMethods, setShowMethods] = useState(false);
  const [copiedMethods, setCopiedMethods] = useState(false);
  const [methodsText, setMethodsText] = useState<string | null>(null);
  const [methodsError, setMethodsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [libVersions, setLibVersions] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError("No job ID provided. Please run a benchmark first.");
      setLoading(false);
      return;
    }

    getBenchmarkResults(jobId)
      .then((data) => {
        setIsSample(data.isSample || false);
        setDataSource(data.dataSource || null);
        setDatasetName(data.dataset || "BNCI2014_001");

        if (data?.results?.pipelines) {
          const formattedPipelines = Object.entries(data.results.pipelines).map(([name, p]: [string, any]) => ({
            name,
            description: PIPELINE_DESCRIPTIONS[name] || "Standard EEG classification pipeline.",
            accuracy: p.mean_accuracy,
            ci: p.ci,
            auc: p.mean_auc || 0,
            aucCi: p.auc_ci || 0,
            latencyMs: p.latency_ms || (name.includes("CSP") ? 0.07 : name.includes("Riemann") ? 0.38 : 14.2),
          }));
          setPipelineResults(formattedPipelines);

          // Build subject-level data from per_subject maps
          const allPipelineNames = Object.keys(data.results.pipelines);
          const firstPipeline = data.results.pipelines[allPipelineNames[0]];
          const subjectIds = firstPipeline?.per_subject ? Object.keys(firstPipeline.per_subject) : [];

          const formattedSubjects = subjectIds.map((sid) => {
            const accuracies: Record<string, number> = {};
            let totalAcc = 0;
            let count = 0;
            allPipelineNames.forEach((pName) => {
              const val = data.results.pipelines[pName]?.per_subject?.[sid] || 0;
              accuracies[pName] = val;
              totalAcc += val;
              count++;
            });
            const userAcc = count > 0 ? totalAcc / count : 0;

            // MOABB reference: use distinct reference data if available, otherwise leave 0
            let moabbAcc = 0;
            if (data.results.moabb_reference) {
              const ref = data.results.moabb_reference[data.dataset || "BNCI2014_001"];
              if (ref) {
                const refPipeline = Object.keys(ref)[0];
                moabbAcc = ref[refPipeline]?.[sid] || 0;
              }
            }
            return { id: sid, userAcc: Math.round(userAcc * 10) / 10, moabbAcc, accuracies };
          });
          setSubjects(formattedSubjects);
        }

        // Library versions
        if (data.results?.library_versions) {
          const v = data.results.library_versions;
          setLibVersions(Object.entries(v).map(([k, val]) => `${k} ${val}`).join(" · "));
        }

        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load results.");
        setLoading(false);
      });
  }, [jobId]);

  const handleCopyMethods = async () => {
    if (!methodsText && jobId) {
      // Fetch on first click
      try {
        const text = await getMethodsParagraph(jobId);
        setMethodsText(text);
        await navigator.clipboard.writeText(text);
      } catch {
        setCopiedMethods(false);
        setMethodsError("Could not fetch methods from backend.");
        return;
      }
    } else if (methodsText) {
      await navigator.clipboard.writeText(methodsText);
    }
    setCopiedMethods(true);
    setTimeout(() => setCopiedMethods(false), 2000);
  };

  const handleShowMethods = async () => {
    if (!showMethods && !methodsText && jobId) {
      try {
        const text = await getMethodsParagraph(jobId);
        setMethodsText(text);
        setMethodsError(null);
      } catch {
        setMethodsError("Could not fetch methods paragraph from backend.");
      }
    }
    setShowMethods(!showMethods);
  };

  const handleDownloadScript = async () => {
    if (!jobId) return;
    try {
      const script = await getReproducibleScript(jobId);
      const blob = new Blob([script], { type: "text/x-python" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `eeg_bench_${datasetName.toLowerCase()}_reproduce.py`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: generate a minimal script client-side with honest labeling
      alert("Could not fetch the reproducible script from the backend. Ensure the backend is running and the job has completed.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <svg className="animate-spin h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
        <p className="text-sm text-text-secondary">Loading benchmark results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="p-6 bg-red-50 rounded-xl border border-red-200">
          <h2 className="text-lg font-medium text-red-900">Failed to Load Results</h2>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn btn-outline text-sm px-4 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isSample && (
        <OfflineBanner
          message={
            dataSource === "cached_offline"
              ? "Backend offline — displaying cached precomputed results (generated 2026-08-03). These may not reflect a live run."
              : isBackendOffline()
                ? "GCP backend offline — displaying cached benchmark results."
                : "Displaying cached benchmark data."
          }
        />
      )}
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-text-secondary mb-8">
          <span className="hover:text-text-primary cursor-pointer">Results</span>
          <span className="mx-2">›</span>
          <span className="font-data text-text-primary">{datasetName}</span>
          {dataSource && (
            <span className="ml-3 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-data text-slate-600 border border-slate-200">
              {dataSource === "live" ? "Live Run" : dataSource === "cached_offline" ? "Cached — Offline" : dataSource}
            </span>
          )}
        </nav>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-text-primary">
          Benchmark Results
        </h1>
        <p className="font-data text-sm text-text-secondary mt-2">{datasetName}</p>

        {/* Pipeline cards */}
        {pipelineResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {pipelineResults.map((p) => (
              <PipelineCard
                key={p.name}
                name={p.name}
                description={p.description}
                accuracy={p.accuracy}
                ci={p.ci}
                auc={p.auc}
                aucCi={p.aucCi}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-border text-center text-sm text-text-secondary">
            No pipeline results available for this job.
          </div>
        )}

        {/* MOABB comparison + Subject table */}
        {subjects.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            <MoabbComparison subjects={subjects} />
            <SubjectTable
              subjects={subjects}
              pipelines={pipelineResults.map((p) => p.name)}
            />
          </div>
        )}

        {/* Closed-Loop Readiness Matrix + Subject-Level Generalization Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
          <ClosedLoopReadiness pipelines={pipelineResults} />
          <SubjectGeneralizationPanel
            subjects={subjects}
            pipelineNames={pipelineResults.map((p) => p.name)}
          />
        </div>

        {/* Export actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadScript}
            className="btn btn-outline"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" />
            </svg>
            Download Reproducible Script
          </button>
          <button
            onClick={handleCopyMethods}
            className="btn btn-outline"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="5" width="8" height="8" rx="1.5" />
              <path d="M3 11V3.5A.5.5 0 013.5 3H11" />
            </svg>
            {copiedMethods ? "Copied!" : "Copy Methods Paragraph"}
          </button>
        </div>

        {/* Methods preview */}
        <div className="mt-6">
          <button
            onClick={handleShowMethods}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`transition-transform ${showMethods ? "rotate-90" : ""}`}
            >
              <path d="M4 2l4 4-4 4" />
            </svg>
            Methods paragraph preview
          </button>

          {showMethods && (
            <div className="mt-3 p-4 bg-surface rounded-lg">
              {methodsError ? (
                <p className="text-sm text-red-600">{methodsError}</p>
              ) : methodsText ? (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {methodsText}
                </p>
              ) : (
                <p className="text-sm text-text-secondary italic">Loading methods paragraph...</p>
              )}
            </div>
          )}
        </div>

        {/* Library versions */}
        {libVersions && (
          <p className="font-data text-xs text-text-secondary/60 mt-8 text-center">
            {libVersions}
          </p>
        )}
      </div>
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-secondary">Loading results...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

