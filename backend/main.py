"""EEG-Bench Backend — FastAPI application."""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import benchmark, results, datasets, upload, clinician, resolution_recovery

app = FastAPI(
    title="EEG-Bench API",
    description="Motor-imagery & Clinical EEG benchmarking API built on MOABB, MNE-Python, and Braindecode.",
    version="0.1.0",
)

# CORS — allow Cloud Run frontend URLs and localhost for dev
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,https://mi-bench.vercel.app,https://frontend-five-taupe-65.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(benchmark.router, prefix="/api/benchmark", tags=["benchmark"])
app.include_router(results.router, prefix="/api/results", tags=["results"])
app.include_router(datasets.router, prefix="/api/datasets", tags=["datasets"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(clinician.router)
app.include_router(resolution_recovery.router, prefix="/api/resolution-recovery", tags=["resolution-recovery"])


@app.get("/api/health")
def health():
    """Health check endpoint."""
    import mne
    import moabb
    return {
        "status": "ok",
        "versions": {
            "mne": mne.__version__,
            "moabb": moabb.__version__,
        },
    }
