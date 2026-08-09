"use client";

interface SubjectData {
  id: string;
  userAcc: number;
  moabbAcc: number;
  accuracies: Record<string, number>;
}

interface SubjectGeneralizationPanelProps {
  subjects: SubjectData[];
  pipelineNames: string[];
}

export function SubjectGeneralizationPanel({
  subjects,
  pipelineNames,
}: SubjectGeneralizationPanelProps) {
  if (!subjects || subjects.length === 0) return null;

  // Calculate subject-level generalization statistics
  const subjectMeans = subjects.map((s) => s.userAcc);
  const meanAcc = subjectMeans.reduce((a, b) => a + b, 0) / subjectMeans.length;
  const maxAcc = Math.max(...subjectMeans);
  const minAcc = Math.min(...subjectMeans);
  const stdDev = Math.sqrt(
    subjectMeans.reduce((sq, n) => sq + Math.pow(n - meanAcc, 2), 0) / subjectMeans.length
  );

  return (
    <div className="card p-6 bg-white border border-border rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-medium text-text-primary">
            Subject-Level Generalization Profile
          </h3>
          <p className="text-xs text-text-secondary mt-0.5 font-data">
            Inter-subject variance across {subjects.length} subjects on real benchmarked folds.
          </p>
        </div>
        <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-data font-semibold">
          {subjects.length} Subjects Evaluated
        </span>
      </div>

      {/* Metric Callouts */}
      <div className="grid grid-cols-3 gap-3 my-4 font-data">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <span className="text-[10px] text-slate-400 block uppercase">Mean Accuracy</span>
          <span className="text-lg font-bold text-slate-800">{meanAcc.toFixed(1)}%</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <span className="text-[10px] text-slate-400 block uppercase">Inter-Subj Std Dev</span>
          <span className="text-lg font-bold text-accent">±{stdDev.toFixed(1)}%</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <span className="text-[10px] text-slate-400 block uppercase">Range (Min–Max)</span>
          <span className="text-lg font-bold text-slate-800">
            {minAcc.toFixed(0)}% – {maxAcc.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Visual Distribution Dots/Bars per Subject */}
      <div className="space-y-2 mt-4 font-data text-xs">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Subject Breakdown
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="p-2 rounded-lg border border-slate-100 bg-slate-50 text-center flex flex-col items-center justify-between"
            >
              <span className="text-[10px] font-bold text-slate-500">{s.id}</span>
              <span
                className={`text-xs font-semibold my-1 ${
                  s.userAcc >= 85
                    ? "text-emerald-700 font-bold"
                    : s.userAcc >= 75
                    ? "text-slate-800"
                    : "text-amber-700"
                }`}
              >
                {s.userAcc.toFixed(1)}%
              </span>
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${s.userAcc >= 80 ? "bg-accent" : "bg-amber-400"}`}
                  style={{ width: `${Math.min(100, s.userAcc)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
