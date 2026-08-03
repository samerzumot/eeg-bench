"""Brain Health Scorer — composite 0-100 score from EEG biomarkers.

Weighted combination of 7 biomarkers with age-normalized ranges.
The score is for RESEARCH PURPOSES ONLY.
"""

from dataclasses import dataclass
from services.spectral_analysis import SpectralResult


@dataclass
class BiomarkerScore:
    name: str
    value: float
    unit: str
    norm_range: str
    sub_score: float  # 0-100 for this biomarker
    status: str  # "normal", "mild", "moderate", "significant"
    weight: float


@dataclass
class BrainHealthResult:
    composite_score: int  # 0-100
    biomarkers: list[BiomarkerScore]
    confidence: str  # "high", "moderate", "low"
    summary: str


# Biomarker weights (must sum to 1.0)
WEIGHTS = {
    "alpha_peak_freq": 0.20,
    "alpha_theta_ratio": 0.18,
    "delta_excess": 0.15,
    "beta_power": 0.10,
    "spectral_entropy": 0.15,
    "coherence": 0.12,
    "asymmetry": 0.10,
}


def _score_biomarker(value: float, optimal_min: float, optimal_max: float,
                      critical_low: float, critical_high: float) -> tuple[float, str]:
    """Score a single biomarker on 0-100 scale.

    100 = within optimal range, 0 = at or beyond critical thresholds.
    """
    if optimal_min <= value <= optimal_max:
        return 100.0, "normal"

    # Below optimal
    if value < optimal_min:
        if value <= critical_low:
            return 0.0, "significant"
        range_size = optimal_min - critical_low
        score = ((value - critical_low) / range_size) * 100
        status = "mild" if score > 50 else "moderate"
        return max(0, min(100, score)), status

    # Above optimal
    if value > optimal_max:
        if value >= critical_high:
            return 0.0, "significant"
        range_size = critical_high - optimal_max
        score = ((critical_high - value) / range_size) * 100
        status = "mild" if score > 50 else "moderate"
        return max(0, min(100, score)), status

    return 50.0, "mild"


def compute_brain_health_score(spectral: SpectralResult,
                                asymmetry_pct: float = 5.0,
                                coherence: float = 0.65) -> BrainHealthResult:
    """Compute composite Brain Health Score from spectral analysis results.

    Args:
        spectral: SpectralResult from compute_spectral_analysis()
        asymmetry_pct: Inter-hemispheric alpha amplitude asymmetry (%)
        coherence: Average inter-hemispheric coherence (0-1)

    Returns:
        BrainHealthResult with composite score and per-biomarker breakdown.
    """
    biomarkers: list[BiomarkerScore] = []

    # 1. Alpha Peak Frequency (optimal: 8.5-12.5 Hz)
    apf_score, apf_status = _score_biomarker(
        spectral.alpha_peak_freq, 8.5, 12.5, 4.0, 14.0)
    biomarkers.append(BiomarkerScore(
        name="Alpha Peak Frequency", value=spectral.alpha_peak_freq, unit="Hz",
        norm_range="8.5–12.5 Hz", sub_score=apf_score, status=apf_status,
        weight=WEIGHTS["alpha_peak_freq"],
    ))

    # 2. Alpha/Theta Ratio (optimal: 2.0-4.0)
    atr_score, atr_status = _score_biomarker(
        spectral.alpha_theta_ratio, 2.0, 4.0, 0.5, 6.0)
    biomarkers.append(BiomarkerScore(
        name="Alpha/Theta Ratio", value=spectral.alpha_theta_ratio, unit="",
        norm_range="> 2.0", sub_score=atr_score, status=atr_status,
        weight=WEIGHTS["alpha_theta_ratio"],
    ))

    # 3. Delta Power (optimal: 8-15 μV²/Hz — lower is better in waking)
    delta_bp = next((bp for bp in spectral.band_powers if bp.band == "delta"), None)
    delta_val = delta_bp.power if delta_bp else 10.0
    delta_score, delta_status = _score_biomarker(delta_val, 8.0, 15.0, 0.0, 30.0)
    biomarkers.append(BiomarkerScore(
        name="Delta Power", value=delta_val, unit="μV²/Hz",
        norm_range="< 15 μV²/Hz", sub_score=delta_score, status=delta_status,
        weight=WEIGHTS["delta_excess"],
    ))

    # 4. Beta Power (optimal: 8-18 μV²/Hz)
    beta_bp = next((bp for bp in spectral.band_powers if bp.band == "beta"), None)
    beta_val = beta_bp.power if beta_bp else 12.0
    beta_score, beta_status = _score_biomarker(beta_val, 8.0, 18.0, 2.0, 35.0)
    biomarkers.append(BiomarkerScore(
        name="Beta Power", value=beta_val, unit="μV²/Hz",
        norm_range="8–18 μV²/Hz", sub_score=beta_score, status=beta_status,
        weight=WEIGHTS["beta_power"],
    ))

    # 5. Spectral Entropy (optimal: 0.70-0.90)
    se_score, se_status = _score_biomarker(
        spectral.spectral_entropy, 0.70, 0.90, 0.30, 0.98)
    biomarkers.append(BiomarkerScore(
        name="Spectral Entropy", value=spectral.spectral_entropy, unit="",
        norm_range="0.70–0.90", sub_score=se_score, status=se_status,
        weight=WEIGHTS["spectral_entropy"],
    ))

    # 6. Coherence (optimal: 0.55-0.80)
    coh_score, coh_status = _score_biomarker(coherence, 0.55, 0.80, 0.20, 0.95)
    biomarkers.append(BiomarkerScore(
        name="Coherence", value=coherence, unit="",
        norm_range="0.55–0.80", sub_score=coh_score, status=coh_status,
        weight=WEIGHTS["coherence"],
    ))

    # 7. Asymmetry (optimal: < 15% — lower is better)
    asym_score, asym_status = _score_biomarker(asymmetry_pct, 0.0, 15.0, 0.0, 50.0)
    biomarkers.append(BiomarkerScore(
        name="Amplitude Asymmetry", value=asymmetry_pct, unit="%",
        norm_range="< 15%", sub_score=asym_score, status=asym_status,
        weight=WEIGHTS["asymmetry"],
    ))

    # Compute weighted composite score
    composite = sum(bm.sub_score * bm.weight for bm in biomarkers)
    composite_int = max(0, min(100, round(composite)))

    # Confidence assessment
    n_abnormal = sum(1 for bm in biomarkers if bm.status != "normal")
    confidence = "high" if n_abnormal <= 1 else "moderate" if n_abnormal <= 3 else "low"

    # Generate summary
    if composite_int >= 80:
        summary = "EEG metrics are within normal limits. No significant abnormalities detected."
    elif composite_int >= 60:
        summary = "Mild abnormalities detected in select biomarkers. Clinical correlation recommended."
    elif composite_int >= 40:
        summary = "Moderate abnormalities across multiple biomarkers. Neurological evaluation suggested."
    else:
        summary = "Significant abnormalities detected. Urgent neurological assessment recommended."

    return BrainHealthResult(
        composite_score=composite_int,
        biomarkers=biomarkers,
        confidence=confidence,
        summary=summary,
    )
