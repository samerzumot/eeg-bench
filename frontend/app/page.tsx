"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { InteractiveTelemetry } from "@/components/InteractiveTelemetry";
import { TopoMap } from "@/components/TopoMap";
import { SampleDetailModal } from "@/components/SampleDetailModal";

export default function Home() {
  const [activePillar, setActivePillar] = useState(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [paperSubmitted, setPaperSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [paperEmail, setPaperEmail] = useState("");

  // TopoMap state for Pillar 3
  const [topoValues, setTopoValues] = useState<Record<string, number>>({
    Fp1: 0.2, Fp2: 0.2, F7: 0.3, F3: 0.4, Fz: 0.5, F4: 0.4, F8: 0.3,
    T3: 0.2, C3: 0.8, Cz: 0.6, C4: 0.2, T4: 0.2,
    T5: 0.3, P3: 0.4, Pz: 0.5, P4: 0.4, T6: 0.3,
    O1: 0.2, O2: 0.2
  });

  useEffect(() => {
    if (activePillar !== 2) return;
    const interval = setInterval(() => {
      const isLeft = Math.random() > 0.5;
      setTopoValues({
        Fp1: 0.1 + Math.random() * 0.15,
        Fp2: 0.1 + Math.random() * 0.15,
        F7: 0.2 + Math.random() * 0.2,
        F3: isLeft ? 0.7 + Math.random() * 0.3 : 0.2 + Math.random() * 0.2,
        Fz: 0.3 + Math.random() * 0.25,
        F4: !isLeft ? 0.7 + Math.random() * 0.3 : 0.2 + Math.random() * 0.2,
        F8: 0.2 + Math.random() * 0.2,
        T3: 0.1 + Math.random() * 0.2,
        C3: isLeft ? 0.85 + Math.random() * 0.15 : 0.15 + Math.random() * 0.2,
        Cz: 0.4 + Math.random() * 0.2,
        C4: !isLeft ? 0.85 + Math.random() * 0.15 : 0.15 + Math.random() * 0.2,
        T4: 0.1 + Math.random() * 0.2,
        T5: 0.2 + Math.random() * 0.2,
        P3: isLeft ? 0.6 + Math.random() * 0.25 : 0.2 + Math.random() * 0.2,
        Pz: 0.3 + Math.random() * 0.2,
        P4: !isLeft ? 0.6 + Math.random() * 0.25 : 0.2 + Math.random() * 0.2,
        T6: 0.2 + Math.random() * 0.2,
        O1: 0.1 + Math.random() * 0.15,
        O2: 0.1 + Math.random() * 0.15,
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [activePillar]);

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
    <div className="bg-[#FAFBFD] text-text-primary selection:bg-accent/10 font-sans min-h-screen relative overflow-hidden">
      {/* Background soft glowing gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      {/* Top minimal status bar */}
      <div className="border-b border-border bg-white/60 py-2 px-6 backdrop-blur-xs">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-[11px] text-text-secondary font-data">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>BNIADAM AI RESEARCH LAB · TORONTO</span>
          </div>
          <span className="hidden sm:inline-block tracking-wider">FOUNDATION MODELS FOR MEDICAL ELECTROPHYSIOLOGY</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">

            <h1 className="text-4xl sm:text-5xl md:text-[3.50rem] font-light tracking-tight leading-[1.1] text-text-primary">
              Decoding human neural signals with{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-emerald-600 to-teal-500 font-medium">
                clinical precision.
              </span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-text-secondary max-w-xl font-normal leading-relaxed text-balance">
              bniAdam AI Research Lab develops self-supervised foundation models
              and standardized benchmark infrastructure for clinical electrophysiology and motor imagery translation.
            </p>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto font-medium">
              <Link
                href="/benchmark"
                className="btn btn-primary rounded-full px-6 py-3 text-sm font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Launch Benchmark Portal →
              </Link>
              <button
                onClick={() => setActiveModal("paper")}
                className="btn btn-outline bg-white hover:bg-surface rounded-full px-6 py-3 text-sm transition-all"
              >
                Request Whitepaper
              </button>
              <button
                onClick={() => setActiveModal("contact")}
                className="btn border border-transparent text-text-secondary hover:text-text-primary rounded-full px-6 py-3 text-sm transition-all"
              >
                Lab Collaboration
              </button>
            </div>
          </div>

          {/* Hero Right Column (Live BCI Telemetry Deck) */}
          <div className="lg:col-span-5 w-full">
            <InteractiveTelemetry />
          </div>
        </div>
      </section>

      {/* Interactive Research Pillars Section */}
      <section className="border-t border-border bg-white/30 py-24 relative">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start gap-2 mb-16">
            <span className="text-xs uppercase tracking-widest text-accent font-data font-semibold">
              RESEARCH ARCHITECTURE
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-text-primary">
              Core Pillars of Scientific Focus
            </h2>
            <p className="text-text-secondary text-sm max-w-lg mt-1">
              Click on each pillar to visualize model configuration, benchmarking results, and live diagnostic tools.
            </p>
          </div>

          {/* Interactive Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Navigation Tabs */}
            <div className="lg:col-span-5 flex flex-col gap-4 justify-center">
              {[
                {
                  id: 0,
                  num: "01",
                  title: "Neural Foundation Models",
                  desc: "Self-supervised spatial-temporal architectures pre-trained on 10,000+ hours of multi-site EEG, EMG, and ECoG signal recordings.",
                },
                {
                  id: 1,
                  num: "02",
                  title: "Standardized Evaluation",
                  desc: "Rigorous within-session cross-validation, Riemannian geometry metrics, and deterministic reproduction scripts via EEG-Bench.",
                },
                {
                  id: 2,
                  num: "03",
                  title: "Diagnostic Intelligence",
                  desc: "Translating continuous bio-signals into actionable motor-imagery classification and topographic spectral anomaly detection.",
                },
              ].map((pillar) => (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar.id)}
                  className={`p-6 rounded-2xl border text-left transition-all duration-300 ${
                    activePillar === pillar.id
                      ? "bg-white border-border shadow-md"
                      : "bg-transparent border-transparent hover:border-border hover:bg-white/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-data text-xs font-semibold ${
                      activePillar === pillar.id ? "text-accent" : "text-text-secondary"
                    }`}>
                      {pillar.num}
                    </span>
                    <h3 className={`text-lg font-medium transition-colors ${
                      activePillar === pillar.id ? "text-text-primary" : "text-text-secondary"
                    }`}>
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="mt-2.5 text-xs text-text-secondary leading-relaxed pl-7">
                    {pillar.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Right Column: Dynamic Visualizer Panel */}
            <div className="lg:col-span-7 rounded-2xl border border-border bg-white p-6 flex flex-col justify-between min-h-[360px] md:min-h-[400px] shadow-sm">
              {activePillar === 0 && (
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between text-xs font-data text-text-secondary mb-6">
                      <span>VISUALIZER: ARCHITECTURE BACKBONE</span>
                      <span className="text-accent font-semibold">ACTIVE</span>
                    </div>

                    {/* Layer Pipeline Flow Diagram */}
                    <div className="space-y-4 font-data">
                      <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs text-text-primary font-semibold">1. Spatial Filter Decomposition</div>
                          <div className="text-[10px] text-text-secondary">Learns optimal projection weights across standard 32/64 channels</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px]">CSP Baseline</span>
                      </div>
                      
                      <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs text-text-primary font-semibold">2. Temporal Convolutions (CNN)</div>
                          <div className="text-[10px] text-text-secondary">Extracts multi-frequency band features (Alpha, Beta, Gamma)</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px]">EEGNet Kernel</span>
                      </div>

                      <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs text-text-primary font-semibold">3. Multi-Head Self-Attention</div>
                          <div className="text-[10px] text-text-secondary">Captures long-range temporal correlations across epoch windows</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[10px]">Attention Module</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <button
                      onClick={() => setActiveModal("model_spec")}
                      className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1"
                    >
                      View Complete Specification Spec →
                    </button>
                    <span className="text-[10px] font-data text-text-secondary">4.8M Trainable Parameters</span>
                  </div>
                </div>
              )}

              {activePillar === 1 && (
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between text-xs font-data text-text-secondary mb-6">
                      <span>VISUALIZER: BENCHMARK PREVIEW</span>
                      <span className="text-accent font-semibold">ACTIVE</span>
                    </div>

                    {/* Standardized Benchmark Metrics */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-data mb-1.5">
                          <span className="text-text-primary">EEGNet Model Accuracy</span>
                          <span className="text-accent font-bold">83.1%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: "83.1%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-data mb-1.5">
                          <span className="text-text-primary">Riemannian MDM Accuracy</span>
                          <span className="text-text-secondary">81.4%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: "81.4%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-data mb-1.5">
                          <span className="text-text-primary">CSP + LDA Accuracy</span>
                          <span className="text-text-secondary">78.2%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-zinc-400" style={{ width: "78.2%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-text-secondary leading-relaxed font-data">
                      Results evaluated on the standard <strong>BNCI2014_001</strong> dataset, utilizing 4-class motor imagery recordings cross-validated with zero human data leakage.
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <Link
                      href="/benchmark"
                      className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1"
                    >
                      Access Benchmark Results Portal →
                    </Link>
                    <span className="text-[10px] font-data text-text-secondary">MOABB Standards</span>
                  </div>
                </div>
              )}

              {activePillar === 2 && (
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between text-xs font-data text-text-secondary mb-2">
                      <span>VISUALIZER: ANOMALY TOPOGRAPHY DETECTOR</span>
                      <span className="text-accent animate-pulse font-semibold">LIVE FEED</span>
                    </div>

                    {/* Integrated Live Topography Map */}
                    <div className="flex justify-center my-1.5">
                      <TopoMap channelValues={topoValues} bandLabel="Sensor Motor-Rhythm" size={200} isDark={false} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <Link
                      href="/clinician"
                      className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1"
                    >
                      Open Clinician Intelligence Portal →
                    </Link>
                    <span className="text-[10px] font-data text-text-secondary">10-20 Standard Montage</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Platforms Showcase */}
      <section className="py-24 mx-auto max-w-6xl px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-accent font-data font-semibold">
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
          <div className="p-8 rounded-3xl bg-white border border-border hover:border-accent/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-xs font-data text-text-primary border border-border">
                  Academic Platform
                </span>
                <span className="text-xs font-data text-text-secondary">v0.1.0</span>
              </div>
              <h3 className="mt-6 text-2xl font-light text-text-primary group-hover:text-accent transition-colors">
                EEG-Bench Platform
              </h3>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                Standardized benchmarking engine for motor imagery. Evaluates CSP+LDA, Riemannian Minimum Distance to Mean, and EEGNet with zero setup.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-data text-text-secondary">
                <span className="px-2 py-1 bg-slate-50 rounded border border-border">MOABB 1.1</span>
                <span className="px-2 py-1 bg-slate-50 rounded border border-border">MNE-Python</span>
                <span className="px-2 py-1 bg-slate-50 rounded border border-border">Braindecode</span>
              </div>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/benchmark"
                className="btn btn-primary rounded-full text-xs px-5 py-2.5 font-semibold"
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
          <div className="p-8 rounded-3xl bg-white border border-border hover:border-accent/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-data border border-emerald-100">
                  Clinical Preview
                </span>
                <span className="text-xs font-data text-text-secondary">EDF / BDF Ready</span>
              </div>
              <h3 className="mt-6 text-2xl font-light text-text-primary group-hover:text-accent transition-colors">
                Clinician Intelligence Portal
              </h3>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                Integrated EEG inspection portal with automated band-power decomposition, topography mapping, and real-time pattern alert flags.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-data text-text-secondary">
                <span className="px-2 py-1 bg-slate-50 rounded border border-border">PSD Spectrum</span>
                <span className="px-2 py-1 bg-slate-50 rounded border border-border">Topo Maps</span>
                <span className="px-2 py-1 bg-slate-50 rounded border border-border">Anomaly Detector</span>
              </div>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/clinician"
                className="btn btn-outline rounded-full text-xs px-5 py-2.5 font-semibold bg-white border-border hover:bg-slate-50"
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
      <section className="border-y border-border bg-white py-16 relative">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <p className="text-3xl md:text-4xl font-light text-accent font-data group-hover:scale-105 transition-transform duration-300">
                100%
              </p>
              <p className="mt-2 text-xs text-text-secondary font-medium">
                De-Identified Data Pipeline
              </p>
            </div>
            <div className="group">
              <p className="text-3xl md:text-4xl font-light text-accent font-data group-hover:scale-105 transition-transform duration-300">
                3
              </p>
              <p className="mt-2 text-xs text-text-secondary font-medium">
                Standardized BCI Pipelines
              </p>
            </div>
            <div className="group">
              <p className="text-3xl md:text-4xl font-light text-accent font-data group-hover:scale-105 transition-transform duration-300">
                &lt; 50ms
              </p>
              <p className="mt-2 text-xs text-text-secondary font-medium">
                Inference Latency
              </p>
            </div>
            <div className="group">
              <p className="text-3xl md:text-4xl font-light text-accent font-data group-hover:scale-105 transition-transform duration-300">
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
      <section className="py-28 mx-auto max-w-4xl px-6 text-center relative">
        <span className="text-xs uppercase tracking-widest text-accent font-data font-semibold">
          OUR MISSION
        </span>
        <h2 className="mt-6 text-3xl md:text-[2.5rem] font-light tracking-tight text-text-primary leading-snug">
          "We believe the next paradigm shift in healthcare lies at the intersection of foundation AI models and non-invasive electrophysiology."
        </h2>
        <p className="mt-6 text-sm text-text-secondary leading-relaxed max-w-xl mx-auto">
          bniAdam AI Research Lab is committed to open scientific benchmarks, peer-reviewed accuracy, and collaborative research with leading academic institutions and medical centers.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveModal("contact")}
            className="btn btn-primary rounded-full px-7 py-3 text-sm font-semibold"
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
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-accent text-text-primary"
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
        <div className="space-y-3 text-xs font-data text-text-primary">
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
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-accent text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">
                Area of Interest
              </label>
              <select className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-accent text-text-primary">
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
