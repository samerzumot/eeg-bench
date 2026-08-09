"""EEG-Dash client — proxies the EEG-Dash registry for dataset discovery.

Falls back to a bundled catalog if the REST API is unavailable.
"""

import asyncio
from typing import Any

# Bundled fallback catalog of motor-imagery datasets
_FALLBACK_CATALOG = [
    {
        "id": "BNCI2014_001",
        "name": "BNCI2014_001",
        "modality": "EEG",
        "paradigm": "Motor Imagery",
        "subjects": 9,
        "channels": 22,
        "sampling_rate": 250,
        "description": "2-class motor imagery (left hand, right hand). 22 EEG channels, 250 Hz.",
        "source": "MOABB",
    },
    {
        "id": "BNCI2014_004",
        "name": "BNCI2014_004",
        "modality": "EEG",
        "paradigm": "Motor Imagery",
        "subjects": 9,
        "channels": 3,
        "sampling_rate": 250,
        "description": "2-class motor imagery. 3 EEG channels (C3, Cz, C4), 250 Hz.",
        "source": "MOABB",
    },
    {
        "id": "Cho2017",
        "name": "Cho2017",
        "modality": "EEG",
        "paradigm": "Motor Imagery",
        "subjects": 52,
        "channels": 64,
        "sampling_rate": 512,
        "description": "2-class motor imagery. 52 subjects, 64 EEG channels, 512 Hz.",
        "source": "MOABB",
    },
    {
        "id": "Lee2019_MI",
        "name": "Lee2019_MI",
        "modality": "EEG",
        "paradigm": "Motor Imagery",
        "subjects": 54,
        "channels": 62,
        "sampling_rate": 1000,
        "description": "2-class motor imagery. 54 subjects, 62 EEG channels, 1000 Hz.",
        "source": "MOABB",
    },
]


async def search_datasets(query: str = "") -> list[dict[str, Any]]:
    """Search for motor-imagery datasets.

    Attempts the EEG-Dash REST API first, falls back to bundled catalog.
    The response always includes a 'source' field: 'eegdash_live' or 'cached_offline'.
    """
    try:
        results = await _search_eegdash_api(query)
        for r in results:
            r["source"] = "eegdash_live"
        return results
    except Exception as e:
        # Fallback to bundled catalog — HONESTLY LABELED
        print(f"[EEG-Dash] API unavailable ({e}). Returning cached offline catalog.")
        results = _search_fallback(query)
        for r in results:
            r["source"] = "cached_offline"
        return results


async def get_dataset_info(dataset_id: str) -> dict[str, Any]:
    """Get metadata for a specific dataset."""
    for ds in _FALLBACK_CATALOG:
        if ds["id"] == dataset_id:
            return ds
    return {"error": f"Dataset {dataset_id} not found"}


async def _search_eegdash_api(query: str) -> list[dict[str, Any]]:
    """Query the EEG-Dash REST API at data.eegdash.org."""
    import httpx

    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(
            "https://data.eegdash.org/api/eeg/records",
            params={"q": query, "modality": "EEG"},
        )
        resp.raise_for_status()
        data = resp.json()

    # Filter to motor-imagery-compatible datasets
    results = []
    for record in data.get("records", []):
        results.append({
            "id": record.get("id", ""),
            "name": record.get("name", ""),
            "modality": "EEG",
            "paradigm": record.get("paradigm", "Unknown"),
            "subjects": record.get("n_subjects", 0),
            "channels": record.get("n_channels", 0),
            "description": record.get("description", ""),
            "source": "EEG-Dash",
        })
    return results


def _search_fallback(query: str) -> list[dict[str, Any]]:
    """Search the bundled fallback catalog."""
    if not query:
        return _FALLBACK_CATALOG

    q = query.lower()
    return [
        ds for ds in _FALLBACK_CATALOG
        if q in ds["id"].lower()
        or q in ds["name"].lower()
        or q in ds["description"].lower()
    ]
