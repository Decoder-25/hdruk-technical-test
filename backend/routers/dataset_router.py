from __future__ import annotations

import logging
from typing import Literal

import httpx
from fastapi import APIRouter, HTTPException, Query, status

from models.dataset import DatasetListResponse
from services.dataset_service import fetch_all_datasets

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.get(
    "",
    response_model=DatasetListResponse,
    summary="List datasets (paginated)",
    description=(
        "Returns a paginated list of HDR UK datasets. "
        "Use `sort=asc` or `sort=desc` to sort alphabetically by title."
    ),
    responses={
        200: {"description": "Successful response."},
        502: {"description": "Failed to fetch data from the upstream HDR UK source."},
    },
)
async def list_datasets(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)."),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page. Max 100."),
    search: str | None = Query(default=None, description="Case-insensitive title filter."),
    sort: Literal["asc", "desc"] | None = Query(
        default=None,
        description="Sort alphabetically by title. 'asc' = A→Z, 'desc' = Z→A. Omit for default order.",
    ),
) -> DatasetListResponse:
    try:
        return await fetch_all_datasets(page=page, page_size=page_size, search=search, sort=sort)
    except httpx.HTTPStatusError as exc:
        logger.error("Upstream HTTP error: %s", exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Unable to retrieve datasets from upstream source.") from exc
    except httpx.RequestError as exc:
        logger.error("Network error reaching upstream: %s", exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Network error when contacting upstream source.") from exc