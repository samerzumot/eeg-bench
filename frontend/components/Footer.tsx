"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Footer() {
  const pathname = usePathname();
  const [isEvolve, setIsEvolve] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hostname.includes("evolve") || pathname?.startsWith("/evolve")) {
        setIsEvolve(true);
      }
    }
  }, [pathname]);

  if (isEvolve || pathname?.startsWith("/evolve")) {
    return (
      <footer className="border-t border-border bg-surface text-text-primary">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col items-center gap-2.5 text-center">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span>Evolve Brain Training</span>
            <span className="text-text-secondary font-normal">·</span>
            <span className="text-text-secondary font-normal">Dr. Upasana Gala (PhD, BCN, QEEG-D)</span>
          </div>
          <p className="text-xs text-text-secondary">
            Dubai Healthcare City (Ibn Sina Complex) · Abu Dhabi · Specialized Neurofeedback & Quantitative EEG
          </p>
          <p className="text-[11px] text-text-secondary/60">
            Supervised at-home neurofeedback therapy platform. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col items-center gap-3">
        <p className="text-xs text-text-secondary text-center">
          Powered by{" "}
          <a href="/" className="font-medium text-text-primary hover:text-accent transition-colors">
            bniAdam AI Research Lab
          </a>
          {" · "}
          Built on{" "}
          <a href="https://github.com/NeuroTechX/moabb" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">MOABB</a>
          {" · "}
          <a href="https://mne.tools" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">MNE-Python</a>
          {" · "}
          <a href="https://braindecode.org" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">Braindecode</a>
          {" · "}
          <a href="https://github.com/pyRiemann/pyRiemann" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">pyriemann</a>
        </p>
        <p className="text-xs text-text-secondary/60">
          EEG-Bench is a research platform developed by bniAdam AI Research Lab. Not a medical device.
        </p>
      </div>
    </footer>
  );
}
