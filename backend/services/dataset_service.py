"""
Dataset service.

Responsible for:
  1. Fetching raw dataset metadata from the upstream HDR UK JSON source.
  2. Normalising / extracting only the four required fields (FAIR-aligned).
  3. Providing a small in-memory cache so we don't hammer the upstream URL.

All business logic lives here; the router only handles HTTP concerns.
"""

from __future__ import annotations

import logging
from typing import Optional

import httpx

from config import settings
from models.dataset import DatasetSummary, DatasetListResponse

logger = logging.getLogger(__name__)

# Simple in-process cache: (data, etag).  None until first fetch.
_cache: tuple[list[DatasetSummary], Optional[str]] | None = None


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------


def _extract_nested(raw: dict, *keys: str) -> Optional[str]:
    """
    Safely traverse a nested dict using a sequence of keys.
    Returns the string value or None if any key is missing.

    Example:
        _extract_nested(record, "summary", "title")
    """
    node = raw
    for key in keys:
        if not isinstance(node, dict):
            return None
        node = node.get(key)
    return str(node) if node is not None else None


def _parse_dataset(raw: dict) -> Optional[DatasetSummary]:
    """
    Map one raw JSON record to a DatasetSummary.

    HDR UK Gateway metadata nests fields differently across schema versions;
    this function handles the most common layouts gracefully.
    """
    # --- title ---
    title = (
        _extract_nested(raw, "summary", "title")
        or _extract_nested(raw, "title")
    )
    if not title:
        logger.warning("Skipping record with no title: %s", raw.get("id", "<unknown>"))
        return None

    # --- description ---
    description = (
        _extract_nested(raw, "summary", "abstract")
        or _extract_nested(raw, "summary", "description")
        or _extract_nested(raw, "description")
    )

    # --- accessServiceCategory ---
    access_service_category = (
        _extract_nested(raw, "accessibility", "access", "accessServiceCategory")
        or _extract_nested(raw, "accessServiceCategory")
    )

    # --- accessRights ---
    access_rights = (
        _extract_nested(raw, "accessibility", "access", "accessRights")
        or _extract_nested(raw, "accessRights")
    )

    return DatasetSummary(
        title=title,
        description=description,
        accessServiceCategory=access_service_category,
        accessRights=access_rights,
    )


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------


async def fetch_all_datasets() -> DatasetListResponse:
    """
    Fetch all datasets from the upstream source, apply field extraction,
    and return a structured DatasetListResponse.

    Uses a conditional GET (ETag) to avoid re-downloading unchanged data.
    Raises httpx.HTTPStatusError on upstream HTTP errors.
    """
    global _cache

    headers: dict[str, str] = {}
    if _cache is not None:
        _, etag = _cache
        if etag:
            headers["If-None-Match"] = etag

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(settings.upstream_url, headers=headers)

        if response.status_code == 304 and _cache is not None:
            logger.debug("Upstream returned 304 Not Modified — using cache.")
            datasets, etag = _cache
            return DatasetListResponse(count=len(datasets), datasets=datasets)

        response.raise_for_status()

        raw_data = response.json()
        etag = response.headers.get("etag")

    # The upstream JSON may be a list or wrapped in a key — handle both.
    if isinstance(raw_data, list):
        raw_list = raw_data
    elif isinstance(raw_data, dict):
        # Try common wrapper keys
        raw_list = (
            raw_data.get("datasets")
            or raw_data.get("data")
            or raw_data.get("items")
            or list(raw_data.values())
        )
    else:
        raw_list = []

    datasets: list[DatasetSummary] = []
    for record in raw_list:
        if isinstance(record, dict):
            parsed = _parse_dataset(record)
            if parsed:
                datasets.append(parsed)

    _cache = (datasets, etag)
    logger.info("Fetched %d datasets from upstream.", len(datasets))

    return DatasetListResponse(count=len(datasets), datasets=datasets)


async def fetch_dataset_by_title(title: str) -> Optional[DatasetSummary]:
    """
    Return a single DatasetSummary whose title matches (case-insensitive).
    Returns None if not found.
    """
    response = await fetch_all_datasets()
    title_lower = title.lower()
    for dataset in response.datasets:
        if dataset.title.lower() == title_lower:
            return dataset
    return None


def clear_cache() -> None:
    """Invalidate the in-memory cache (useful for testing)."""
    global _cache
    _cache = None