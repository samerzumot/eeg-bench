"use client";

/**
 * Per-subject accuracy breakdown with inline bar sparklines.
 */
export function SubjectTable({
  subjects,
  pipelines,
  className = "",
}: {
  subjects: {
    id: string;
    accuracies: Record<string, number>; // pipeline name → accuracy
  }[];
  pipelines: string[];
  className?: string;
}) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-medium text-text-secondary px-6 py-3 text-xs uppercase tracking-wider">
                Subject
              </th>
              {pipelines.map((p) => (
                <th
                  key={p}
                  className="text-left font-medium text-text-secondary px-4 py-3 text-xs uppercase tracking-wider"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, i) => (
              <tr
                key={s.id}
                className={i % 2 === 1 ? "bg-surface/50" : "bg-white"}
              >
                <td className="font-data text-sm text-text-primary px-6 py-2.5">
                  {s.id}
                </td>
                {pipelines.map((p) => {
                  const acc = s.accuracies[p] ?? 0;
                  return (
                    <td key={p} className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="font-data text-sm text-text-primary w-14 shrink-0">
                          {acc.toFixed(1)}%
                        </span>
                        {/* Sparkline bar */}
                        <div className="flex-1 h-2 bg-border rounded max-w-[120px]">
                          <div
                            className="h-full bg-accent rounded"
                            style={{ width: `${acc}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
