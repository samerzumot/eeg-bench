import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — EEG-Bench",
  description: "How EEG-Bench works, the libraries it's built on, and citation information.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-light tracking-tight text-text-primary">
        About EEG-Bench
      </h1>
      <p className="mt-4 text-text-secondary leading-relaxed">
        EEG-Bench is a benchmarking and clinical analysis platform for EEG/BCI
        signals, designed for researchers and clinicians with limited programming
        experience. It runs standardized pipelines on public or uploaded datasets and
        produces reproducible, citable results.
      </p>

      <hr className="my-10 border-border" />

      {/* Pipelines */}
      <h2 className="text-xl font-light text-text-primary">Pipelines</h2>
      <div className="mt-6 flex flex-col gap-6">
        {[
          {
            name: "CSP + LDA",
            desc: "Common Spatial Patterns extracts spatial filters that maximize the variance difference between two motor-imagery classes. Linear Discriminant Analysis then classifies the filtered signals. This is the standard baseline for motor-imagery BCI.",
          },
          {
            name: "Riemannian MDM",
            desc: "Minimum Distance to Mean classifies EEG trials by computing the geometric (Riemannian) distance between their covariance matrices and the class means. It works directly on the manifold of symmetric positive definite matrices, often outperforming CSP when covariance structure is informative.",
          },
          {
            name: "EEGNet",
            desc: "A compact convolutional neural network designed specifically for EEG signals. It learns temporal, spatial, and separable filters in a small number of parameters, making it practical for the limited training data typical of BCI experiments.",
          },
        ].map((p) => (
          <div key={p.name}>
            <h3 className="text-base font-medium text-text-primary">{p.name}</h3>
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">
              {p.desc}
            </p>
          </div>
        ))}
      </div>

      <hr className="my-10 border-border" />

      {/* Libraries */}
      <h2 className="text-xl font-light text-text-primary">Built On</h2>
      <div className="mt-6 flex flex-col gap-4">
        {[
          {
            name: "MOABB",
            url: "https://github.com/NeuroTechX/moabb",
            cite: "Jayaram, V., & Barachant, A. (2018). MOABB: trustworthy algorithm benchmarking for BCIs. Journal of Neural Engineering, 15(6), 066011.",
          },
          {
            name: "MNE-Python",
            url: "https://mne.tools",
            cite: "Gramfort, A., et al. (2013). MEG and EEG data analysis with MNE-Python. Frontiers in Neuroscience, 7, 267.",
          },
          {
            name: "Braindecode",
            url: "https://braindecode.org",
            cite: "Schirrmeister, R. T., et al. (2017). Deep learning with convolutional neural networks for EEG decoding and visualization. Human Brain Mapping, 38(11), 5391-5420.",
          },
          {
            name: "pyRiemann",
            url: "https://github.com/pyRiemann/pyRiemann",
            cite: "Barachant, A., et al. (2013). Classification of covariance matrices using a Riemannian-based kernel for BCI applications. Neurocomputing, 112, 172-178.",
          },
          {
            name: "EEG-Dash",
            url: "https://eegdash.org",
            cite: "EEG-Dash: a data-sharing and management resource for 700+ BIDS-formatted electrophysiological datasets.",
          },
        ].map((lib) => (
          <div key={lib.name} className="card p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-text-primary">{lib.name}</h3>
              <a
                href={lib.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1"
                aria-label={`Visit ${lib.name} repository`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9L9 3M9 3H4M9 3V8" />
                </svg>
              </a>
            </div>
            <p className="mt-1 text-xs text-text-secondary leading-relaxed">
              {lib.cite}
            </p>
          </div>
        ))}
      </div>

      <hr className="my-10 border-border" />

      {/* Data policy */}
      <h2 className="text-xl font-light text-text-primary">Data Policy</h2>
      <p className="mt-4 text-sm text-text-secondary leading-relaxed">
        EEG-Bench does not accept restricted or IRB-protected human-subjects data.
        When uploading your own file, you must attest that the data is public,
        de-identified, or that you have explicit rights/approval to use it for
        benchmarking. Uploaded files are auto-deleted after processing unless you
        opt to retain them.
      </p>

      <hr className="my-10 border-border" />

      {/* Non-goals */}
      <h2 className="text-xl font-light text-text-primary">Scope</h2>
      <p className="mt-4 text-sm text-text-secondary leading-relaxed">
        This version of EEG-Bench is focused on 2-class motor imagery and resting-state clinical EEG. It
        does not support user-editable model architectures or arbitrary code execution. The pipeline set is fixed to ensure
        reproducibility and comparability.
      </p>
    </div>
  );
}
