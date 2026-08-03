"use client";

import Link from "next/link";
import { useState } from "react";
import { LabNeuralGraphic } from "@/components/LabNeuralGraphic";
import { SampleDetailModal } from "@/components/SampleDetailModal";

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [paperSubmitted, setPaperSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [paperEmail, setPaperEmail] = useState("");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          type: "lab_access_inquiry",
          recipient: "srzumot@gmail.com",
        }),
      });
    } catch (err) {
      console.error("Submission error:", err);
    }
    setContactSubmitted(true);
  };

  const handlePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperEmail) return;
    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: paperEmail,
          type: "whitepaper_request",
          recipient: "srzumot@gmail.com",
        }),
      });
    } catch (err) {
      console.error("Submission error:", err);
    }
    setPaperSubmitted(true);
  };

  return (
    <div className="bg-white text-text-primary selection:bg-accent/10 font-sans">
      {/* Top minimal status bar */}
      <div className="border-b border-border bg-surface/60 py-2 px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between text-xs text-text-secondary font-data">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>BNIADAM AI RESEARCH LAB · TORONTO</span>
          </div>
          <span className="hidden sm:inline-block">FOUNDATION MODELS FOR MEDICAL ELECTROPHYSIOLOGY</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Typography-focused Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-text-primary leading-[1.1] text-balance">
            Decoding human neural signals with clinical precision.
          </h1>

          {/* Minimal Subheading */}
          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl font-normal leading-relaxed text-balance">
            bniAdam AI Research Lab develops self-supervised foundation models
            and standardized benchmark infrastructure for clinical electrophysiology.
          </p>

          {/* Primary CTA Action Row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/benchmark"
              className="btn btn-primary rounded-full px-6 py-3 text-sm font-medium transition-all shadow-xs hover:shadow-md"
            >
              Academic Researchers →
            </Link>
            <button
              onClick={() => setActiveModal("paper")}
              className="btn btn-outline rounded-full px-6 py-3 text-sm font-medium border-border hover:bg-surface"
            >
              Request Whitepaper
            </button>
            <button
              onClick={() => setActiveModal("contact")}
              className="btn btn-outline rounded-full px-6 py-3 text-sm font-medium border-border hover:bg-surface text-text-secondary"
            >
              Lab Access Request
            </button>
          </div>
        </div>

        {/* Dynamic Waveform Canvas Accent */}
        <div className="mt-16">
          <LabNeuralGraphic />
        </div>
      </section>

      {/* Research Pillars — 3-column minimal grid */}
      <section className="border-t border-border bg-surface/30 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-start gap-2 mb-12">
            <span className="text-xs uppercase tracking-widest text-text-secondary font-data">
              RESEARCH ARCHITECTURE
            </span>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-text-primary">
              Core Pillars of Scientific Focus
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-8 rounded-2xl bg-white border border-border flex flex-col justify-between hover:border-accent/30 transition-colors shadow-xs">
              <div>
                <span className="font-data text-xs text-accent font-semibold tracking-wider">
                  01 / REPRESENTATIONS
                </span>
                <h3 className="mt-4 text-xl font-medium text-text-primary">
                  Neural Foundation Models
                </h3>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Self-supervised spatial-temporal architectures pre-trained on 10,000+ hours of multi-site EEG, EMG, and ECoG signal recordings across diverse clinical cohorts.
                </p>
              </div>
              <button
                onClick={() => setActiveModal("model_spec")}
                className="mt-8 text-xs font-medium text-accent hover:text-accent-hover text-left flex items-center gap-1 group"
              >
                Model Architecture Spec
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-2xl bg-white border border-border flex flex-col justify-between hover:border-accent/30 transition-colors shadow-xs">
              <div>
                <span className="font-data text-xs text-accent font-semibold tracking-wider">
                  02 / BENCHMARKING
                </span>
                <h3 className="mt-4 text-xl font-medium text-text-primary">
                  Standardized Evaluation
                </h3>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Engineered **EEG-Bench** to enforce rigorous within-session cross-validation, Riemannian geometry metrics, and deterministic reproduction scripts for the academic research community.
                </p>
              </div>
              <Link
                href="/benchmark"
                className="mt-8 text-xs font-medium text-accent hover:text-accent-hover flex items-center gap-1 group"
              >
                Launch Academic Researcher Portal
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-2xl bg-white border border-border flex flex-col justify-between hover:border-accent/30 transition-colors shadow-xs">
              <div>
                <span className="font-data text-xs text-accent font-semibold tracking-wider">
                  03 / CLINICAL AI
                </span>
                <h3 className="mt-4 text-xl font-medium text-text-primary">
                  Diagnostic Intelligence
                </h3>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Translating continuous bio-signals into actionable motor-imagery classification and spectral anomaly detection for neuro-rehabilitation and clinical decision support.
                </p>
              </div>
              <Link
                href="/clinician"
                className="mt-8 text-xs font-medium text-accent hover:text-accent-hover flex items-center gap-1 group"
              >
                View Clinician Portal
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Platforms & Models Showcase */}
      <section className="py-24 mx-auto max-w-5xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-text-secondary font-data">
            RESEARCH TRANSLATION
          </span>
          <h2 className="mt-2 text-3xl font-light tracking-tight text-text-primary">
            Built for clinical researchers & neuroscientists.
          </h2>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">
            Open infrastructure designed to accelerate non-invasive electrophysiology research from algorithm formulation to clinical deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card A: EEG-Bench */}
          <div className="p-8 rounded-3xl bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-xs font-data text-text-primary border border-border">
                  Academic Platform
                </span>
                <span className="text-xs font-data text-text-secondary">v0.1.0</span>
              </div>
              <h3 className="mt-6 text-2xl font-light text-text-primary">
                EEG-Bench Platform
              </h3>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                Standardized benchmarking engine for motor imagery. Evaluates CSP+LDA, Riemannian Minimum Distance to Mean, and EEGNet with zero setup.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-data text-text-secondary">
                <span className="px-2 py-1 bg-white rounded border border-border">MOABB 1.1</span>
                <span className="px-2 py-1 bg-white rounded border border-border">MNE-Python</span>
                <span className="px-2 py-1 bg-white rounded border border-border">Braindecode</span>
              </div>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/benchmark"
                className="btn btn-primary rounded-full text-xs px-5 py-2.5"
              >
                Academic Researchers →
              </Link>
              <Link
                href="/wizard"
                className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Custom Data Wizard →
              </Link>
            </div>
          </div>

          {/* Card B: Clinician Suite */}
          <div className="p-8 rounded-3xl bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-data border border-emerald-200">
                  Clinical Preview
                </span>
                <span className="text-xs font-data text-text-secondary">EDF / BDF Ready</span>
              </div>
              <h3 className="mt-6 text-2xl font-light text-text-primary">
                Clinician Intelligence Portal
              </h3>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                Integrated EEG inspection portal with automated band-power decomposition, topography mapping, and real-time pattern alert flags.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-data text-text-secondary">
                <span className="px-2 py-1 bg-white rounded border border-border">PSD Spectrum</span>
                <span className="px-2 py-1 bg-white rounded border border-border">Topo Maps</span>
                <span className="px-2 py-1 bg-white rounded border border-border">Anomaly Detector</span>
              </div>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/clinician"
                className="btn btn-outline rounded-full text-xs px-5 py-2.5 bg-white border-border"
              >
                Launch Portal
              </Link>
              <Link
                href="/clinician/upload"
                className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Upload Patient File →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Medical & Scientific Standards Bar */}
      <section className="border-y border-border bg-surface/40 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-light text-text-primary font-data">
                100%
              </p>
              <p className="mt-2 text-xs text-text-secondary font-medium">
                De-Identified Data Pipeline
              </p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-light text-text-primary font-data">
                3
              </p>
              <p className="mt-2 text-xs text-text-secondary font-medium">
                Standardized BCI Pipelines
              </p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-light text-text-primary font-data">
                &lt; 50ms
              </p>
              <p className="mt-2 text-xs text-text-secondary font-medium">
                Inference Latency
              </p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-light text-text-primary font-data">
                Open
              </p>
              <p className="mt-2 text-xs text-text-secondary font-medium">
                Reproducible Python Scripts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Manifesto / Mission Statement */}
      <section className="py-24 mx-auto max-w-3xl px-6 text-center">
        <span className="text-xs uppercase tracking-widest text-text-secondary font-data">
          OUR MISSION
        </span>
        <h2 className="mt-4 text-3xl md:text-4xl font-light tracking-tight text-text-primary leading-snug">
          "We believe the next paradigm shift in healthcare lies at the intersection of foundation AI models and non-invasive electrophysiology."
        </h2>
        <p className="mt-6 text-sm text-text-secondary leading-relaxed max-w-xl mx-auto">
          bniAdam AI Research Lab is committed to open scientific benchmarks, peer-reviewed accuracy, and collaborative research with leading academic institutions and medical centers.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveModal("contact")}
            className="btn btn-primary rounded-full px-7 py-3 text-sm"
          >
            Partner With Our Lab
          </button>
        </div>
      </section>

      {/* Modals */}

      {/* 1. Whitepaper Request Email Modal */}
      <SampleDetailModal
        isOpen={activeModal === "paper"}
        onClose={() => {
          setActiveModal(null);
          setPaperSubmitted(false);
        }}
        title="Request bniAdam-1 Technical Whitepaper"
        subtitle="Get early notification and access upon paper release"
        badge="Early Access"
      >
        {paperSubmitted ? (
          <div className="p-6 text-center bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            <h4 className="font-medium text-base">Request Registered</h4>
            <p className="mt-1 text-xs text-emerald-700">
              Thank you! We will email you the bniAdam-1 technical whitepaper as soon as it is released.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePaperSubmit} className="space-y-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              The bniAdam-1 foundation model whitepaper is currently undergoing peer review. Enter your academic or institutional email to receive an advance copy directly to your inbox upon publication.
            </p>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                required
                value={paperEmail}
                onChange={(e) => setPaperEmail(e.target.value)}
                placeholder="researcher@institution.edu"
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full py-2.5 text-sm rounded-lg"
            >
              Send Me The Whitepaper Upon Release
            </button>
          </form>
        )}
      </SampleDetailModal>

      {/* 2. Model Spec Modal */}
      <SampleDetailModal
        isOpen={activeModal === "model_spec"}
        onClose={() => setActiveModal(null)}
        title="bniAdam-1 Neural Backbone Specification"
        subtitle="Architecture details & spatial filter decomposition"
        badge="Model Spec"
      >
        <div className="space-y-3 text-xs font-data">
          <div className="p-3 bg-surface rounded-xl border border-border space-y-1.5">
            <p><strong>Architecture:</strong> Spatial-Temporal Convolutions + Multi-Head Self-Attention</p>
            <p><strong>Parameters:</strong> 4.8M trainable weights (optimised for edge / clinical deployment)</p>
            <p><strong>Receptive Field:</strong> 2.5s window at 250 Hz (625 time samples)</p>
            <p><strong>Supported Montages:</strong> 10-20 system (8, 16, 32, 64 channels)</p>
            <p><strong>Pre-processing:</strong> 1-45 Hz bandpass filter + exponential moving average standardization</p>
          </div>
        </div>
      </SampleDetailModal>

      {/* 3. Contact / Lab Access Request Modal */}
      <SampleDetailModal
        isOpen={activeModal === "contact"}
        onClose={() => {
          setActiveModal(null);
          setContactSubmitted(false);
        }}
        title="Request Lab Access & Collaboration"
        subtitle="Connect with the bniAdam AI Research Lab engineering & science team"
        badge="Partnerships"
      >
        {contactSubmitted ? (
          <div className="p-6 text-center bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            <h4 className="font-medium text-base">Request Submitted</h4>
            <p className="mt-1 text-xs text-emerald-700">
              Thank you for reaching out. A research scientist from bniAdam AI Research Lab will respond within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">
                Academic / Organization Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@university.edu"
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">
                Area of Interest
              </label>
              <select className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-accent">
                <option>Clinical Trial Partnership</option>
                <option>EEG-Bench Dataset Integration</option>
                <option>bniAdam-1 Foundation Model Access</option>
                <option>General Research Inquiry</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full py-2.5 text-sm rounded-lg"
            >
              Submit Lab Request
            </button>
          </form>
        )}
      </SampleDetailModal>
    </div>
  );
}
