from __future__ import annotations

import json
import os
from datetime import date, datetime
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
ODDS_API_KEY = os.getenv("ODDS_API_KEY")
OPENMETEO_BASE_URL = os.getenv("OPENMETEO_BASE_URL", "https://api.open-meteo.com/v1")

PIPELINE_DIR = Path(__file__).resolve().parent
CACHE_DIR = PIPELINE_DIR / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def get_supabase(optional: bool = False) -> Client | None:
    if not SUPABASE_URL or not SUPABASE_KEY:
        if optional:
            return None
        raise RuntimeError("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def today_str() -> str:
    return date.today().isoformat()


def now_iso() -> str:
    return datetime.utcnow().isoformat()


def normalize(value: float | int | None, min_val: float, max_val: float) -> float:
    """Normalize a value to 0-100 scale."""
    if value is None:
        return 50.0
    if max_val == min_val:
        return 50.0
    scaled = (float(value) - min_val) / (max_val - min_val) * 100
    return max(0.0, min(100.0, scaled))


def write_json_cache(filename: str, payload: Any) -> Path:
    path = CACHE_DIR / filename
    with path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, default=str)
    return path


def read_json_cache(filename: str, default: Any = None) -> Any:
    path = CACHE_DIR / filename
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)
