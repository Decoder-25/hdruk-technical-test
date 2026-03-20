"""
Dataset service.

Responsible for:
  1. Fetching raw dataset metadata from the upstream HDR UK JSON source.
  2. Normalising / extracting only the four required fields (FAIR-aligned).
  3. Providing a small in-memory cache so we don't hammer the upstream URL.
  4. Applying search filtering and pagination before returning results.

All business logic lives here; the router only handles HTTP concerns.
"""

from __future__ import annotations

import logging
import math
from typing import Optional

import httpx

from config import settings
from models.dataset import DatasetSummary, DatasetListResponse, PaginationMeta

logger = logging.getLogger(__name__)

# Simple in-process cache: (data, etag). None until first fetch.
_cache: tuple[list[DatasetSummary], Optional[str]] | None = None


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------


def _extract_nested(raw: dict, *keys: str) -> Optional[str]:
    """
    Safely traverse a nested dict using a sequence of keys.
    Returns the string value or None if any key is missing.
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

    Confirmed field paths from the actual HDR UK dataset JSON:
      title                 -> raw["metadata"]["summary"]["title"]
      description           -> raw["metadata"]["summary"]["description"]
      accessServiceCategory -> raw["metadata"]["accessibility"]["access"]["accessServiceCategory"]
      accessRights          -> raw["metadata"]["accessibility"]["access"]["accessRights"]
    """
    title = _extract_nested(raw, "metadata", "summary", "title")
    if not title:
        logger.warning("Skipping record with no title: %s", raw.get("id", "<unknown>"))
        return None

    description = _extract_nested(raw, "metadata", "summary", "description")
    access_service_category = _extract_nested(
        raw, "metadata", "accessibility", "access", "accessServiceCategory"
    )
    access_rights = _extract_nested(
        raw, "metadata", "accessibility", "access", "accessRights"
    )

    return DatasetSummary(
        title=title,
        description=description,
        accessServiceCategory=access_service_category,
        accessRights=access_rights,
    )


# ---------------------------------------------------------------------------
# Private: fetch and cache the full dataset list from upstream
# ---------------------------------------------------------------------------


async def _get_all_datasets() -> list[DatasetSummary]:
    """
    Fetches and caches all datasets from upstream.
    Uses ETag-based conditional GET to avoid redundant downloads.
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
            datasets, _ = _cache
            return datasets

        response.raise_for_status()
        raw_data = response.json()
        etag = response.headers.get("etag")

    if isinstance(raw_data, list):
        raw_list = raw_data
    elif isinstance(raw_data, dict):
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
    return datasets


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------


async def fetch_all_datasets(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
) -> DatasetListResponse:
    """
    Returns a paginated, optionally filtered list of datasets.

    Args:
        page:      1-indexed page number.
        page_size: Number of items per page (max 100).
        search:    Optional case-insensitive substring filter on title.
    """
    all_datasets = await _get_all_datasets()

    # Apply search filter
    if search:
        search_lower = search.lower()
        all_datasets = [d for d in all_datasets if search_lower in d.title.lower()]

    # Pagination calculations
    total = len(all_datasets)
    total_pages = max(1, math.ceil(total / page_size))

    # Clamp page to valid range
    page = max(1, min(page, total_pages))

    start = (page - 1) * page_size
    end = start + page_size
    page_datasets = all_datasets[start:end]

    return DatasetListResponse(
        pagination=PaginationMeta(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        ),
        datasets=page_datasets,
    )


def clear_cache() -> None:
    """Invalidate the in-memory cache (useful for testing)."""
    global _cache
    _cache = None