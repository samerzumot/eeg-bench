from __future__ import annotations

"""Resolution Recovery benchmark API router.

Handles demo and future custom benchmark requests for the signal-to-signal
reconstruction track. Follows the same job persistence pattern as the
classification benchmark router.
"""

import uuid
import asyncio
import os
import json
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from services.resolution_recovery_runner import run_resolution_recovery_benchmark

router = APIRouter()

# Reuse the same jobs directory as the classification benchmark
JOBS_DIR = "/tmp/eegbench_jobs"
os.makedirs(JOBS_DIR, exist_ok=True)

# In-memory job store (same pattern as benchmark.py)
_jobs: dict[str, dict] = {}


def save_job(job_id: str, data: dict):
    """Save job state to memory and local disk."""
    _jobs[job_id] = data
    try:
        filepath = os.path.join(JOBS_DIR, f"rr_{job_id}.json")
        with open(filepath, "w") as f:
            json.dump(data, f)
    except Exception as e:
        print(f"[Resolution Recovery Jobs] Failed to persist job {job_id}: {e}")


def get_job(job_id: str) -> dict | None:
    """Retrieve job state from memory or local disk."""
    if job_id in _jobs:
        return _jobs[job_id]

    filepath = os.path.join(JOBS_DIR, f"rr_{job_id}.json")
    if os.path.exists(filepath):
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
                _jobs[job_id] = data
                return data
        except Exception:
            pass

    return None


def load_precomputed_resolution_results() -> dict | None:
    """Load pre-computed resolution recovery results for instant demo."""
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "services", "precomputed_resolution_results.json"),
        "precomputed_resolution_results.json",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                with open(p, "r") as f:
                    data = json.load(f)
                    return data.get("results")
            except Exception as e:
                print(f"[Resolution Recovery] Error loading precomputed file {p}: {e}")
    return None


class ResolutionRecoveryDemoRequest(BaseModel):
    """Request to run the resolution recovery demo benchmark."""
    dataset: str = "synthetic_placeholder"


@router.post("/demo")
async def start_demo(request: ResolutionRecoveryDemoRequest, background_tasks: BackgroundTasks):
    """Start the resolution recovery demo benchmark.

    Returns pre-computed baseline results instantly for the default synthetic dataset.
    """
    job_id = f"rr-{str(uuid.uuid4())[:8]}"

    # Serve instant precomputed results for synthetic placeholder
    precomputed = load_precomputed_resolution_results()
    if precomputed:
        job_data = {
            "status": "complete",
            "dataset": request.dataset,
            "task": "resolution_recovery",
            "results": precomputed,
            "dataSource": "precomputed_baseline",
        }
        save_job(job_id, job_data)
        return {"job_id": job_id, "status": "complete"}

    # Fallback: run live evaluation
    job_data = {"status": "running", "dataset": request.dataset, "task": "resolution_recovery", "results": None}
    save_job(job_id, job_data)
    background_tasks.add_task(_run_resolution_job, job_id, request.dataset)
    return {"job_id": job_id, "status": "running"}


@router.get("/{job_id}/status")
async def get_status(job_id: str):
    """Poll resolution recovery job status."""
    job = get_job(job_id)
    if not job:
        return {"error": "Job not found", "status": "not_found"}
    return {
        "job_id": job_id,
        "status": job["status"],
        "task": "resolution_recovery",
        "error": job.get("error"),
    }


@router.get("/{job_id}/results")
async def get_results(job_id: str):
    """Fetch resolution recovery benchmark results."""
    job = get_job(job_id)
    if not job:
        return {"error": "Job not found", "status": "not_found"}
    if job["status"] != "complete":
        return {"error": "Job not complete", "status": job["status"]}
    return {
        "job_id": job_id,
        "status": "complete",
        "task": "resolution_recovery",
        "dataset": job.get("dataset"),
        "results": job.get("results"),
    }


import traceback


async def _run_resolution_job(job_id: str, dataset_name: str):
    """Background task: run the resolution recovery benchmark."""
    try:
        print(f"[Resolution Recovery] Starting job {job_id} on dataset {dataset_name}...")
        results = await asyncio.to_thread(run_resolution_recovery_benchmark, dataset_name)
        save_job(job_id, {
            "status": "complete",
            "dataset": dataset_name,
            "task": "resolution_recovery",
            "results": results,
        })
        print(f"[Resolution Recovery] Job {job_id} completed successfully.")
    except Exception as e:
        err_msg = str(e)
        print(f"[Resolution Recovery ERROR] Job {job_id} failed: {err_msg}")
        traceback.print_exc()
        save_job(job_id, {
            "status": "error",
            "dataset": dataset_name,
            "task": "resolution_recovery",
            "error": err_msg,
        })
