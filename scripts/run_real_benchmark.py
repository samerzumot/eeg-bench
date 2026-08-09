#!/usr/bin/env python3
"""
Executes real MOABB WithinSessionEvaluation on BNCI2014_001 dataset
and outputs the exact results to JSON for client-side instant retrieval.

IMPORTANT: moabb_reference MUST be independent published baselines,
NOT copied from this run's own results (that would be a circular comparison).
"""

import os
import json
import numpy as np
from datetime import datetime, timezone

import mne
import moabb
import pyriemann
import sklearn

from moabb.datasets import BNCI2014_001
from moabb.paradigms import MotorImagery
from moabb.evaluations import WithinSessionEvaluation

from pyriemann.estimation import Covariances
from pyriemann.classification import MDM
from mne.decoding import CSP
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.pipeline import Pipeline

def run_real_evaluation():
    print("Initializing MOABB evaluation on BNCI2014_001 dataset...")
    mne.set_config('MNE_DATA', '/tmp/mne_data', set_env=True)
    mne.set_log_level('WARNING')
    
    dataset = BNCI2014_001()
    paradigm = MotorImagery(events=["left_hand", "right_hand"], n_classes=2, fmin=8, fmax=30)
    
    pipelines = {
        "CSP + LDA": Pipeline([
            ("CSP", CSP(n_components=8)),
            ("LDA", LDA()),
        ]),
        "Riemannian MDM": Pipeline([
            ("Covariances", Covariances(estimator="oas")),
            ("MDM", MDM(metric={"mean": "riemann", "distance": "riemann"})),
        ]),
    }
    
    evaluation = WithinSessionEvaluation(
        paradigm=paradigm,
        datasets=[dataset],
        overwrite=True,
    )
    
    print("Running evaluation across all subjects...")
    results_df = evaluation.process(pipelines)
    
    pipeline_results = {}
    for pipeline_name in pipelines:
        pdf = results_df[results_df["pipeline"] == pipeline_name]
        per_subject = {}
        for _, row in pdf.iterrows():
            subj_id = f"S{int(row['subject']):02d}"
            per_subject[subj_id] = round(float(row["score"]) * 100, 1)
            
        scores = pdf["score"].values * 100
        pipeline_results[pipeline_name] = {
            "mean_accuracy": round(float(np.mean(scores)), 1),
            "ci": round(float(np.std(scores) / np.sqrt(len(scores)) * 1.96), 1),
            "per_subject": per_subject,
        }
        
    # EEGNet: label honestly — these are pre-committed numbers with no
    # training/inference code in this repo. Provenance is unverified.
    pipeline_results["EEGNet"] = {
        "mean_accuracy": 83.1,
        "ci": 2.5,
        "provenance": "unverified_precomputed",
        "provenance_note": "EEGNet numbers committed 2026-08-03 — no training/inference code found in repo. Pending verification.",
        "per_subject": {
            "S01": 79.3, "S02": 87.0, "S03": 75.0, "S04": 83.5,
            "S05": 80.0, "S06": 82.0, "S07": 85.8, "S08": 79.1, "S09": 81.5,
        },
    }
    
    # MOABB reference: INDEPENDENTLY published baseline figures.
    # Source: Jayaram & Barachant (2018), "MOABB: trustworthy algorithm
    # benchmarking for BCIs", J. Neural Eng. 15(6), 066011.
    # These MUST NOT be copied from this run's own results.
    moabb_reference = {
        "BNCI2014_001": {
            "source": "Jayaram & Barachant 2018, J. Neural Eng. 15(6), 066011 / MOABB leaderboard",
            "CSP+LDA": {"mean_accuracy": 76.8},
            "Riemannian MDM": {"mean_accuracy": 80.2},
        }
    }
    
    output_data = {
        "dataset": "BNCI2014_001",
        "isSample": False,
        "isPrecomputedReal": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "results": {
            "pipelines": pipeline_results,
            "moabb_reference": moabb_reference,
            "library_versions": {
                "mne": mne.__version__,
                "moabb": moabb.__version__,
                "pyriemann": pyriemann.__version__,
                "scikit-learn": sklearn.__version__,
            }
        }
    }
    
    out_file = os.path.abspath("frontend/lib/precomputed_results.json")
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w") as f:
        json.dump(output_data, f, indent=2)
    print(f"Successfully generated real benchmark results at: {out_file}")

if __name__ == "__main__":
    run_real_evaluation()
