"""
Pydantic models for HDR UK dataset metadata.

Fields are aligned with the HDR UK FAIR data principles:
  - Findable   : title, identifier
  - Accessible : access_service_category, access_rights
  - Interoperable: structured, typed schema via Pydantic
  - Reusable   : description provides provenance / context
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, AnyHttpUrl, Field


class DatasetSummary(BaseModel):
    """
    Minimal public-facing representation of an HDR UK dataset.
    Exposes only the four fields required by the technical spec.
    """

    title: str = Field(
        ...,
        description="Human-readable name of the dataset.",
        examples=["CPRD GOLD Primary Care Data"],
    )
    description: Optional[str] = Field(
        None,
        description="Plain-text summary of what the dataset contains and its purpose.",
        examples=["Longitudinal primary care records from UK GP practices."],
    )
    access_service_category: Optional[str] = Field(
        None,
        alias="accessServiceCategory",
        description=(
            "Broad category describing how access to the dataset is provided, "
            "e.g. 'TRE/SDE', 'Open', 'Researcher Access'."
        ),
        examples=["TRE/SDE"],
    )
    access_rights: Optional[str] = Field(
        None,
        alias="accessRights",
        description="URL linking to the access-rights or data-access-request page for this dataset.",
        examples=["https://www.cprd.com/data-access"],
    )

    model_config = {
        # Allow both camelCase aliases and snake_case field names when parsing
        "populate_by_name": True,
        "json_schema_extra": {
            "examples": [
                {
                    "title": "CPRD GOLD Primary Care Data",
                    "description": "Longitudinal primary care records from UK GP practices.",
                    "accessServiceCategory": "TRE/SDE",
                    "accessRights": "https://www.cprd.com/data-access",
                }
            ]
        },
    }


class DatasetListResponse(BaseModel):
    """Wrapper returned by the list endpoint — FAIR-friendly envelope."""

    count: int = Field(..., description="Total number of datasets returned.")
    datasets: list[DatasetSummary] = Field(..., description="Array of dataset summaries.")