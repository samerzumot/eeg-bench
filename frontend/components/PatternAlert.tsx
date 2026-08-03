"use client";

import { useState } from "react";
import { SampleDetailModal } from "@/components/SampleDetailModal";

interface PatternAlertProps {
  patterns: {
    name: string;
    severity: "info" | "mild" | "moderate" | "significant";
    description: string;
    regions?: string;
    recommendation?: string;
  }[];
}

const severityConfig = {
  info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", badge: "bg-blue-100 text-blue-700", label: "Informational" },
  mild: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", badge: "bg-yellow-100 text-yellow-700", label: "Mild" },
  moderate: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", badge: "bg-orange-100 text-orange-700", label: "Moderate" },
  significant: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", badge: "bg-red-100 text-red-700", label: "Significant" },
};

export function PatternAlert({ patterns }: PatternAlertProps) {
  const [selectedPattern, setSelectedPattern] = useState<any | null>(null);

  if (patterns.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-base font-medium text-text-primary mb-3">
          Pattern Detection
        </h3>
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <p className="text-sm text-green-800">
            No abnormal patterns detected. All metrics within normal range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-text-primary">
            Pattern Detection
            <span className="ml-2 text-xs font-normal text-text-secondary">
              {patterns.length} pattern{patterns.length > 1 ? "s" : ""} flagged
            </span>
          </h3>
          <span className="text-xs text-text-secondary">Click any pattern to inspect sample details</span>
        </div>
        <div className="space-y-3">
          {patterns.map((pattern, i) => {
            const config = severityConfig[pattern.severity];
            return (
              <div
                key={i}
                onClick={() => setSelectedPattern(pattern)}
                className={`p-4 rounded-lg border ${config.bg} ${config.border} cursor-pointer hover:shadow-sm transition-all group`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className={`text-sm font-medium ${config.text} group-hover:underline`}>
                        {pattern.name}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className={`text-xs ${config.text} opacity-80 leading-relaxed`}>
                      {pattern.description}
                    </p>
                    {pattern.regions && (
                      <p className={`text-xs ${config.text} opacity-60 mt-1`}>
                        Regions: {pattern.regions}
                      </p>
                    )}
                    {pattern.recommendation && (
                      <p className={`text-xs ${config.text} opacity-80 mt-2 font-medium`}>
                        → {pattern.recommendation}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs ${config.text} font-medium`}>Details →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPattern && (
        <SampleDetailModal
          isOpen={true}
          onClose={() => setSelectedPattern(null)}
          title={`Detected Pattern: ${selectedPattern.name}`}
          subtitle={selectedPattern.description}
          badge={`Severity: ${selectedPattern.severity}`}
          categoryLabel="Interactive Sample Data"
        >
          <div className="p-4 bg-surface rounded-xl border border-border space-y-3 text-xs">
            <div>
              <p className="font-medium text-text-primary">Affected Anatomical Regions:</p>
              <p className="text-text-secondary mt-0.5">{selectedPattern.regions || "Diffuse across all channels"}</p>
            </div>
            <div>
              <p className="font-medium text-text-primary">Clinical Recommendation:</p>
              <p className="text-text-secondary mt-0.5">{selectedPattern.recommendation || "Correlate with clinical EEG criteria."}</p>
            </div>
            <div>
              <p className="font-medium text-text-primary">Algorithmic Criteria:</p>
              <p className="text-text-secondary mt-0.5 font-data">Threshold rule: Relative band power &gt; 2.5 SD from normative mean (N=450).</p>
            </div>
          </div>
        </SampleDetailModal>
      )}
    </>
  );
}
