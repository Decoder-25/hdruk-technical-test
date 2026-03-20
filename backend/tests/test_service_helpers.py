"""
Unit tests for dataset_service helper functions.

Tests _extract_nested() and _parse_dataset() in complete isolation —
no HTTP calls, no cache, no FastAPI involved.
"""

import pytest
from services.dataset_service import _extract_nested, _parse_dataset
from tests.conftest import make_raw_record


# ---------------------------------------------------------------------------
# _extract_nested
# ---------------------------------------------------------------------------

class TestExtractNested:

    def test_extracts_single_level(self):
        assert _extract_nested({"title": "Hello"}, "title") == "Hello"

    def test_extracts_deeply_nested(self):
        raw = {"metadata": {"summary": {"title": "Deep Value"}}}
        assert _extract_nested(raw, "metadata", "summary", "title") == "Deep Value"

    def test_returns_none_for_missing_key(self):
        raw = {"metadata": {"summary": {}}}
        assert _extract_nested(raw, "metadata", "summary", "title") is None

    def test_returns_none_for_missing_intermediate_key(self):
        raw = {"metadata": {}}
        assert _extract_nested(raw, "metadata", "accessibility", "access", "accessRights") is None

    def test_returns_none_for_empty_dict(self):
        assert _extract_nested({}, "any", "key") is None

    def test_returns_none_when_value_is_none(self):
        raw = {"metadata": {"summary": {"title": None}}}
        assert _extract_nested(raw, "metadata", "summary", "title") is None

    def test_converts_non_string_to_string(self):
        raw = {"metadata": {"summary": {"title": 42}}}
        assert _extract_nested(raw, "metadata", "summary", "title") == "42"

    def test_handles_non_dict_intermediate_node(self):
        # If a node along the path is a list instead of a dict, return None safely
        raw = {"metadata": ["not", "a", "dict"]}
        assert _extract_nested(raw, "metadata", "summary", "title") is None


# ---------------------------------------------------------------------------
# _parse_dataset
# ---------------------------------------------------------------------------

class TestParseDataset:

    def test_parses_all_four_fields(self):
        raw = make_raw_record(
            title="Cystic Fibrosis Registry",
            description="CF registry data.",
            access_service_category="TRE/SDE",
            access_rights="https://cf.org/access",
        )
        result = _parse_dataset(raw)
        assert result is not None
        assert result.title == "Cystic Fibrosis Registry"
        assert result.description == "CF registry data."
        assert result.access_service_category == "TRE/SDE"
        assert result.access_rights == "https://cf.org/access"

    def test_returns_none_when_title_missing(self):
        raw = {
            "id": 1,
            "metadata": {
                "summary": {"description": "No title here."},
                "accessibility": {"access": {}},
            },
        }
        assert _parse_dataset(raw) is None

    def test_returns_none_when_metadata_missing(self):
        assert _parse_dataset({"id": 1}) is None

    def test_handles_missing_optional_fields_gracefully(self):
        # Only title present — all other fields should be None
        raw = {"id": 1, "metadata": {"summary": {"title": "Minimal Dataset"}, "accessibility": {"access": {}}}}
        result = _parse_dataset(raw)
        assert result is not None
        assert result.title == "Minimal Dataset"
        assert result.description is None
        assert result.access_service_category is None
        assert result.access_rights is None

    def test_handles_missing_accessibility_block(self):
        raw = {"id": 1, "metadata": {"summary": {"title": "No Access Block"}}}
        result = _parse_dataset(raw)
        assert result is not None
        assert result.access_service_category is None
        assert result.access_rights is None

    def test_returns_none_for_empty_title_string(self):
        raw = make_raw_record(title="")
        # Empty string is falsy — should be treated as missing
        assert _parse_dataset(raw) is None