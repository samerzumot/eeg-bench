"use client";

interface OfflineBannerProps {
  message?: string;
}

export function OfflineBanner({
  message = "GCP backend offline — displaying sample demonstration data.",
}: OfflineBannerProps) {
  return (
    <div className="bg-slate-100 border-b border-slate-200 py-2 px-6">
      <div className="mx-auto max-w-6xl flex items-center justify-between text-xs text-slate-700 font-data">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="font-medium text-slate-900">Notice:</span>
          <span>{message}</span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider hidden sm:inline">
          Sample Reference Data
        </span>
      </div>
    </div>
  );
}
