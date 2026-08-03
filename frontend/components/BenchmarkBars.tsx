"use client";

import { useEffect, useState } from "react";

export interface PipelineResult {
  name: string;
  accuracy: number;
  ci: number; // ± value
  auc?: number;
  aucCi?: number;
}

const REFERENCE_LINE = 80; // MOABB reference accuracy %

/**
 * Horizontal accuracy bars with CI whiskers and a dashed MOABB reference line.
 * Numbers rendered in JetBrains Mono via the font-data class.
 */
export function BenchmarkBars({
  pipelines,
  animate = true,
  className = "",
}: {
  pipelines: PipelineResult[];
  animate?: boolean;
  className?: string;
}) {
  const [progress, setProgress] = useState(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;
    // Ease-out animation over 800ms
    const start = performance.now();
    const duration = 800;

    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [animate]);

  const maxAccuracy = 100;

  return (
    <div className={`card p-6 ${className}`}>
      {/* Reference line label */}
      <div className="relative mb-5">
        <div
          className="absolute top-0 bottom-0 border-l border-dashed border-text-secondary/30"
          style={{ left: `${REFERENCE_LINE}%` }}
        />
        <p
          className="font-data text-[11px] text-text-secondary absolute -top-1"
          style={{ left: `${REFERENCE_LINE}%`, transform: "translateX(-50%)" }}
        >
          MOABB Ref
        </p>
      </div>

      <div className="flex flex-col gap-5 mt-4">
        {pipelines.map((p) => {
          const barWidth = (p.accuracy / maxAccuracy) * progress * 100;
          return (
            <div key={p.name} className="flex items-center gap-4">
              {/* Label */}
              <span className="text-sm text-text-primary w-36 shrink-0 text-right">
                {p.name}
              </span>

              {/* Bar container */}
              <div className="flex-1 relative">
                {/* Reference dashed line */}
                <div
                  className="absolute top-0 bottom-0 border-l border-dashed border-text-secondary/20 z-10"
                  style={{ left: `${REFERENCE_LINE}%` }}
                />

                {/* Bar track */}
                <div className="h-5 bg-border rounded">
                  {/* Filled bar */}
                  <div
                    className="h-full bg-accent rounded transition-all duration-100"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>

              {/* Value */}
              <span className="font-data text-sm text-text-primary w-28 shrink-0">
                {(p.accuracy * progress).toFixed(1)}% ± {p.ci.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dataset label */}
      <p className="font-data text-xs text-text-secondary mt-4">
        BNCI2014_001
      </p>
    </div>
  );
}
