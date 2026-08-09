"""Results API router — serves benchmark results, scripts, and methods paragraphs."""

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from services.script_generator import generate_script
from services.methods_generator import generate_methods

router = APIRouter()

# Use disk-backed get_job from benchmark router
from routers.benchmark import get_job


@router.get("/{job_id}")
async def get_results(job_id: str):
    """Get full benchmark results for a job."""
    job = get_job(job_id)
    if not job:
        return {"error": "Job not found"}
    if job["status"] != "complete":
        return {"error": f"Job is {job['status']}", "status": job["status"]}
    return {
        "job_id": job_id,
        "dataset": job["dataset"],
        "results": job["results"],
    }


@router.get("/{job_id}/script")
async def get_script(job_id: str):
    """Download the reproducible Python script."""
    job = get_job(job_id)
    if not job or job["status"] != "complete":
        return {"error": "Results not available"}

    script = generate_script(
        dataset_name=job["dataset"],
        results=job["results"],
    )
    return PlainTextResponse(
        content=script,
        media_type="text/x-python",
        headers={"Content-Disposition": f'attachment; filename="eeg_bench_{job_id}.py"'},
    )


@router.get("/{job_id}/methods")
async def get_methods(job_id: str):
    """Get the auto-generated methods paragraph."""
    job = get_job(job_id)
    if not job or job["status"] != "complete":
        return {"error": "Results not available"}

    methods = generate_methods(
        dataset_name=job["dataset"],
        results=job["results"],
    )
    return {"methods": methods}

