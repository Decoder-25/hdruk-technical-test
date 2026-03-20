"""
Unit tests for fetch_all_datasets().

The upstream HTTP call is mocked using pytest monkeypatch so these tests
run entirely offline with no real network dependency.
"""

import json
import pytest
import pytest_asyncio
import httpx

from services.dataset_service import fetch_all_datasets, clear_cache
from tests.conftest import SAMPLE_RECORDS


# ---------------------------------------------------------------------------
# Helper — patch _get_all_datasets to return our fixture data directly
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_upstream(monkeypatch):
    """
    Replaces the real HTTP fetch with a fixture returning SAMPLE_RECORDS.
    Tests that call this fixture never hit the network.
    """
    from services import dataset_service
    from models.dataset import DatasetSummary

    parsed = []
    for r in SAMPLE_RECORDS:
        d = dataset_service._parse_dataset(r)
        if d:
            parsed.append(d)

    async def _fake_get_all():
        return list(parsed)  # return a fresh copy each time

    monkeypatch.setattr(dataset_service, "_get_all_datasets", _fake_get_all)
    return parsed


# ---------------------------------------------------------------------------
# Pagination
# ---------------------------------------------------------------------------

class TestPagination:

    @pytest.mark.asyncio
    async def test_default_returns_first_page(self, mock_upstream):
        result = await fetch_all_datasets(page=1, page_size=10)
        assert result.pagination.page == 1
        assert result.pagination.page_size == 10
        assert len(result.datasets) == 10

    @pytest.mark.asyncio
    async def test_second_page_returns_remaining(self, mock_upstream):
        # 12 records total, page_size=10 → page 2 has 2 records
        result = await fetch_all_datasets(page=2, page_size=10)
        assert result.pagination.page == 2
        assert len(result.datasets) == 2

    @pytest.mark.asyncio
    async def test_total_count_is_correct(self, mock_upstream):
        result = await fetch_all_datasets(page=1, page_size=5)
        assert result.pagination.total == len(SAMPLE_RECORDS)

    @pytest.mark.asyncio
    async def test_total_pages_calculated_correctly(self, mock_upstream):
        # 12 records / 5 per page = 3 pages
        result = await fetch_all_datasets(page=1, page_size=5)
        assert result.pagination.total_pages == 3

    @pytest.mark.asyncio
    async def test_page_beyond_range_clamped_to_last_page(self, mock_upstream):
        # Requesting page 999 should return the last valid page
        result = await fetch_all_datasets(page=999, page_size=10)
        assert result.pagination.page == 2
        assert len(result.datasets) == 2

    @pytest.mark.asyncio
    async def test_small_page_size(self, mock_upstream):
        result = await fetch_all_datasets(page=1, page_size=3)
        assert len(result.datasets) == 3
        assert result.pagination.total_pages == 4  # ceil(12/3)

    @pytest.mark.asyncio
    async def test_page_size_larger_than_total(self, mock_upstream):
        result = await fetch_all_datasets(page=1, page_size=100)
        assert len(result.datasets) == len(SAMPLE_RECORDS)
        assert result.pagination.total_pages == 1


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------

class TestSearch:

    @pytest.mark.asyncio
    async def test_search_filters_by_title_substring(self, mock_upstream):
        result = await fetch_all_datasets(search="registry")
        titles = [d.title for d in result.datasets]
        assert all("registry" in t.lower() for t in titles)

    @pytest.mark.asyncio
    async def test_search_is_case_insensitive(self, mock_upstream):
        lower = await fetch_all_datasets(search="cystic")
        upper = await fetch_all_datasets(search="CYSTIC")
        mixed = await fetch_all_datasets(search="Cystic")
        assert lower.pagination.total == upper.pagination.total == mixed.pagination.total

    @pytest.mark.asyncio
    async def test_search_with_no_matches_returns_empty(self, mock_upstream):
        result = await fetch_all_datasets(search="xyznonexistent")
        assert result.pagination.total == 0
        assert result.datasets == []

    @pytest.mark.asyncio
    async def test_search_total_reflects_filtered_count(self, mock_upstream):
        result = await fetch_all_datasets(search="dataset")
        assert result.pagination.total == sum(
            1 for r in SAMPLE_RECORDS
            if "dataset" in r["metadata"]["summary"]["title"].lower()
        )

    @pytest.mark.asyncio
    async def test_search_combined_with_pagination(self, mock_upstream):
        # "study" matches "Alcohol Dependence Study" and "Mango Longitudinal Study"
        result = await fetch_all_datasets(search="study", page=1, page_size=1)
        assert result.pagination.total == 2
        assert len(result.datasets) == 1
        assert result.pagination.total_pages == 2


# ---------------------------------------------------------------------------
# Sort
# ---------------------------------------------------------------------------

class TestSort:

    @pytest.mark.asyncio
    async def test_sort_asc_returns_alphabetical_order(self, mock_upstream):
        result = await fetch_all_datasets(sort="asc", page_size=100)
        titles = [d.title.lower() for d in result.datasets]
        assert titles == sorted(titles)

    @pytest.mark.asyncio
    async def test_sort_desc_returns_reverse_alphabetical_order(self, mock_upstream):
        result = await fetch_all_datasets(sort="desc", page_size=100)
        titles = [d.title.lower() for d in result.datasets]
        assert titles == sorted(titles, reverse=True)

    @pytest.mark.asyncio
    async def test_no_sort_preserves_original_order(self, mock_upstream):
        result = await fetch_all_datasets(sort=None, page_size=100)
        titles = [d.title for d in result.datasets]
        expected = [r["metadata"]["summary"]["title"] for r in SAMPLE_RECORDS]
        assert titles == expected

    @pytest.mark.asyncio
    async def test_sort_is_case_insensitive(self, mock_upstream):
        # "1000 Genomes" starts with a number and should sort before letters
        result = await fetch_all_datasets(sort="asc", page_size=100)
        first_title = result.datasets[0].title
        assert first_title == "1000 Genomes Extension"

    @pytest.mark.asyncio
    async def test_sort_combined_with_search(self, mock_upstream):
        result = await fetch_all_datasets(search="o", sort="asc", page_size=100)
        titles = [d.title.lower() for d in result.datasets]
        assert titles == sorted(titles)
        assert all("o" in t for t in titles)