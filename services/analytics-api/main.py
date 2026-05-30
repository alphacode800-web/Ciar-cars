"""
CIAR Cars Analytics API — Python FastAPI sidecar
Provides analytics, search suggestions, and DB health checks.
Run: uvicorn main:app --reload --port 8001
"""
from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB = APP_ROOT / "db" / "custom.db"
DATABASE_PATH = Path(os.getenv("CIAR_DATABASE_PATH", str(DEFAULT_DB)))
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "ciar-dev-internal-key")
ALLOWED_ORIGINS = os.getenv("ANALYTICS_CORS_ORIGINS", "http://localhost:3000").split(",")

app = FastAPI(
    title="CIAR Cars Analytics API",
    description="Python sidecar for analytics, insights, and search suggestions",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@contextmanager
def get_db():
    if not DATABASE_PATH.exists():
        raise HTTPException(status_code=503, detail=f"Database not found: {DATABASE_PATH}")
    conn = sqlite3.connect(f"file:{DATABASE_PATH}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def verify_key(x_api_key: str | None) -> None:
    if INTERNAL_API_KEY and x_api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


class SearchSuggestResponse(BaseModel):
    query: str
    brands: list[str]
    models: list[str]
    cities: list[str]


class AnalyticsOverview(BaseModel):
    generated_at: str
    users: int
    cars_total: int
    cars_active: int
    cars_featured: int
    bookings: int
    payments_total: float
    top_brands: list[dict[str, Any]]
    top_countries: list[dict[str, Any]]
    price_stats: dict[str, float | None]


@app.get("/health")
def health():
    with get_db() as conn:
        conn.execute("SELECT 1").fetchone()
        user_count = conn.execute("SELECT COUNT(*) FROM User").fetchone()[0]
    return {
        "status": "healthy",
        "service": "ciar-analytics-api",
        "database": str(DATABASE_PATH),
        "users": user_count,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/analytics/overview", response_model=AnalyticsOverview)
def analytics_overview(x_api_key: str | None = Header(default=None)):
    verify_key(x_api_key)
    with get_db() as conn:
        users = conn.execute("SELECT COUNT(*) FROM User").fetchone()[0]
        cars_total = conn.execute("SELECT COUNT(*) FROM Car").fetchone()[0]
        cars_active = conn.execute("SELECT COUNT(*) FROM Car WHERE status='active'").fetchone()[0]
        cars_featured = conn.execute(
            "SELECT COUNT(*) FROM Car WHERE isFeatured=1 AND status='active'"
        ).fetchone()[0]
        bookings = conn.execute("SELECT COUNT(*) FROM RentalBooking").fetchone()[0]
        payments_row = conn.execute(
            "SELECT COALESCE(SUM(amount), 0) FROM Payment WHERE status='completed'"
        ).fetchone()
        payments_total = float(payments_row[0] if payments_row else 0)

        price_row = conn.execute(
            "SELECT MIN(price), MAX(price), AVG(price) FROM Car WHERE status='active'"
        ).fetchone()

        top_brands = [
            {"brand": r["brand"], "count": r["cnt"]}
            for r in conn.execute(
                """
                SELECT brand, COUNT(*) as cnt FROM Car
                WHERE status='active' GROUP BY brand
                ORDER BY cnt DESC LIMIT 10
                """
            ).fetchall()
        ]

        top_countries = [
            {"country": r["country"], "count": r["cnt"]}
            for r in conn.execute(
                """
                SELECT country, COUNT(*) as cnt FROM Car
                WHERE status='active' GROUP BY country
                ORDER BY cnt DESC LIMIT 10
                """
            ).fetchall()
        ]

    return AnalyticsOverview(
        generated_at=datetime.now(timezone.utc).isoformat(),
        users=users,
        cars_total=cars_total,
        cars_active=cars_active,
        cars_featured=cars_featured,
        bookings=bookings,
        payments_total=payments_total,
        top_brands=top_brands,
        top_countries=top_countries,
        price_stats={
            "min": price_row[0],
            "max": price_row[1],
            "avg": round(price_row[2], 2) if price_row[2] is not None else None,
        },
    )


@app.get("/search/suggest", response_model=SearchSuggestResponse)
def search_suggest(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(8, ge=1, le=20),
):
    pattern = f"%{q}%"
    with get_db() as conn:
        brands = [
            r[0]
            for r in conn.execute(
                "SELECT DISTINCT brand FROM Car WHERE brand LIKE ? AND status='active' LIMIT ?",
                (pattern, limit),
            ).fetchall()
        ]
        models = [
            r[0]
            for r in conn.execute(
                "SELECT DISTINCT model FROM Car WHERE model LIKE ? AND status='active' LIMIT ?",
                (pattern, limit),
            ).fetchall()
        ]
        cities = [
            r[0]
            for r in conn.execute(
                "SELECT DISTINCT city FROM Car WHERE city LIKE ? AND status='active' LIMIT ?",
                (pattern, limit),
            ).fetchall()
        ]

    return SearchSuggestResponse(query=q, brands=brands, models=models, cities=cities)


class MarketInsight(BaseModel):
    country: str
    car_count: int
    avg_price: float
    featured_count: int


@app.get("/analytics/market/{country}", response_model=MarketInsight)
def market_insight(country: str, x_api_key: str | None = Header(default=None)):
    verify_key(x_api_key)
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT country,
                   COUNT(*) as car_count,
                   AVG(price) as avg_price,
                   SUM(CASE WHEN isFeatured=1 THEN 1 ELSE 0 END) as featured_count
            FROM Car WHERE status='active' AND country LIKE ?
            GROUP BY country LIMIT 1
            """,
            (f"%{country}%",),
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="No market data for this country")

    return MarketInsight(
        country=row["country"],
        car_count=row["car_count"],
        avg_price=round(row["avg_price"] or 0, 2),
        featured_count=row["featured_count"] or 0,
    )
