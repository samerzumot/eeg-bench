"use client";

import { useState } from "react";
import { SampleDetailModal } from "@/components/SampleDetailModal";

/**
 * Pipeline result card — displays name, description, accuracy, and AUC
 * with all numbers in JetBrains Mono. Clickable for deep-dive sample details.
 */
export function PipelineCard({
  name,
  description,
  accuracy,
  ci,
  auc,
  aucCi,
}: {
  name: string;
  description: string;
  accuracy: number;
  ci: number;
  auc: number;
  aucCi: number;
}) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="card p-6 flex flex-col cursor-pointer hover:border-accent/40 transition-all hover:shadow-sm group relative"
      >
        <div className="flex items-start justify-between">
          <h3 className="text-base font-medium text-text-primary group-hover:text-accent transition-colors">
            {name}
          </h3>
          <span className="text-[10px] text-text-secondary font-data group-hover:text-accent">
            Inspect →
          </span>
        </div>
        <p className="mt-1 text-xs text-text-secondary leading-relaxed">
          {description}
        </p>
        <div className="mt-4 flex-1 flex flex-col justify-end">
          <p className="font-data text-3xl text-text-primary tracking-tight">
            {accuracy.toFixed(1)}%
          </p>
          <p className="font-data text-xs text-text-secondary mt-1">
            ± {ci.toFixed(1)}%
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-text-secondary">
            AUC{" "}
            <span className="font-data">
              {auc.toFixed(2)} ± {aucCi.toFixed(2)}
            </span>
          </p>
          <span className="text-[10px] text-accent font-medium">View matrix</span>
        </div>
      </div>

      <SampleDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={`Pipeline Details: ${name}`}
        subtitle={description}
        badge={`Accuracy: ${accuracy.toFixed(1)}% (AUC ${auc.toFixed(2)})`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-surface rounded-xl border border-border space-y-2 font-data">
            <div className="flex justify-between"><span>Cross-Validation:</span><span>5-fold within-session</span></div>
            <div className="flex justify-between"><span>Preprocessing Filter:</span><span>8.0–30.0 Hz Bandpass</span></div>
            <div className="flex justify-between"><span>Feature Dimension:</span><span>{name === "CSP + LDA" ? "8 spatial filters" : name === "Riemannian MDM" ? "22x22 Covariance Matrix" : "64 temporal/spatial filters"}</span></div>
          </div>

          <div>
            <p className="font-semibold text-text-primary mb-2">Sample Confusion Matrix (2-Class Motor Imagery):</p>
            <div className="grid grid-cols-2 gap-2 text-center font-data">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-xs text-teal-800">True Left Hand</p>
                <p className="text-lg font-bold text-teal-900 mt-0.5">{Math.round(accuracy * 0.82)}%</p>
              </div>
              <div className="p-3 bg-surface border border-border rounded-lg">
                <p className="text-xs text-text-secondary">False Right Hand</p>
                <p className="text-lg font-bold text-text-primary mt-0.5">{Math.round((100 - accuracy) * 0.82)}%</p>
              </div>
              <div className="p-3 bg-surface border border-border rounded-lg">
                <p className="text-xs text-text-secondary">False Left Hand</p>
                <p className="text-lg font-bold text-text-primary mt-0.5">{Math.round((100 - accuracy) * 0.84)}%</p>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-xs text-teal-800">True Right Hand</p>
                <p className="text-lg font-bold text-teal-900 mt-0.5">{Math.round(accuracy * 0.84)}%</p>
              </div>
            </div>
          </div>
        </div>
      </SampleDetailModal>
    </>
  );
}
