export function EvolveFooter() {
  return (
    <footer className="border-t border-border bg-surface text-text-primary mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col items-center gap-2.5 text-center">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span>Evolve Brain Training</span>
          <span className="text-text-secondary font-normal">·</span>
          <span className="text-text-secondary font-normal">Dr. Upasana Gala (PhD, BCN, QEEG-D)</span>
        </div>
        <p className="text-xs text-text-secondary">
          Dubai Healthcare City (Ibn Sina Building 27) · Abu Dhabi · Specialized Neurofeedback & Quantitative EEG
        </p>
        <p className="text-[11px] text-text-secondary/60">
          Supervised at-home neurofeedback therapy platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
