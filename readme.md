# HDR UK Dataset Catalogue

A full-stack web application built for the Health Data Research UK Junior Full Stack Engineer technical test.

Exposes dataset metadata from the HDR UK Gateway — **title**, **description**, **accessServiceCategory**, and **accessRights** — through a FastAPI backend and a React + TypeScript frontend, aligned with FAIR (Findable, Accessible, Interoperable, Reusable) data principles.

---

## Project structure

```
HDR_UK_task/
├── backend/                # FastAPI (Python 3.11+)
│   ├── models/             # Pydantic data schemas (Source of Truth)
│   ├── routers/            # API Endpoints
│   ├── services/           # Business logic & filtering
│   └── tests/              # 52 Automated Pytests 
│
└── frontend/               # React + TypeScript (Vite)
    ├── src/
    │   ├── api/            # Axios configuration
    │   ├── components/     # MUI UI Components
    │   ├── hooks/          # Custom React logic (State management)
    │   ├── types/          # TypeScript Interfaces (Matches Backend Models) 
    │   └── pages/          # Main view layouts
```

---

## Quick start

### Prerequisites

- Python 3.11+
- Node.js 18+

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # For Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# 1. Create a file named .env in this folder
# 2. Add this exact line inside the file:
UPSTREAM_URL=https://raw.githubusercontent.com/HDRUK/hackathon-entity-linkage/refs/heads/dev/fe-implement/app/data/all_datasets.json

# Start the development server
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set VITE_API_BASE_URL=http://localhost:8000

# Start the development server
npm run dev
```

Frontend runs at **http://localhost:3000**

> The Vite dev server proxies `/api/*` → `http://localhost:8000` so there are no CORS issues locally.

---

## API reference

### `GET /api/v1/datasets`

Returns a paginated list of HDR UK dataset metadata.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number (min: 1) |
| `page_size` | integer | `10` | Items per page (min: 1, max: 100) |
| `search` | string | — | Case-insensitive title filter |
| `sort` | `asc` \| `desc` | — | Alphabetical sort by title |

**Example response**

```json
{
  "pagination": {
    "total": 47,
    "page": 1,
    "page_size": 10,
    "total_pages": 5
  },
  "datasets": [
    {
      "title": "Cystic Fibrosis Patient Microbiology Cultures",
      "description": "The UK Cystic Fibrosis Registry Culture is made up of many data items...",
      "accessServiceCategory": "Varies based on project",
      "accessRights": "https://www.cysticfibrosis.org.uk/..."
    }
  ]
}
```

---


## Running the tests

```bash
cd backend

# Install test dependencies (if not already installed)
pip install pytest pytest-asyncio httpx --break-system-packages

# Run all tests
python -m pytest tests/ -v
```

**52 tests across 3 files — all passing.**

| File | What it tests |
|---|---|
| `test_service_helpers.py` | `_extract_nested()` and `_parse_dataset()` in isolation — 14 unit tests |
| `test_service_fetch.py` | `fetch_all_datasets()` with mocked upstream — pagination, search, sort — 17 tests |
| `test_api.py` | Full API integration via FastAPI `TestClient` — response shape, query params, error handling — 21 tests |

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI 0.115 |
| Data validation | Pydantic v2 |
| HTTP client | httpx |
| ASGI server | Uvicorn |
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite |
| UI components | MUI (Material UI) v6 |
| HTTP client (FE) | Axios |
| Font | DM Sans (@fontsource) |
| Testing | pytest + pytest-asyncio |

---
