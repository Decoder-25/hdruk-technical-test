"""
HDR UK Dataset Metadata API
============================
A service-oriented FastAPI application exposing HDR UK dataset metadata
in a FAIR (Findable, Accessible, Interoperable, Reusable) manner.

Run locally:
    uvicorn main:app --reload

Endpoints:
    GET  /api/v1/datasets            — list all datasets
    GET  /api/v1/datasets/{title}    — retrieve a dataset by title
    GET  /health                     — application health check
    GET  /docs                       — Swagger UI
    GET  /redoc                      — ReDoc UI
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import dataset_router

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="HDR UK Dataset Metadata API",
    description=(
        "Provides structured, FAIR-aligned access to Health Data Research UK "
        "dataset metadata. Each dataset record exposes its **title**, "
        "**description**, **accessServiceCategory**, and an **accessRights** link."
    ),
    version="1.0.0",
    contact={
        "name": "HDR UK Technical Team",
        "url": "https://www.hdruk.ac.uk",
    },
    license_info={
        "name": "MIT",
    },
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS — allow the React frontend (dev + prod) to call the API
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React dev server (Create React App)
        "http://localhost:5173",   # Vite dev server
        "http://localhost:4173",   # Vite preview
        # Add your production frontend origin here, e.g.:
        # "https://your-frontend.example.com",
    ],
    allow_credentials=True,
    allow_methods=["GET"],         # read-only API; no mutations needed
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(dataset_router, prefix="/api/v1")

# ---------------------------------------------------------------------------
# Health check (root level — useful for container orchestration probes)
# ---------------------------------------------------------------------------


@app.get("/health", tags=["Health"], summary="Application health check")
async def health() -> dict:
    """Returns 200 OK when the service is running."""
    return {"status": "ok", "service": "hdruk-dataset-api"}


# ---------------------------------------------------------------------------
# Startup / shutdown hooks
# ---------------------------------------------------------------------------


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("HDR UK Dataset API starting up…")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("HDR UK Dataset API shutting down.")