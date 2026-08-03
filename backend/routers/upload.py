"""Upload API router — handles EDF/BDF/BrainVision file uploads."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import uuid

router = APIRouter()


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    attested: bool = Form(False),
):
    """Upload an EEG file for benchmarking.

    Requires attestation that the data is public, de-identified,
    or the user has explicit rights to use it.
    """
    if not attested:
        raise HTTPException(
            status_code=400,
            detail="You must attest that this data is public, de-identified, "
                   "or that you have explicit rights/approval to use it.",
        )

    # Validate file type
    allowed_extensions = {".edf", ".bdf", ".vhdr", ".vmrk", ".eeg"}
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Accepted: EDF, BDF, BrainVision (.vhdr/.vmrk/.eeg)",
        )

    upload_id = str(uuid.uuid4())[:8]

    # For now, save to local temp. Will migrate to GCS.
    import os
    upload_dir = "/tmp/eeg_bench_uploads"
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, f"{upload_id}_{filename}")
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    return {
        "upload_id": upload_id,
        "filename": filename,
        "size_bytes": len(content),
    }
