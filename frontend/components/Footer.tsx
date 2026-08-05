export function Footer() {
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
