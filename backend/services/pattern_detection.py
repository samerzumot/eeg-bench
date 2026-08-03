"""Pattern detection service — heuristic-based clinical EEG pattern flagging.

Each detector returns a PatternFinding if the pattern is present.
These are threshold-based heuristics, NOT diagnostic algorithms.
"""

from dataclasses import dataclass
from typing import Optional
from services.spectral_analysis import SpectralResult, BANDS


@dataclass
class PatternFinding:
    name: str
    severity: str  # "info", "mild", "moderate", "significant"
    description: str
    regions: Optional[str] = None
    recommendation: Optional[str] = None


def detect_patterns(spectral: SpectralResult) -> list[PatternFinding]:
    """Run all pattern detectors on a SpectralResult.

    Args:
        spectral: SpectralResult from compute_spectral_analysis()

    Returns:
        List of PatternFindings, sorted by severity (most severe first).
    """
    findings: list[PatternFinding] = []

    findings.extend(_detect_generalized_slowing(spectral))
    findings.extend(_detect_delta_excess(spectral))
    findings.extend(_detect_alpha_asymmetry(spectral))
    findings.extend(_detect_beta_excess(spectral))
    findings.extend(_detect_reduced_alpha_theta(spectral))
    findings.extend(_detect_low_spectral_entropy(spectral))

    # Sort by severity
    severity_order = {"significant": 0, "moderate": 1, "mild": 2, "info": 3}
    findings.sort(key=lambda f: severity_order.get(f.severity, 4))

    return findings


def _detect_generalized_slowing(s: SpectralResult) -> list[PatternFinding]:
    """Dominant frequency below 8 Hz indicates generalized slowing."""
    if s.alpha_peak_freq < 8.0:
        severity = "significant" if s.alpha_peak_freq < 6.0 else "moderate" if s.alpha_peak_freq < 7.0 else "mild"
        return [PatternFinding(
            name="Generalized Slowing",
            severity=severity,
            description=f"Dominant alpha peak frequency is {s.alpha_peak_freq} Hz (normal: 8.5–12.5 Hz). "
                        "Generalized slowing may indicate encephalopathy, medication effects, or neurodegenerative changes.",
            regions="Diffuse — posterior predominance",
            recommendation="Correlate with clinical context. Consider neurological evaluation if new finding.",
        )]
    return []


def _detect_delta_excess(s: SpectralResult) -> list[PatternFinding]:
    """Excessive delta power (> 15% of total) suggests structural or metabolic pathology."""
    delta_bp = next((bp for bp in s.band_powers if bp.band == "delta"), None)
    if delta_bp and delta_bp.is_abnormal and delta_bp.power > delta_bp.norm_max:
        excess_pct = round(((delta_bp.power - delta_bp.norm_max) / delta_bp.norm_max) * 100)
        severity = "moderate" if excess_pct > 50 else "mild"
        return [PatternFinding(
            name="Delta Excess",
            severity=severity,
            description=f"Delta band power ({delta_bp.power} μV²/Hz) exceeds normative range "
                        f"(< {delta_bp.norm_max} μV²/Hz). Excess delta may indicate drowsiness, "
                        "medications, metabolic encephalopathy, or structural pathology.",
            regions="Diffuse — frontal predominance" if not _check_focal_delta(s) else "Focal",
            recommendation="Consider correlating with clinical history and cognitive screening.",
        )]
    return []


def _check_focal_delta(s: SpectralResult) -> bool:
    """Check if delta excess is focal (>2x variation between hemispheres)."""
    left_chs = [ch for ch in s.channel_band_powers if ch.endswith(("1", "3", "5", "7"))]
    right_chs = [ch for ch in s.channel_band_powers if ch.endswith(("2", "4", "6", "8"))]

    if not left_chs or not right_chs:
        return False

    left_delta = sum(s.channel_band_powers[ch].get("delta", 0) for ch in left_chs) / len(left_chs)
    right_delta = sum(s.channel_band_powers[ch].get("delta", 0) for ch in right_chs) / len(right_chs)

    ratio = max(left_delta, right_delta) / max(min(left_delta, right_delta), 0.001)
    return ratio > 2.0


def _detect_alpha_asymmetry(s: SpectralResult) -> list[PatternFinding]:
    """Alpha amplitude asymmetry > 30% between hemispheres."""
    left_alpha = []
    right_alpha = []

    for ch, powers in s.channel_band_powers.items():
        alpha = powers.get("alpha", 0)
        if ch.endswith(("1", "3", "5", "7")):
            left_alpha.append(alpha)
        elif ch.endswith(("2", "4", "6", "8")):
            right_alpha.append(alpha)

    if not left_alpha or not right_alpha:
        return []

    left_mean = sum(left_alpha) / len(left_alpha)
    right_mean = sum(right_alpha) / len(right_alpha)
    total = left_mean + right_mean
    if total == 0:
        return []

    asymmetry_pct = abs(left_mean - right_mean) / (total / 2) * 100

    if asymmetry_pct > 30:
        lower_side = "left" if left_mean < right_mean else "right"
        severity = "moderate" if asymmetry_pct > 50 else "mild"
        return [PatternFinding(
            name="Alpha Asymmetry",
            severity=severity,
            description=f"Alpha power asymmetry of {asymmetry_pct:.0f}% detected (threshold: 30%). "
                        f"Reduced alpha on the {lower_side} hemisphere may indicate focal pathology.",
            regions=f"{lower_side.capitalize()} hemisphere — posterior channels",
            recommendation="Structural imaging may be indicated to rule out focal lesion.",
        )]
    return []


def _detect_beta_excess(s: SpectralResult) -> list[PatternFinding]:
    """Beta power > 2 SD above norm (> normMax)."""
    beta_bp = next((bp for bp in s.band_powers if bp.band == "beta"), None)
    if beta_bp and beta_bp.is_abnormal and beta_bp.power > beta_bp.norm_max:
        return [PatternFinding(
            name="Beta Excess",
            severity="info",
            description=f"Beta band power ({beta_bp.power} μV²/Hz) exceeds normative range "
                        f"(< {beta_bp.norm_max} μV²/Hz). Commonly seen with benzodiazepines, "
                        "barbiturates, or anxiety states.",
            regions="Diffuse — frontal predominance",
            recommendation="Review medication history. Often a medication artifact.",
        )]
    return []


def _detect_reduced_alpha_theta(s: SpectralResult) -> list[PatternFinding]:
    """Alpha/theta ratio < 2.0 suggests reduced alertness or cognitive slowing."""
    if s.alpha_theta_ratio < 2.0:
        severity = "moderate" if s.alpha_theta_ratio < 1.0 else "mild"
        return [PatternFinding(
            name="Reduced Alpha/Theta Ratio",
            severity=severity,
            description=f"Alpha/theta ratio of {s.alpha_theta_ratio} is below the typical threshold "
                        "of 2.0. May indicate drowsiness, reduced alertness, or early cognitive changes.",
            regions="Posterior channels",
            recommendation="May warrant follow-up with neuropsychological assessment if clinically indicated.",
        )]
    return []


def _detect_low_spectral_entropy(s: SpectralResult) -> list[PatternFinding]:
    """Spectral entropy < 0.70 suggests reduced brain complexity."""
    if s.spectral_entropy < 0.70:
        severity = "moderate" if s.spectral_entropy < 0.50 else "mild"
        return [PatternFinding(
            name="Low Spectral Entropy",
            severity=severity,
            description=f"Spectral entropy of {s.spectral_entropy} is below the normative range "
                        "(0.70–0.90). Reduced spectral entropy may indicate decreased consciousness, "
                        "sedation, or focal pathology.",
            regions="Global",
            recommendation="Correlate with level of consciousness and medication status.",
        )]
    return []
