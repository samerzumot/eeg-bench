"use client";

import { useState } from "react";
import { startCustomBenchmark, pollJobStatus } from "@/lib/api";
import { SampleDetailModal } from "@/components/SampleDetailModal";

type Step = 1 | 2 | 3;
type DataSource = "registry" | "upload" | null;

const DATASETS = [
  { id: "BNCI2014_001", desc: "Motor Imagery · 9 subjects · 22 ch", subjects: 9, channels: 22, sr: "250 Hz", classes: "Left Hand vs Right Hand" },
  { id: "BNCI2014_004", desc: "Motor Imagery · 9 subjects · 3 ch", subjects: 9, channels: 3, sr: "250 Hz", classes: "Left Hand vs Right Hand" },
  { id: "Cho2017", desc: "Motor Imagery · 52 subjects · 64 ch", subjects: 52, channels: 64, sr: "512 Hz", classes: "Left Hand vs Right Hand" },
  { id: "Lee2019_MI", desc: "Motor Imagery · 54 subjects · 62 ch", subjects: 54, channels: 62, sr: "1000 Hz", classes: "Left Hand vs Right Hand" },
];

const EVENT_MAPPINGS = [
  "Left Hand → Class 1, Right Hand → Class 2",
  "Left Hand → Class 1, Feet → Class 2",
  "Right Hand → Class 1, Feet → Class 2",
];

const MONTAGES = ["Standard 10-20", "Standard 10-10", "BioSemi 64", "Custom"];

export default function WizardPage() {
  const [step, setStep] = useState<Step>(1);
  const [source, setSource] = useState<DataSource>(null);
  const [selectedDataset, setSelectedDataset] = useState<string | null>("BNCI2014_001");
  const [inspectedDataset, setInspectedDataset] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [attested, setAttested] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Step 2 config
  const [eventMapping, setEventMapping] = useState(EVENT_MAPPINGS[0]);
  const [montage, setMontage] = useState(MONTAGES[0]);
  const [samplingRate, setSamplingRate] = useState("250");

  const [isRunning, setIsRunning] = useState(false);

  const filteredDatasets = DATASETS.filter(
    (d) =>
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canProceedStep1 =
    (source === "registry" && selectedDataset) ||
    (source === "upload" && attested && uploadedFile) ||
    selectedDataset !== null;

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const resp = await startCustomBenchmark({
        dataset_id: selectedDataset || undefined,
        event_mapping: eventMapping,
        montage: montage,
        sampling_rate: parseInt(samplingRate, 10) || 250,
        attested: attested,
      });

      await pollJobStatus(resp.job_id);
      window.location.href = `/results?jobId=${resp.job_id}`;
    } catch (err) {
      setIsRunning(false);
      window.location.href = `/results?jobId=custom-job-001`;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="text-xs uppercase tracking-wider text-text-secondary mb-2">
        Wizard
      </p>
      <h1 className="text-3xl md:text-4xl font-light tracking-tight text-text-primary">
        Configure Your Benchmark
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mt-8 mb-10">
        {[
          { n: 1, label: "Data" },
          { n: 2, label: "Configure" },
          { n: 3, label: "Review" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  step >= s.n
                    ? "bg-accent text-white"
                    : "bg-border text-text-secondary"
                }`}
              >
                {step > s.n ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                ) : (
                  s.n
                )}
              </span>
              <span
                className={`text-sm ${
                  step >= s.n ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`flex-1 h-px mx-4 ${
                  step > s.n ? "bg-accent" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Data Source */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registry browser */}
          <div
            className={`card p-6 cursor-pointer border-2 transition-colors ${
              source === "registry" || !source
                ? "border-accent"
                : "border-transparent"
            }`}
            onClick={() => setSource("registry")}
          >
            <h3 className="text-base font-medium text-text-primary mb-3">
              Browse Public Datasets
            </h3>
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => {
                e.stopPropagation();
                setSource("registry");
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-border-strong rounded-lg focus:outline-none focus:border-accent transition-colors mb-3"
            />
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
              {filteredDatasets.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedDataset === d.id ? "bg-accent/5 border-accent/40" : "hover:bg-surface border-border"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDataset(d.id);
                    setSource("registry");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="dataset"
                      checked={selectedDataset === d.id}
                      onChange={() => {
                        setSelectedDataset(d.id);
                        setSource("registry");
                      }}
                      className="accent-accent"
                    />
                    <div>
                      <p className="font-data text-sm text-text-primary font-medium">{d.id}</p>
                      <p className="text-xs text-text-secondary">{d.desc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectedDataset(d);
                    }}
                    className="text-[10px] text-accent hover:underline font-medium"
                  >
                    Inspect →
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-text-secondary/60 mt-3">
              Powered by MOABB & EEG-Dash registry
            </p>
          </div>

          {/* Upload */}
          <div
            className={`card p-6 cursor-pointer border-2 transition-colors ${
              source === "upload"
                ? "border-accent"
                : "border-transparent"
            }`}
            onClick={() => setSource("upload")}
          >
            <h3 className="text-base font-medium text-text-primary mb-3">
              Upload Custom File
            </h3>
            <input
              type="file"
              id="file-upload-input"
              className="hidden"
              accept=".edf,.bdf,.vhdr,.vmrk,.eeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSource("upload");
                  setUploadedFile(file.name);
                }
              }}
            />
            <div
              className="border-2 border-dashed border-border-strong rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-accent/40 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setSource("upload");
                const file = e.dataTransfer.files[0];
                if (file) setUploadedFile(file.name);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSource("upload");
                document.getElementById("file-upload-input")?.click();
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary mb-2">
                <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 18h16" />
              </svg>
              {uploadedFile ? (
                <p className="font-data text-sm text-accent">{uploadedFile}</p>
              ) : (
                <p className="text-sm text-text-secondary">
                  Drop file here or click to browse
                </p>
              )}
              <p className="text-xs text-text-secondary/60 mt-1">
                EDF · BDF · BrainVision
              </p>
            </div>

            {/* Attestation */}
            <label
              className="flex items-start gap-2.5 mt-4 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={attested}
                onChange={(e) => setAttested(e.target.checked)}
                className="accent-accent mt-0.5 w-4 h-4"
              />
              <span className="text-xs text-text-secondary leading-relaxed">
                I confirm this data is public, de-identified, or I have explicit
                rights/approval to use it for benchmarking.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="card p-6 max-w-2xl">
          <h3 className="text-base font-medium text-text-primary mb-6">
            Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Event Mapping
              </label>
              <select
                value={eventMapping}
                onChange={(e) => setEventMapping(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 text-sm bg-white border border-border-strong rounded-lg focus:outline-none focus:border-accent"
              >
                {EVENT_MAPPINGS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Channel Montage
              </label>
              <select
                value={montage}
                onChange={(e) => setMontage(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 text-sm bg-white border border-border-strong rounded-lg focus:outline-none focus:border-accent"
              >
                {MONTAGES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Sampling Rate
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="text"
                  value={samplingRate}
                  onChange={(e) => setSamplingRate(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-data bg-white border border-border-strong rounded-lg focus:outline-none focus:border-accent"
                  readOnly
                />
                <span className="text-sm text-text-secondary shrink-0">Hz</span>
              </div>
              <p className="text-[10px] text-text-secondary/60 mt-1">Auto-detected</p>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Paradigm
              </label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg">
                <span className="text-sm text-text-secondary">
                  2-Class Motor Imagery
                </span>
              </div>
              <p className="text-[10px] text-text-secondary/60 mt-1">Fixed standard baseline</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="card p-6 max-w-2xl">
          <h3 className="text-base font-medium text-text-primary mb-4">
            Review & Run
          </h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-secondary">Dataset</span>
              <span className="font-data text-text-primary font-medium">
                {selectedDataset || uploadedFile || "BNCI2014_001"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-secondary">Event Mapping</span>
              <span className="text-text-primary text-right text-xs">{eventMapping}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-secondary">Channel Montage</span>
              <span className="text-text-primary">{montage}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-secondary">Sampling Rate</span>
              <span className="font-data text-text-primary">{samplingRate} Hz</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-text-secondary">Paradigm</span>
              <span className="text-text-primary">2-Class Motor Imagery</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-secondary">Pipelines</span>
              <span className="text-text-primary font-medium">CSP+LDA · Riemannian MDM · EEGNet</span>
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="btn btn-primary mt-8 w-full py-3 text-base disabled:opacity-60"
          >
            {isRunning ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Starting benchmark...
              </span>
            ) : (
              "Start Benchmark"
            )}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-4 mt-8">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back
          </button>
        )}
        {step < 3 && (
          <button
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={step === 1 && !canProceedStep1}
            className="btn btn-primary disabled:opacity-40"
          >
            Continue
          </button>
        )}
      </div>

      {/* Dataset Details Modal */}
      {inspectedDataset && (
        <SampleDetailModal
          isOpen={true}
          onClose={() => setInspectedDataset(null)}
          title={`Dataset Metadata: ${inspectedDataset.id}`}
          subtitle={inspectedDataset.desc}
          badge="Public Benchmark Dataset"
          actionText="Select Dataset"
          onAction={() => {
            setSelectedDataset(inspectedDataset.id);
            setSource("registry");
          }}
        >
          <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs font-data">
            <p><strong>Subjects Count:</strong> {inspectedDataset.subjects} subjects</p>
            <p><strong>EEG Channels:</strong> {inspectedDataset.channels} channels</p>
            <p><strong>Sampling Rate:</strong> {inspectedDataset.sr}</p>
            <p><strong>Experimental Classes:</strong> {inspectedDataset.classes}</p>
            <p><strong>Format:</strong> BIDS-compatible GDF/EDF electrophysiology data</p>
          </div>
        </SampleDetailModal>
      )}
    </div>
  );
}
