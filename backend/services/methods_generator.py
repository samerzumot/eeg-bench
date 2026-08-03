"""Methods paragraph generator — produces plain-language text suitable for a manuscript."""


def generate_methods(dataset_name: str, results: dict) -> str:
    """Generate a plain-language methods paragraph with citations.

    Template-based (no LLM) for deterministic, citable output.
    """
    versions = results.get("library_versions", {})
    mne_v = versions.get("mne", "1.7.0")
    moabb_v = versions.get("moabb", "1.1.0")
    pyriemann_v = versions.get("pyriemann", "0.5")
    sklearn_v = versions.get("scikit-learn", "1.4.0")

    # Determine dataset details
    dataset_details = _DATASET_DESCRIPTIONS.get(dataset_name, f"the {dataset_name} dataset")

    pipelines_info = results.get("pipelines", {})
    pipeline_names = list(pipelines_info.keys())
    n_subjects = 0
    for p in pipelines_info.values():
        per_subj = p.get("per_subject", {})
        if per_subj:
            n_subjects = max(n_subjects, len(per_subj))

    methods = (
        f"EEG signals were preprocessed using MNE-Python v{mne_v} "
        f"(Gramfort et al., 2013), including bandpass filtering (8–30 Hz) and "
        f"50/60 Hz notch filtering. "
        f"Classification was performed using three pipelines: "
        f"(1) Common Spatial Patterns with Linear Discriminant Analysis (CSP+LDA; "
        f"scikit-learn v{sklearn_v}), "
        f"(2) Riemannian Minimum Distance to Mean (MDM) via pyRiemann v{pyriemann_v} "
        f"(Barachant et al., 2013), and "
        f"(3) EEGNet v4 via Braindecode (Schirrmeister et al., 2017). "
        f"Evaluation used within-session cross-validation as implemented by "
        f"MOABB v{moabb_v} (Jayaram & Barachant, 2018). "
        f"Data was sourced from {dataset_details}."
    )

    # Add results summary
    for pname, pdata in pipelines_info.items():
        acc = pdata.get("mean_accuracy", 0)
        ci = pdata.get("ci", 0)
        methods += f" {pname} achieved {acc:.1f}% ± {ci:.1f}% accuracy."

    return methods


_DATASET_DESCRIPTIONS = {
    "BNCI2014_001": (
        "the BNCI2014_001 dataset (Tangermann et al., 2012; "
        "9 subjects, 22 EEG channels, 2-class motor imagery: left hand vs. right hand)"
    ),
    "BNCI2014_004": (
        "the BNCI2014_004 dataset (Leeb et al., 2007; "
        "9 subjects, 3 EEG channels, 2-class motor imagery)"
    ),
    "Cho2017": (
        "the Cho2017 dataset (Cho et al., 2017; "
        "52 subjects, 64 EEG channels, 2-class motor imagery)"
    ),
}
