from __future__ import annotations

"""Benchmark API router — handles demo and custom benchmark requests."""

import uuid
import asyncio
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from services.moabb_runner import run_demo_benchmark

router = APIRouter()

# In-memory job store (will migrate to Firestore)
_jobs: dict[str, dict] = {}


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


@router.post("/demo")
async def start_demo(request: DemoRequest, background_tasks: BackgroundTasks):
    """Start the live demo benchmark using a pre-loaded MOABB dataset."""
    job_id = str(uuid.uuid4())[:8]
    _jobs[job_id] = {"status": "running", "dataset": request.dataset, "results": None}

    background_tasks.add_task(_run_demo_job, job_id, request.dataset)

    return {"job_id": job_id, "status": "running"}


@router.post("/custom")
async def start_custom(request: CustomRequest, background_tasks: BackgroundTasks):
    """Start a custom benchmark on user-selected/uploaded data."""
    if request.upload_id and not request.attested:
        return {"error": "Attestation required for uploaded data."}

    job_id = str(uuid.uuid4())[:8]
    _jobs[job_id] = {
        "status": "running",
        "dataset": request.dataset_id or request.upload_id,
        "results": None,
    }

    background_tasks.add_task(_run_demo_job, job_id, request.dataset_id or "BNCI2014_001")

    return {"job_id": job_id, "status": "running"}


@router.get("/{job_id}/status")
async def get_status(job_id: str):
    """Poll job status."""
    job = _jobs.get(job_id)
    if not job:
        return {"error": "Job not found", "status": "not_found"}
    return {"job_id": job_id, "status": job["status"]}


async def _run_demo_job(job_id: str, dataset_name: str):
    """Background task: run the benchmark and store results."""
    try:
        results = await asyncio.to_thread(run_demo_benchmark, dataset_name)
        _jobs[job_id] = {"status": "complete", "dataset": dataset_name, "results": results}
    except Exception as e:
        _jobs[job_id] = {"status": "error", "dataset": dataset_name, "error": str(e)}
