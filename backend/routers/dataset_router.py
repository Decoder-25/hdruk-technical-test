"""
Dataset router.

Exposes the public API surface for dataset metadata.
All HTTP concerns (status codes, content negotiation, error responses)
live here; business logic is delegated to dataset_service.
"""

from __future__ import annotations

import logging

import httpx
from fastapi import APIRouter, HTTPException, Query, status

from models.dataset import DatasetListResponse
from services.dataset_service import fetch_all_datasets

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"],
)


@router.get(
    "",
    response_model=DatasetListResponse,
    summary="List datasets (paginated)",
    description=(
        "Returns a paginated list of HDR UK datasets. "
        "Each record exposes **title**, **description**, "
        "**accessServiceCategory**, and a link to **accessRights**. "
        "Use `page` and `page_size` to paginate, and `search` to filter by title."
    ),
    responses={
        200: {"description": "Successful response — paginated list of dataset summaries."},
        502: {"description": "Failed to fetch data from the upstream HDR UK source."},
    },
)
async def list_datasets(
    page: int = Query(
        default=1,
        ge=1,
        description="Page number to retrieve (1-indexed).",
    ),
    page_size: int = Query(
        default=10,
        ge=1,
        le=100,
        description="Number of datasets per page. Maximum is 100.",
    ),
    search: str | None = Query(
        default=None,
        description="Optional case-insensitive substring filter applied to dataset titles.",
        examples=["CPRD"],
    ),
) -> DatasetListResponse:
    try:
        return await fetch_all_datasets(page=page, page_size=page_size, search=search)
    except httpx.HTTPStatusError as exc:
        logger.error("Upstream HTTP error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to retrieve datasets from upstream source.",
        ) from exc
    except httpx.RequestError as exc:
        logger.error("Network error reaching upstream: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Network error when contacting upstream source.",
        ) from exc