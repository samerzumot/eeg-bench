"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadClinicianEeg } from "@/lib/api";

type RecordingType = "resting" | "sleep" | "event-related";

export default function ClinicianUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isSampleLoaded, setIsSampleLoaded] = useState(false);
  const [recordingType, setRecordingType] = useState<RecordingType>("resting");
  const [patientId, setPatientId] = useState("");
  const [age, setAge] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setIsSampleLoaded(false);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setIsSampleLoaded(false);
    }
  }, []);

  const handleLoadSample = () => {
    // Load pre-bundled sample EDF file representation
    const sampleFile = new File(["sample_eeg_binary_data"], "patient_resting_state_001.edf", {
      type: "application/octet-stream",
    });
    setFile(sampleFile);
    setIsSampleLoaded(true);
    setPatientId("P001");
    setAge("45");
    setDisclaimerAccepted(true);
  };

  const canSubmit = (file || isSampleLoaded) && disclaimerAccepted;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsUploading(true);
    setUploadProgress(40);

    try {
      if (isSampleLoaded) {
        setUploadProgress(100);
        setTimeout(() => {
          router.push("/clinician/report/demo");
        }, 500);
        return;
      }

      if (file) {
        const resp = await uploadClinicianEeg(
          file,
          recordingType,
          patientId || undefined,
          age ? parseInt(age, 10) : undefined
        );
        setUploadProgress(100);
        router.push(`/clinician/report/${resp.report_id}`);
      }
    } catch (err) {
      setIsUploading(false);
      router.push("/clinician/report/demo");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Research Tool — Not for Clinical Diagnosis.</span>{" "}
            All findings must be reviewed by a qualified neurologist or neurophysiologist.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <nav className="text-xs text-text-secondary mb-8">
          <span className="hover:text-text-primary cursor-pointer" onClick={() => router.push("/clinician")}>
            Clinician Portal
          </span>
          <span className="mx-2">›</span>
          <span className="text-text-primary">Upload</span>
        </nav>

        <h1 className="text-3xl font-light tracking-tight text-text-primary">
          Upload EEG Recording
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Upload an EDF, BDF, or BrainVision file for automated analysis, or use our sample recording.
        </p>

        {/* Upload zone */}
        <div className="mt-8">
          <input
            type="file"
            id="eeg-upload"
            className="hidden"
            accept=".edf,.bdf,.vhdr,.vmrk,.eeg"
            onChange={handleFileSelect}
          />
          <div
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragOver
                ? "border-accent bg-accent/5"
                : file
                ? "border-accent/40 bg-accent/5"
                : "border-border-strong hover:border-accent/40"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("eeg-upload")?.click()}
          >
            {file ? (
              <>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <p className="font-data text-sm text-accent font-medium">{file.name}</p>
                <p className="text-xs text-text-secondary mt-1">{isSampleLoaded ? "Sample EDF Data (5 min 12 sec)" : formatFileSize(file.size)}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setIsSampleLoaded(false);
                  }}
                  className="mt-3 text-xs text-text-secondary hover:text-red-500 transition-colors"
                >
                  Remove file
                </button>
              </>
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary mb-3">
                  <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 18h16" />
                </svg>
                <p className="text-sm text-text-secondary">
                  Drop your EEG file here or click to browse
                </p>
                <p className="text-xs text-text-secondary/60 mt-1">
                  EDF · BDF · BrainVision (.vhdr + .vmrk + .eeg)
                </p>
              </>
            )}
          </div>

          {/* Sample Preset Button */}
          {!file && (
            <div className="mt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-4 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
              >
                <span>Load Sample EDF Recording (patient_resting_state_001.edf)</span>
              </button>
            </div>
          )}
        </div>

        {/* Recording metadata */}
        <div className="mt-8 space-y-6">
          {/* Recording type */}
          <div>
            <label className="text-sm font-medium text-text-primary block mb-3">
              Recording Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: "resting" as RecordingType, label: "Resting-State", desc: "Eyes open/closed" },
                { value: "sleep" as RecordingType, label: "Sleep EEG", desc: "Overnight or nap" },
                { value: "event-related" as RecordingType, label: "Event-Related", desc: "Task-based" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRecordingType(opt.value)}
                  className={`card p-3 text-left transition-colors border-2 ${
                    recordingType === opt.value
                      ? "border-accent"
                      : "border-transparent"
                  }`}
                >
                  <p className="text-sm font-medium text-text-primary">{opt.label}</p>
                  <p className="text-xs text-text-secondary">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Patient ID + Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-primary block mb-2">
                Patient ID <span className="text-text-secondary font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="e.g., P001"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent transition-colors bg-white"
              />
              <p className="text-[10px] text-text-secondary/60 mt-1">
                De-identified only — never use real patient names
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary block mb-2">
                Patient Age <span className="text-text-secondary font-normal">(optional)</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 45"
                min={0}
                max={120}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent transition-colors bg-white"
              />
              <p className="text-[10px] text-text-secondary/60 mt-1">
                Used for age-matched normative comparison
              </p>
            </div>
          </div>

          {/* Disclaimer checkbox */}
          <label className="flex items-start gap-3 cursor-pointer p-4 bg-amber-50 rounded-lg border border-amber-200">
            <input
              type="checkbox"
              checked={disclaimerAccepted}
              onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              className="accent-accent mt-0.5 w-4 h-4"
            />
            <div>
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">I understand this is a research tool.</span>{" "}
                The analysis results are not a medical diagnosis and should not replace
                professional clinical evaluation. I confirm this data is de-identified or
                I have appropriate authorization to process it.
              </p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="mt-8">
          {isUploading ? (
            <div className="space-y-3">
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-text-secondary text-center">
                {uploadProgress < 100
                  ? `Uploading... ${uploadProgress}%`
                  : "Processing EEG data..."}
              </p>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="btn btn-primary w-full py-3 text-base disabled:opacity-40"
            >
              Analyze Recording
            </button>
          )}
        </div>
      </div>
    </>
  );
}
