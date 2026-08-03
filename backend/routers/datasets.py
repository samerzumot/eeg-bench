"""Datasets API router — proxies EEG-Dash registry for dataset search/browse."""

from fastapi import APIRouter, Query
from services.eegdash_client import search_datasets, get_dataset_info

router = APIRouter()


@router.get("/search")
async def search(q: str = Query("", description="Search query")):
    """Search the EEG-Dash registry for motor-imagery datasets."""
    results = await search_datasets(q)
    return {"datasets": results}


@router.get("/{dataset_id}")
async def get_dataset(dataset_id: str):
    """Get metadata for a specific dataset."""
    info = await get_dataset_info(dataset_id)
    return info
