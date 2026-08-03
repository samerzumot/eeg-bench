"""Spectral analysis service — EEG power spectral density and band power extraction.

Uses MNE-Python exclusively for PSD computation. No custom DSP.
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Optional


# Standard EEG frequency bands
BANDS = {
    "delta": (1.0, 4.0),
    "theta": (4.0, 8.0),
    "alpha": (8.0, 13.0),
    "beta": (13.0, 30.0),
    "gamma": (30.0, 45.0),
}

# Age-matched normative ranges (μV²/Hz) — simplified adult defaults
# Source: Published EEG normative databases (Thatcher et al., 2003)
NORM_RANGES = {
    "delta": (8.0, 15.0),
    "theta": (6.0, 14.0),
    "alpha": (15.0, 30.0),
    "beta": (8.0, 18.0),
    "gamma": (2.0, 8.0),
}


@dataclass
class BandPower:
    band: str
    fmin: float
    fmax: float
    power: float  # μV²/Hz
    norm_min: float
    norm_max: float
    is_abnormal: bool


@dataclass
class SpectralResult:
    """Full spectral analysis result for an EEG recording."""
    band_powers: list[BandPower]
    alpha_peak_freq: float  # Hz
    alpha_theta_ratio: float
    spectral_entropy: float
    channel_band_powers: dict[str, dict[str, float]]  # ch -> band -> power
    psd_freqs: Optional[np.ndarray] = field(default=None, repr=False)
    psd_values: Optional[np.ndarray] = field(default=None, repr=False)


def compute_spectral_analysis(raw) -> SpectralResult:
    """Run full spectral analysis on an MNE Raw object.

    Args:
        raw: mne.io.Raw — preprocessed EEG data (bandpass filtered, bad channels marked)

    Returns:
        SpectralResult with band powers, alpha peak, entropy, and per-channel breakdown.
    """
    import mne
    from scipy.stats import entropy as scipy_entropy

    # Pick EEG channels only
    raw_eeg = raw.copy().pick("eeg")
    sfreq = raw_eeg.info["sfreq"]

    # Compute PSD using Welch's method (MNE API)
    spectrum = raw_eeg.compute_psd(method="welch", fmin=0.5, fmax=45.0,
                                    n_fft=int(2 * sfreq), n_overlap=int(sfreq))
    psd_data = spectrum.get_data()  # shape: (n_channels, n_freqs)
    freqs = spectrum.freqs

    # Average across channels for global band powers
    mean_psd = psd_data.mean(axis=0)

    # Extract band powers
    band_powers = []
    band_power_values = {}
    for band_name, (fmin, fmax) in BANDS.items():
        mask = (freqs >= fmin) & (freqs <= fmax)
        power = mean_psd[mask].mean() * 1e12  # Convert V²/Hz to μV²/Hz
        norm_min, norm_max = NORM_RANGES[band_name]
        is_abnormal = power < norm_min or power > norm_max
        band_powers.append(BandPower(
            band=band_name, fmin=fmin, fmax=fmax,
            power=round(power, 2), norm_min=norm_min, norm_max=norm_max,
            is_abnormal=is_abnormal,
        ))
        band_power_values[band_name] = power

    # Alpha peak frequency
    alpha_mask = (freqs >= 8.0) & (freqs <= 13.0)
    alpha_psd = mean_psd[alpha_mask]
    alpha_freqs = freqs[alpha_mask]
    alpha_peak_freq = float(alpha_freqs[np.argmax(alpha_psd)]) if len(alpha_psd) > 0 else 10.0

    # Alpha/Theta ratio
    alpha_power = band_power_values.get("alpha", 1.0)
    theta_power = band_power_values.get("theta", 1.0)
    alpha_theta_ratio = round(alpha_power / max(theta_power, 0.001), 2)

    # Spectral entropy (Shannon entropy of normalized PSD)
    psd_norm = mean_psd / mean_psd.sum()
    spectral_ent = round(float(scipy_entropy(psd_norm) / np.log(len(psd_norm))), 3)

    # Per-channel band powers (for topographic maps)
    ch_names = raw_eeg.ch_names
    channel_band_powers: dict[str, dict[str, float]] = {}
    for i, ch in enumerate(ch_names):
        channel_band_powers[ch] = {}
        for band_name, (fmin, fmax) in BANDS.items():
            mask = (freqs >= fmin) & (freqs <= fmax)
            ch_power = psd_data[i, mask].mean() * 1e12
            channel_band_powers[ch][band_name] = round(ch_power, 2)

    return SpectralResult(
        band_powers=band_powers,
        alpha_peak_freq=round(alpha_peak_freq, 1),
        alpha_theta_ratio=alpha_theta_ratio,
        spectral_entropy=spectral_ent,
        channel_band_powers=channel_band_powers,
        psd_freqs=freqs,
        psd_values=mean_psd,
    )
