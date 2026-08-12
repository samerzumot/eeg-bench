from __future__ import annotations

"""Benchmark API router — handles demo and custom benchmark requests."""

import uuid
import asyncio
import os
import json
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from services.moabb_runner import run_demo_benchmark

router = APIRouter()

# Local disk persistence directory for job states (survives container restarts)
JOBS_DIR = "/tmp/eegbench_jobs"
os.makedirs(JOBS_DIR, exist_ok=True)

# In-memory job store
_jobs: dict[str, dict] = {}


def save_job(job_id: str, data: dict):
    """Save job state to memory and local disk."""
    _jobs[job_id] = data
    try:
        filepath = os.path.join(JOBS_DIR, f"{job_id}.json")
        with open(filepath, "w") as f:
            json.dump(data, f)
    except Exception as e:
        print(f"[Jobs] Failed to persist job {job_id} to disk: {e}")


def get_job(job_id: str) -> dict | None:
    """Retrieve job state from memory or local disk."""
    if job_id in _jobs:
        return _jobs[job_id]

    filepath = os.path.join(JOBS_DIR, f"{job_id}.json")
    if os.path.exists(filepath):
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
                _jobs[job_id] = data
                return data
        except Exception:
            pass

    return None


class DemoRequest(BaseModel):
    """Request to run the live demo benchmark."""
    dataset: str = "BNCI2014_001"


class CustomRequest(BaseModel):
    """Request to run a custom benchmark."""
    dataset_id: str | None = None
    upload_id: str | None = None
    event_mapping: str = "Left Hand → Class 1, Right Hand → Class 2"
    montage: str = "Standard 10-20"
    sampling_rate: int = 250
    attested: bool = False


def load_precomputed_demo_results() -> dict | None:
    """Load pre-computed real MOABB benchmark run for instant demo response."""
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "services", "precomputed_results.json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "lib", "precomputed_results.json"),
        "precomputed_results.json",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                with open(p, "r") as f:
                    data = json.load(f)
                    return data.get("results")
            except Exception as e:
                print(f"[Jobs] Error loading precomputed file {p}: {e}")
    return None


@router.post("/demo")
async def start_demo(request: DemoRequest, background_tasks: BackgroundTasks):
    """Start the demo benchmark using the pre-loaded MOABB dataset.

    Serves the pre-computed real benchmark run instantly (< 100ms) for BNCI2014_001,
    while permitting background re-evaluation if requested.
    """
    job_id = str(uuid.uuid4())[:8]

    # Serve instant precomputed real benchmark results for standard demo dataset
    precomputed = load_precomputed_demo_results()
    if precomputed and (request.dataset == "BNCI2014_001" or not request.dataset):
        job_data = {
            "status": "complete",
            "dataset": request.dataset or "BNCI2014_001",
            "results": precomputed,
            "dataSource": "precomputed_real",
        }
        save_job(job_id, job_data)
        return {"job_id": job_id, "status": "complete"}

    # Fallback: run background evaluation if dataset is custom
    job_data = {"status": "running", "dataset": request.dataset, "results": None}
    save_job(job_id, job_data)
    background_tasks.add_task(_run_demo_job, job_id, request.dataset)
    return {"job_id": job_id, "status": "running"}


@router.post("/custom")
async def start_custom(request: CustomRequest, background_tasks: BackgroundTasks):
    """Start a custom benchmark on user-selected/uploaded data."""
    if request.upload_id and not request.attested:
        return {"error": "Attestation required for uploaded data."}

    job_id = str(uuid.uuid4())[:8]
    dataset_name = request.dataset_id or request.upload_id or "BNCI2014_001"
    job_data = {
        "status": "running",
        "dataset": dataset_name,
        "results": None,
    }
    save_job(job_id, job_data)

    background_tasks.add_task(_run_demo_job, job_id, dataset_name)

    return {"job_id": job_id, "status": "running"}


import traceback


@router.get("/{job_id}/status")
async def get_status(job_id: str):
    """Poll job status."""
    job = get_job(job_id)
    if not job:
        return {"error": "Job not found", "status": "not_found"}
    return {
        "job_id": job_id,
        "status": job["status"],
        "error": job.get("error"),
    }


async def _run_demo_job(job_id: str, dataset_name: str):
    """Background task: run the benchmark and store results."""
    try:
        print(f"[Benchmark] Starting benchmark job {job_id} on dataset {dataset_name}...")
        results = await asyncio.to_thread(run_demo_benchmark, dataset_name)
        save_job(job_id, {"status": "complete", "dataset": dataset_name, "results": results})
        print(f"[Benchmark] Job {job_id} completed successfully.")
    except Exception as e:
        err_msg = str(e)
        print(f"[Benchmark ERROR] Job {job_id} failed: {err_msg}")
        traceback.print_exc()
        save_job(job_id, {"status": "error", "dataset": dataset_name, "error": err_msg})


