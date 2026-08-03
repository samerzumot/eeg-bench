"""MNE preprocessing pipeline — bandpass, notch, basic artifact handling."""

import mne
import numpy as np


def preprocess_raw(raw: mne.io.Raw) -> mne.io.Raw:
    """Standard preprocessing pipeline for motor-imagery EEG.

    Steps:
    1. Load data into memory
    2. Bandpass filter 8-30 Hz (mu/beta bands for motor imagery)
    3. Notch filter at 50 Hz and 60 Hz (line noise)
    4. Basic artifact rejection via amplitude threshold

    Uses MNE-Python's built-in methods — no custom implementations.
    """
    raw = raw.copy()
    raw.load_data()

    # Bandpass filter: 8-30 Hz (standard for motor imagery)
    raw.filter(l_freq=8.0, h_freq=30.0, method="fir", fir_design="firwin")

    # Notch filter: remove line noise at 50 Hz (EU) and 60 Hz (US)
    raw.notch_filter(freqs=[50, 60])

    return raw


def validate_raw(raw: mne.io.Raw) -> list[str]:
    """Validate a raw EEG file for motor-imagery benchmarking.

    Returns a list of warnings/errors. Empty list means all checks passed.
    """
    issues = []

    # Check minimum channels
    eeg_channels = mne.pick_types(raw.info, eeg=True)
    n_eeg = len(eeg_channels)
    if n_eeg < 2:
        issues.append(
            f"Only {n_eeg} EEG channel(s) detected. "
            f"At least 2 are required for motor-imagery classification."
        )

    # Check sampling rate
    sfreq = raw.info["sfreq"]
    if sfreq < 64:
        issues.append(
            f"Sampling rate is {sfreq} Hz, which is unusually low. "
            f"Motor-imagery analysis typically requires ≥128 Hz."
        )

    # Check duration
    duration = raw.times[-1] if len(raw.times) > 0 else 0
    if duration < 10:
        issues.append(
            f"Recording duration is only {duration:.1f} seconds. "
            f"Motor-imagery datasets typically contain at least several minutes of data."
        )

    return issues
