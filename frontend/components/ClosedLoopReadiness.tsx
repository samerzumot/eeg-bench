"use client";

interface PipelineLatencyInfo {
  name: string;
  accuracy: number;
  latencyMs: number;
}

interface ClosedLoopReadinessProps {
  pipelines: PipelineLatencyInfo[];
}

export function ClosedLoopReadiness({ pipelines }: ClosedLoopReadinessProps) {
  // 50ms is the standard threshold budget for phase-locked real-time closed-loop BCI systems
  const BUDGET_MS = 50;

  return (
    <div className="card p-6 bg-white border border-border rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-medium text-text-primary">
            Closed-Loop Readiness Matrix
          </h3>
          <p className="text-xs text-text-secondary mt-0.5 font-data">
            Measured single-trial wall-clock latency vs. accuracy. Budget limit: {BUDGET_MS} ms.
          </p>
        </div>
        <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-data font-semibold">
          Real-time Benchmarked
        </span>
      </div>

      {/* Latency vs Accuracy Breakdown Table & Visual Bar */}
      <div className="space-y-4 mt-6">
        {pipelines.map((p) => {
          const isRealtimeCandidate = p.latencyMs <= BUDGET_MS;
          const latencyPct = Math.min(100, Math.max(2, (p.latencyMs / BUDGET_MS) * 100));

          return (
            <div key={p.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-data">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{p.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      isRealtimeCandidate
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isRealtimeCandidate ? "Closed-Loop Ready (<50ms)" : "High Latency"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-600">
                  <span>
                    Acc: <strong className="text-slate-900">{p.accuracy.toFixed(1)}%</strong>
                  </span>
                  <span>
                    Latency: <strong className="text-accent">{p.latencyMs.toFixed(2)} ms</strong>
                  </span>
                </div>
              </div>

              {/* Relative Latency Bar vs 50ms Limit */}
              <div className="relative h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isRealtimeCandidate ? "bg-accent" : "bg-amber-500"
                  }`}
                  style={{ width: `${latencyPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-text-secondary leading-relaxed mt-5 pt-3 border-t border-slate-100 font-data">
        <strong className="text-text-primary">Note for Neuroscientists & Clinicians:</strong> Pipelines under roughly a 50ms latency budget are viable candidates for real-time phase-locked closed-loop neurostimulation (e.g. adaptive DBS trigger logic).
      </p>
    </div>
  );
}
