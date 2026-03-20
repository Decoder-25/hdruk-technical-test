"""
Integration tests for GET /api/v1/datasets.

Uses FastAPI's TestClient with the upstream HTTP call mocked,
so the full request → router → service → response stack is exercised
without any real network dependency.
"""

import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from models.dataset import DatasetSummary
from tests.conftest import SAMPLE_RECORDS, make_raw_record
import services.dataset_service as dataset_service


# ---------------------------------------------------------------------------
# Helper — build a parsed dataset list from SAMPLE_RECORDS
# ---------------------------------------------------------------------------

def _parsed_sample() -> list[DatasetSummary]:
    result = []
    for r in SAMPLE_RECORDS:
        d = dataset_service._parse_dataset(r)
        if d:
            result.append(d)
    return result


@pytest.fixture
def mock_upstream(monkeypatch):
    parsed = _parsed_sample()
    async def _fake():
        return list(parsed)
    monkeypatch.setattr(dataset_service, "_get_all_datasets", _fake)


# ---------------------------------------------------------------------------
# Response shape
# ---------------------------------------------------------------------------

class TestResponseShape:

    def test_returns_200(self, client, mock_upstream):
        response = client.get("/api/v1/datasets")
        assert response.status_code == 200

    def test_response_has_pagination_and_datasets_keys(self, client, mock_upstream):
        data = client.get("/api/v1/datasets").json()
        assert "pagination" in data
        assert "datasets" in data

    def test_pagination_has_required_fields(self, client, mock_upstream):
        pagination = client.get("/api/v1/datasets").json()["pagination"]
        assert "total" in pagination
        assert "page" in pagination
        assert "page_size" in pagination
        assert "total_pages" in pagination

    def test_dataset_has_required_fields(self, client, mock_upstream):
        datasets = client.get("/api/v1/datasets").json()["datasets"]
        assert len(datasets) > 0
        first = datasets[0]
        assert "title" in first
        assert "description" in first
        assert "accessServiceCategory" in first
        assert "accessRights" in first

    def test_no_extra_fields_exposed(self, client, mock_upstream):
        # Only the four required fields should be present — nothing from raw data leaks through
        first = client.get("/api/v1/datasets").json()["datasets"][0]
        allowed_keys = {"title", "description", "accessServiceCategory", "accessRights"}
        assert set(first.keys()) == allowed_keys


# ---------------------------------------------------------------------------
# Pagination query params
# ---------------------------------------------------------------------------

class TestPaginationParams:

    def test_default_page_size_is_10(self, client, mock_upstream):
        data = client.get("/api/v1/datasets").json()
        assert data["pagination"]["page_size"] == 10
        assert len(data["datasets"]) == 10

    def test_custom_page_size(self, client, mock_upstream):
        data = client.get("/api/v1/datasets?page_size=5").json()
        assert data["pagination"]["page_size"] == 5
        assert len(data["datasets"]) == 5

    def test_page_2_returns_correct_slice(self, client, mock_upstream):
        data = client.get("/api/v1/datasets?page=2&page_size=10").json()
        assert data["pagination"]["page"] == 2
        assert len(data["datasets"]) == 2  # 12 records total

    def test_page_size_exceeds_max_returns_422(self, client, mock_upstream):
        response = client.get("/api/v1/datasets?page_size=101")
        assert response.status_code == 422

    def test_page_zero_returns_422(self, client, mock_upstream):
        response = client.get("/api/v1/datasets?page=0")
        assert response.status_code == 422

    def test_negative_page_returns_422(self, client, mock_upstream):
        response = client.get("/api/v1/datasets?page=-1")
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# Search query param
# ---------------------------------------------------------------------------

class TestSearchParam:

    def test_search_filters_results(self, client, mock_upstream):
        data = client.get("/api/v1/datasets?search=registry").json()
        for dataset in data["datasets"]:
            assert "registry" in dataset["title"].lower()

    def test_search_updates_total(self, client, mock_upstream):
        all_data = client.get("/api/v1/datasets?page_size=100").json()
        filtered_data = client.get("/api/v1/datasets?search=registry&page_size=100").json()
        assert filtered_data["pagination"]["total"] < all_data["pagination"]["total"]

    def test_search_no_match_returns_empty_list(self, client, mock_upstream):
        data = client.get("/api/v1/datasets?search=xyznonexistent").json()
        assert data["pagination"]["total"] == 0
        assert data["datasets"] == []

    def test_search_is_case_insensitive(self, client, mock_upstream):
        lower = client.get("/api/v1/datasets?search=cystic").json()
        upper = client.get("/api/v1/datasets?search=CYSTIC").json()
        assert lower["pagination"]["total"] == upper["pagination"]["total"]


# ---------------------------------------------------------------------------
# Sort query param
# ---------------------------------------------------------------------------

class TestSortParam:

    def test_sort_asc_returns_alphabetical(self, client, mock_upstream):
        data = client.get("/api/v1/datasets?sort=asc&page_size=100").json()
        titles = [d["title"].lower() for d in data["datasets"]]
        assert titles == sorted(titles)

    def test_sort_desc_returns_reverse_alphabetical(self, client, mock_upstream):
        data = client.get("/api/v1/datasets?sort=desc&page_size=100").json()
        titles = [d["title"].lower() for d in data["datasets"]]
        assert titles == sorted(titles, reverse=True)

    def test_invalid_sort_value_returns_422(self, client, mock_upstream):
        response = client.get("/api/v1/datasets?sort=random")
        assert response.status_code == 422

    def test_sort_and_search_combined(self, client, mock_upstream):
        data = client.get("/api/v1/datasets?sort=asc&search=o&page_size=100").json()
        titles = [d["title"].lower() for d in data["datasets"]]
        assert titles == sorted(titles)
        assert all("o" in t for t in titles)


# ---------------------------------------------------------------------------
# Upstream failure handling
# ---------------------------------------------------------------------------

class TestUpstreamFailures:

    def test_upstream_http_error_returns_502(self, client, monkeypatch):
        import httpx
        async def _fail():
            raise httpx.HTTPStatusError(
                "upstream error",
                request=httpx.Request("GET", "http://test"),
                response=httpx.Response(500),
            )
        monkeypatch.setattr(dataset_service, "_get_all_datasets", _fail)
        response = client.get("/api/v1/datasets")
        assert response.status_code == 502

    def test_502_response_has_detail_field(self, client, monkeypatch):
        import httpx
        async def _fail():
            raise httpx.RequestError("network error", request=httpx.Request("GET", "http://test"))
        monkeypatch.setattr(dataset_service, "_get_all_datasets", _fail)
        data = client.get("/api/v1/datasets").json()
        assert "detail" in data