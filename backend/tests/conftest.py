"""
Shared pytest fixtures.
"""

import pytest
from fastapi.testclient import TestClient

from main import app
from services.dataset_service import clear_cache


# ---------------------------------------------------------------------------
# Raw JSON fixtures — shaped exactly like the real HDR UK upstream data
# ---------------------------------------------------------------------------

def make_raw_record(
    id: int = 1,
    title: str = "Test Dataset",
    description: str = "A test description.",
    access_service_category: str = "TRE/SDE",
    access_rights: str = "https://example.com/access",
) -> dict:
    """Build a raw upstream JSON record matching the real HDR UK schema."""
    return {
        "id": id,
        "metadata": {
            "summary": {
                "title": title,
                "description": description,
            },
            "accessibility": {
                "access": {
                    "accessServiceCategory": access_service_category,
                    "accessRights": access_rights,
                }
            },
        },
    }


SAMPLE_RECORDS = [
    make_raw_record(1, "Cystic Fibrosis Registry",    "CF data.",   "TRE/SDE",               "https://cf.org/access"),
    make_raw_record(2, "Alcohol Dependence Study",    "ADS data.",  "TRE/SDE",               "https://ads.org/access"),
    make_raw_record(3, "Zebra Genomics Dataset",      "ZGD data.",  "Open",                  "https://zgd.org/access"),
    make_raw_record(4, "Apple Health Cohort",         "AHC data.",  "Varies based on project","https://ahc.org/access"),
    make_raw_record(5, "Mango Longitudinal Study",    "MLS data.",  "Open",                  "https://mls.org/access"),
    make_raw_record(6, "1000 Genomes Extension",      "1KG data.",  "Open",                  "https://1kg.org/access"),
    make_raw_record(7, "Banana Biobank",              "BB data.",   "TRE/SDE",               "https://bb.org/access"),
    make_raw_record(8, "Newcastle Cancer Registry",   "NCR data.",  "TRE/SDE",               "https://ncr.org/access"),
    make_raw_record(9, "Oxford Diabetes Cohort",      "ODC data.",  "Varies based on project","https://odc.org/access"),
    make_raw_record(10, "Portsmouth Stroke Dataset",  "PSD data.",  "TRE/SDE",               "https://psd.org/access"),
    make_raw_record(11, "Queen's Renal Registry",     "QRR data.",  "Open",                  "https://qrr.org/access"),
    make_raw_record(12, "Royal Marsden Tumour Bank",  "RMTB data.", "TRE/SDE",               "https://rmtb.org/access"),
]


@pytest.fixture(autouse=True)
def reset_cache():
    """Clear the in-memory dataset cache before every test for isolation."""
    clear_cache()
    yield
    clear_cache()


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)