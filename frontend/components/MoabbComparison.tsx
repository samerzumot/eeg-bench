"use client";

/**
 * Grouped bar chart comparing user results vs MOABB published reference.
 * Deltas shown in coral when there's a meaningful difference.
 */
export function MoabbComparison({
  subjects,
  className = "",
}: {
  subjects: {
    id: string;
    userAcc: number;
    moabbAcc: number;
  }[];
  className?: string;
}) {
  const maxAcc = 100;
  const barMaxHeight = 160; // px

  return (
    <div className={`card p-6 ${className}`}>
      <h3 className="text-sm font-medium text-text-primary">
        vs. MOABB Published
      </h3>
      <div className="flex items-end gap-1 mt-4" style={{ height: barMaxHeight + 40 }}>
        {subjects.map((s) => {
          const userH = (s.userAcc / maxAcc) * barMaxHeight;
          const moabbH = (s.moabbAcc / maxAcc) * barMaxHeight;
          const delta = s.userAcc - s.moabbAcc;
          const showDelta = Math.abs(delta) >= 1;

          return (
            <div key={s.id} className="flex flex-col items-center flex-1 min-w-0">
              {/* Delta */}
              {showDelta && (
                <span
                  className={`font-data text-[10px] mb-1 ${
                    delta > 0 ? "text-accent" : "text-delta"
                  }`}
                >
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(1)}
                </span>
              )}
              {!showDelta && <span className="text-[10px] mb-1">&nbsp;</span>}

              {/* Bars */}
              <div className="flex items-end gap-0.5 w-full justify-center">
                {/* User bar */}
                <div
                  className="w-2.5 bg-accent rounded-t-sm transition-all duration-500"
                  style={{ height: userH }}
                  title={`Your result: ${s.userAcc.toFixed(1)}%`}
                />
                {/* MOABB bar */}
                <div
                  className="w-2.5 bg-text-secondary/15 rounded-t-sm border border-text-secondary/20"
                  style={{ height: moabbH }}
                  title={`MOABB: ${s.moabbAcc.toFixed(1)}%`}
                />
              </div>

              {/* Label */}
              <span className="font-data text-[10px] text-text-secondary mt-1.5 truncate">
                {s.id}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-accent rounded-sm" />
          Your result
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-text-secondary/15 border border-text-secondary/20 rounded-sm" />
          MOABB published
        </span>
      </div>
    </div>
  );
}
