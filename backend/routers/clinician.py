"""Clinician API router — upload EEG, get analysis reports.

Endpoints:
  POST /api/clinician/upload — upload EEG file with clinical metadata
  GET  /api/clinician/report/{id} — get analysis report
  GET  /api/clinician/report/{id}/status — poll analysis progress
"""

import uuid
import tempfile
import os
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/clinician", tags=["clinician"])


# ── In-memory store (will migrate to Firestore) ────────────────────

_reports: dict[str, dict] = {}


# ── Models ──────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    report_id: str
    status: str
    message: str


class ReportStatus(BaseModel):
    report_id: str
    status: str  # "processing", "complete", "error"
    progress: int  # 0-100
    message: Optional[str] = None


# ── Endpoints ───────────────────────────────────────────────────────

@router.post("/upload", response_model=UploadResponse)
async def upload_eeg(
    file: UploadFile = File(...),
    recording_type: str = Form("resting"),
    patient_id: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
):
    """Upload an EEG file for analysis."""
    # Validate file extension
    valid_exts = {".edf", ".bdf", ".vhdr"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in valid_exts:
        raise HTTPException(400, f"Unsupported file format: {ext}. Use EDF, BDF, or BrainVision.")

    report_id = str(uuid.uuid4())[:8]

    # Save file temporarily
    tmp_dir = tempfile.mkdtemp(prefix="eegbench_")
    file_path = os.path.join(tmp_dir, file.filename or "upload.edf")
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Initialize report entry
    _reports[report_id] = {
        "id": report_id,
        "status": "processing",
        "progress": 0,
        "file_path": file_path,
        "filename": file.filename,
        "recording_type": recording_type,
        "patient_id": patient_id,
        "age": age,
        "created_at": datetime.utcnow().isoformat(),
        "result": None,
    }

    # Process in background (for now, run synchronously for demo)
    try:
        _process_eeg(report_id)
    except Exception as e:
        _reports[report_id]["status"] = "error"
        _reports[report_id]["message"] = str(e)

    return UploadResponse(
        report_id=report_id,
        status=_reports[report_id]["status"],
        message="Analysis complete" if _reports[report_id]["status"] == "complete" else "Processing",
    )


@router.get("/report/{report_id}/status", response_model=ReportStatus)
async def get_report_status(report_id: str):
    """Check analysis progress."""
    if report_id not in _reports:
        raise HTTPException(404, "Report not found")

    r = _reports[report_id]
    return ReportStatus(
        report_id=report_id,
        status=r["status"],
        progress=r.get("progress", 0),
        message=r.get("message"),
    )


@router.get("/report/{report_id}")
async def get_report(report_id: str):
    """Get the full analysis report."""
    # Return demo data for "demo" ID
    if report_id == "demo":
        return _get_demo_report()

    if report_id not in _reports:
        raise HTTPException(404, "Report not found")

    r = _reports[report_id]
    if r["status"] != "complete":
        raise HTTPException(202, detail="Report still processing")

    return r["result"]


# ── Processing ──────────────────────────────────────────────────────

def _process_eeg(report_id: str):
    """Process an uploaded EEG file through the full analysis pipeline."""
    import mne

    report = _reports[report_id]
    file_path = report["file_path"]

    # Step 1: Load file
    report["progress"] = 10
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".edf":
        raw = mne.io.read_raw_edf(file_path, preload=True, verbose=False)
    elif ext == ".bdf":
        raw = mne.io.read_raw_bdf(file_path, preload=True, verbose=False)
    elif ext == ".vhdr":
        raw = mne.io.read_raw_brainvision(file_path, preload=True, verbose=False)
    else:
        raise ValueError(f"Unsupported format: {ext}")

    # Step 2: Preprocess
    report["progress"] = 30
    raw.filter(l_freq=0.5, h_freq=45.0, verbose=False)
    raw.notch_filter([50, 60], verbose=False)

    # Step 3: Spectral analysis
    report["progress"] = 50
    from services.spectral_analysis import compute_spectral_analysis
    spectral = compute_spectral_analysis(raw)

    # Step 4: Brain health score
    report["progress"] = 70
    from services.brain_health_scorer import compute_brain_health_score

    # Compute asymmetry
    left_alpha = []
    right_alpha = []
    for ch, powers in spectral.channel_band_powers.items():
        a = powers.get("alpha", 0)
        if ch.endswith(("1", "3", "5", "7")):
            left_alpha.append(a)
        elif ch.endswith(("2", "4", "6", "8")):
            right_alpha.append(a)

    l_mean = sum(left_alpha) / max(len(left_alpha), 1)
    r_mean = sum(right_alpha) / max(len(right_alpha), 1)
    total = l_mean + r_mean
    asym = abs(l_mean - r_mean) / max(total / 2, 0.001) * 100 if total > 0 else 0

    health = compute_brain_health_score(spectral, asymmetry_pct=asym)

    # Step 5: Pattern detection
    report["progress"] = 85
    from services.pattern_detection import detect_patterns
    patterns = detect_patterns(spectral)

    # Step 6: Build result
    report["progress"] = 100
    report["status"] = "complete"
    report["result"] = {
        "recording": {
            "filename": report["filename"],
            "duration": f"{raw.times[-1]:.0f} sec",
            "sampling_rate": raw.info["sfreq"],
            "channels": len(raw.ch_names),
            "montage": "Standard 10-20" if len(raw.ch_names) >= 19 else "Custom",
            "recording_type": report["recording_type"],
        },
        "brain_health_score": health.composite_score,
        "brain_health_summary": health.summary,
        "biomarkers": [
            {
                "name": bm.name,
                "value": bm.value,
                "unit": bm.unit,
                "norm_range": bm.norm_range,
                "status": bm.status,
                "sub_score": round(bm.sub_score, 1),
            }
            for bm in health.biomarkers
        ],
        "spectral_bands": [
            {
                "band": bp.band,
                "power": bp.power,
                "norm_min": bp.norm_min,
                "norm_max": bp.norm_max,
                "is_abnormal": bp.is_abnormal,
            }
            for bp in spectral.band_powers
        ],
        "alpha_topo": {
            ch: powers.get("alpha", 0)
            for ch, powers in spectral.channel_band_powers.items()
        },
        "patterns": [
            {
                "name": p.name,
                "severity": p.severity,
                "description": p.description,
                "regions": p.regions,
                "recommendation": p.recommendation,
            }
            for p in patterns
        ],
    }


def _get_demo_report() -> dict:
    """Return pre-computed demo report data."""
    return {
        "recording": {
            "filename": "patient_resting_state_001.edf",
            "duration": "312 sec",
            "sampling_rate": 256,
            "channels": 19,
            "montage": "Standard 10-20",
            "recording_type": "Resting-state (eyes closed)",
        },
        "brain_health_score": 72,
        "brain_health_summary": "Mild abnormalities detected in select biomarkers. Clinical correlation recommended.",
        "biomarkers": [
            {"name": "Alpha Peak Frequency", "value": 9.2, "unit": "Hz", "norm_range": "8.5–12.5 Hz", "status": "normal", "sub_score": 100},
            {"name": "Alpha/Theta Ratio", "value": 1.8, "unit": "", "norm_range": "> 2.0", "status": "mild", "sub_score": 58.3},
            {"name": "Delta Power", "value": 18.5, "unit": "μV²/Hz", "norm_range": "< 15 μV²/Hz", "status": "mild", "sub_score": 53.3},
            {"name": "Beta Power", "value": 12.3, "unit": "μV²/Hz", "norm_range": "8–18 μV²/Hz", "status": "normal", "sub_score": 100},
            {"name": "Spectral Entropy", "value": 0.74, "unit": "", "norm_range": "0.70–0.90", "status": "normal", "sub_score": 100},
            {"name": "Coherence", "value": 0.62, "unit": "", "norm_range": "0.55–0.80", "status": "normal", "sub_score": 100},
            {"name": "Amplitude Asymmetry", "value": 8.2, "unit": "%", "norm_range": "< 15%", "status": "normal", "sub_score": 100},
        ],
        "spectral_bands": [
            {"band": "delta", "power": 18.5, "norm_min": 8.0, "norm_max": 15.0, "is_abnormal": True},
            {"band": "theta", "power": 12.1, "norm_min": 6.0, "norm_max": 14.0, "is_abnormal": False},
            {"band": "alpha", "power": 22.4, "norm_min": 15.0, "norm_max": 30.0, "is_abnormal": False},
            {"band": "beta", "power": 12.3, "norm_min": 8.0, "norm_max": 18.0, "is_abnormal": False},
            {"band": "gamma", "power": 4.2, "norm_min": 2.0, "norm_max": 8.0, "is_abnormal": False},
        ],
        "alpha_topo": {
            "Fp1": 8.2, "Fp2": 9.1, "F7": 10.5, "F3": 12.8, "Fz": 11.2, "F4": 13.1, "F8": 10.8,
            "T3": 9.5, "C3": 14.2, "Cz": 13.8, "C4": 14.5, "T4": 9.8,
            "T5": 15.2, "P3": 20.1, "Pz": 19.5, "P4": 21.3, "T6": 15.8,
            "O1": 25.4, "O2": 26.1,
        },
        "patterns": [
            {
                "name": "Mild Delta Excess",
                "severity": "mild",
                "description": "Delta band power (18.5 μV²/Hz) exceeds normative range (< 15 μV²/Hz). This may indicate mild diffuse slowing.",
                "regions": "Diffuse — frontal predominance",
                "recommendation": "Consider correlating with clinical history and cognitive screening.",
            },
            {
                "name": "Reduced Alpha/Theta Ratio",
                "severity": "mild",
                "description": "Alpha/theta ratio of 1.8 is below the typical threshold of 2.0.",
                "regions": "Posterior channels (P3, Pz, P4, O1, O2)",
                "recommendation": "May warrant follow-up with neuropsychological assessment if clinically indicated.",
            },
        ],
    }
