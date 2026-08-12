"use client";

import { useEffect, useState } from "react";

export interface ResolutionRecoveryModel {
  name: string;
  correlationR: number;
  rmseUv: number;
  snrImprovementDb: number;
  paramCount?: number;
  description?: string;
  provenance?: string;
}

/**
 * Leaderboard table for the Resolution Recovery benchmark track.
 * Displays signal reconstruction fidelity metrics: Correlation, RMSE, SNR Improvement.
 * Reuses the existing card + font-data visual style from BenchmarkBars.
 */
export function ResolutionRecoveryLeaderboard({
  models,
  animate = true,
  className = "",
  datasetLabel = "Placeholder — Synthetic Paired Data",
}: {
  models: ResolutionRecoveryModel[];
  animate?: boolean;
  className?: string;
  datasetLabel?: string;
}) {
  const [progress, setProgress] = useState(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;
    const start = performance.now();
    const duration = 800;

    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setProgress(1 - Math.pow(1 - t, 3)); // ease-out cubic
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [animate]);

  // Sort by correlation descending (best first)
  const sorted = [...models].sort((a, b) => b.correlationR - a.correlationR);

  return (
    <div className={`card p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-text-primary">
          Reconstruction Fidelity Leaderboard
        </h3>
        <span className="text-[10px] font-data text-text-secondary px-2 py-0.5 rounded bg-surface border border-border">
          SIGNAL → SIGNAL
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-[11px] font-semibold text-text-secondary font-data tracking-wider">
                MODEL
              </th>
              <th className="pb-3 text-[11px] font-semibold text-text-secondary font-data tracking-wider text-right">
                CORRELATION (r)
              </th>
              <th className="pb-3 text-[11px] font-semibold text-text-secondary font-data tracking-wider text-right">
                RMSE (μV)
              </th>
              <th className="pb-3 text-[11px] font-semibold text-text-secondary font-data tracking-wider text-right">
                SNR GAIN (dB)
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((model, idx) => {
              const isTop = idx === 0;
              return (
                <tr
                  key={model.name}
                  className={`border-b border-border/50 transition-colors hover:bg-surface/60 ${
                    isTop ? "bg-accent/[0.03]" : ""
                  }`}
                >
                  {/* Model name */}
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isTop ? "bg-accent" : "bg-text-secondary/30"
                        }`}
                      />
                      <div>
                        <span className="text-sm font-medium text-text-primary">
                          {model.name}
                        </span>
                        {model.paramCount && (
                          <span className="ml-2 text-[10px] font-data text-text-secondary">
                            {model.paramCount >= 1000
                              ? `${(model.paramCount / 1000).toFixed(0)}K params`
                              : `${model.paramCount} params`}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Correlation with bar */}
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isTop ? "bg-accent" : "bg-text-secondary/40"
                          }`}
                          style={{
                            width: `${Math.max(0, model.correlationR * progress * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="font-data text-sm text-text-primary w-12 text-right">
                        {(model.correlationR * progress).toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* RMSE */}
                  <td className="py-4 text-right">
                    <span className="font-data text-sm text-text-primary">
                      {(model.rmseUv * (2 - progress)).toFixed(1)}
                    </span>
                  </td>

                  {/* SNR Improvement */}
                  <td className="py-4 text-right">
                    <span
                      className={`font-data text-sm font-medium ${
                        model.snrImprovementDb > 3
                          ? "text-accent"
                          : model.snrImprovementDb > 0
                          ? "text-text-primary"
                          : "text-delta"
                      }`}
                    >
                      +{(model.snrImprovementDb * progress).toFixed(1)} dB
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <p className="font-data text-xs text-text-secondary">{datasetLabel}</p>
        <p className="font-data text-[10px] text-text-secondary">
          Metrics: Pearson r · RMSE · SNR Δ
        </p>
      </div>
    </div>
  );
}
