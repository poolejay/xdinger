from __future__ import annotations

import argparse
from datetime import date

import requests

from pipeline_utils import OPENMETEO_BASE_URL, write_json_cache


BALLPARKS = {
    "ARI": {"lat": 33.4453, "lon": -112.0667, "dome": True},
    "ATL": {"lat": 33.8907, "lon": -84.4677, "dome": False},
    "BAL": {"lat": 39.2838, "lon": -76.6217, "dome": False},
    "BOS": {"lat": 42.3467, "lon": -71.0972, "dome": False},
    "CHC": {"lat": 41.9484, "lon": -87.6553, "dome": False},
    "CWS": {"lat": 41.8299, "lon": -87.6338, "dome": False},
    "CIN": {"lat": 39.0979, "lon": -84.5081, "dome": False},
    "CLE": {"lat": 41.4962, "lon": -81.6852, "dome": False},
    "COL": {"lat": 39.7559, "lon": -104.9942, "dome": False},
    "DET": {"lat": 42.3390, "lon": -83.0485, "dome": False},
    "HOU": {"lat": 29.7573, "lon": -95.3555, "dome": True},
    "KC": {"lat": 39.0517, "lon": -94.4803, "dome": False},
    "LAA": {"lat": 33.8003, "lon": -117.8827, "dome": False},
    "LAD": {"lat": 34.0739, "lon": -118.2400, "dome": False},
    "MIA": {"lat": 25.7781, "lon": -80.2196, "dome": True},
    "MIL": {"lat": 43.0280, "lon": -87.9712, "dome": True},
    "MIN": {"lat": 44.9817, "lon": -93.2776, "dome": False},
    "NYM": {"lat": 40.7571, "lon": -73.8458, "dome": False},
    "NYY": {"lat": 40.8296, "lon": -73.9262, "dome": False},
    "OAK": {"lat": 37.7516, "lon": -122.2005, "dome": False},
    "PHI": {"lat": 39.9061, "lon": -75.1665, "dome": False},
    "PIT": {"lat": 40.4469, "lon": -80.0057, "dome": False},
    "SD": {"lat": 32.7073, "lon": -117.1573, "dome": False},
    "SEA": {"lat": 47.5914, "lon": -122.3325, "dome": True},
    "SF": {"lat": 37.7786, "lon": -122.3893, "dome": False},
    "STL": {"lat": 38.6226, "lon": -90.1928, "dome": False},
    "TB": {"lat": 27.7682, "lon": -82.6534, "dome": True},
    "TEX": {"lat": 32.7473, "lon": -97.0842, "dome": True},
    "TOR": {"lat": 43.6414, "lon": -79.3894, "dome": True},
    "WSH": {"lat": 38.8730, "lon": -77.0074, "dome": False},
}


def _dir_to_label(degrees: float | None) -> str:
    if degrees is None:
        return "unknown"
    dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    idx = int(((degrees + 22.5) % 360) / 45)
    return dirs[idx]


def main(target_date: str | None = None) -> None:
    run_date = target_date or date.today().isoformat()
    try:
        import os
        from dotenv import load_dotenv
        from supabase import create_client

        load_dotenv()
        sb = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
        games = sb.table("games").select("*").eq("game_date", run_date).execute().data or []
    except Exception:
        games = []

    weather = {}
    for game in games:
        team = game.get("home_team")
        park = BALLPARKS.get(team)
        game_key = f"{game.get('away_team')}@{team}"
        if not park:
            weather[game_key] = {"rain_probability": 0, "wind_speed": 0, "wind_direction": "unknown", "temp_f": None}
            continue
        if park["dome"]:
            weather[game_key] = {"rain_probability": 0, "wind_speed": 0, "wind_direction": "dome", "temp_f": None}
            continue

        url = (
            f"{OPENMETEO_BASE_URL}/forecast?latitude={park['lat']}&longitude={park['lon']}"
            "&hourly=precipitation_probability,windspeed_10m,winddirection_10m,temperature_2m&forecast_days=1"
        )
        resp = requests.get(url, timeout=20)
        resp.raise_for_status()
        hourly = resp.json().get("hourly", {})
        rain_vals = hourly.get("precipitation_probability", [])[:6]
        wind_vals = hourly.get("windspeed_10m", [])[:6]
        dir_vals = hourly.get("winddirection_10m", [])[:6]
        temp_vals = hourly.get("temperature_2m", [])[:1]

        weather[game_key] = {
            "rain_probability": max(rain_vals) if rain_vals else 0,
            "wind_speed": round(sum(wind_vals) / len(wind_vals), 2) if wind_vals else 0,
            "wind_direction": _dir_to_label(dir_vals[0] if dir_vals else None),
            "temp_f": temp_vals[0] if temp_vals else None,
        }

    cache_date = run_date
    path = write_json_cache(f"weather_{cache_date}.json", weather)
    print(f"Wrote weather cache for {len(weather)} games to {path}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=date.today().isoformat())
    parser.add_argument("--mode", default="today")
    parser.add_argument("--window", default="")
    args = parser.parse_args()
    main(args.date)
