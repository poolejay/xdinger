from __future__ import annotations

import json
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
from pybaseball import statcast_batter, statcast_pitcher

from pipeline_utils import CACHE_DIR


def get_batter_zone_stats(mlb_id: int, days_back: int = 365):
    """Pull full season zone performance for a batter."""
    end = datetime.today().strftime("%Y-%m-%d")
    start = (datetime.today() - timedelta(days=days_back)).strftime("%Y-%m-%d")

    data = statcast_batter(start, end, player_id=mlb_id)
    if data is None or data.empty:
        return None

    batted = data[data["type"] == "X"].copy()
    zone_stats = {}
    for zone in range(1, 10):
        zone_data = batted[batted["zone"] == zone]
        if len(zone_data) < 5:
            zone_stats[zone] = None
            continue

        xslg = zone_data["estimated_slg_using_speedangle"].mean()
        avg_ev = zone_data["launch_speed"].mean()
        hr_count = len(zone_data[zone_data["events"] == "home_run"])
        pa_count = len(zone_data)
        zone_stats[zone] = {
            "xslg": round(float(xslg), 3) if pd.notna(xslg) else None,
            "avg_ev": round(float(avg_ev), 1) if pd.notna(avg_ev) else None,
            "hr_rate": round(hr_count / pa_count, 3),
            "pa_count": pa_count,
        }
    return zone_stats


def get_pitcher_zone_stats(mlb_id: int, days_back: int = 365):
    """Pull full season zone tendencies for a pitcher."""
    end = datetime.today().strftime("%Y-%m-%d")
    start = (datetime.today() - timedelta(days=days_back)).strftime("%Y-%m-%d")
    data = statcast_pitcher(start, end, player_id=mlb_id)
    if data is None or data.empty:
        return None

    zone_stats = {}
    for zone in range(1, 10):
        zone_data = data[data["zone"] == zone]
        total = len(data)
        if total == 0 or len(zone_data) < 5:
            zone_stats[zone] = None
            continue

        zone_pct = len(zone_data) / total
        batted = zone_data[zone_data["type"] == "X"]
        xslg_allowed = batted["estimated_slg_using_speedangle"].mean()
        zone_stats[zone] = {
            "zone_pct": round(zone_pct, 3),
            "xslg_allowed": round(float(xslg_allowed), 3)
            if pd.notna(xslg_allowed)
            else None,
            "pitch_count": len(zone_data),
        }
    return zone_stats


def get_batter_zone_by_pitch(mlb_id: int, pitch_type: str, days_back: int = 365):
    """Pull zone performance for a batter vs a specific pitch type."""
    end = datetime.today().strftime("%Y-%m-%d")
    start = (datetime.today() - timedelta(days=days_back)).strftime("%Y-%m-%d")
    data = statcast_batter(start, end, player_id=mlb_id)
    if data is None or data.empty:
        return None

    pitch_data = data[data["pitch_type"] == pitch_type].copy()
    batted = pitch_data[pitch_data["type"] == "X"]
    zone_stats = {}
    for zone in range(1, 10):
        zone_data = batted[batted["zone"] == zone]
        if len(zone_data) < 3:
            zone_stats[zone] = None
            continue
        xslg = zone_data["estimated_slg_using_speedangle"].mean()
        zone_stats[zone] = {
            "xslg": round(float(xslg), 3) if pd.notna(xslg) else None,
            "pa_count": len(zone_data),
        }
    return zone_stats


def run():
    today = datetime.today().strftime("%Y-%m-%d")
    matchup_path = CACHE_DIR / f"matchups_{today}.json"
    if not matchup_path.exists():
        print(f"No matchup cache found at {matchup_path}; skipping zone fetch.")
        out_path = CACHE_DIR / f"zones_{today}.json"
        out_path.write_text("{}", encoding="utf-8")
        return

    matchups = json.loads(matchup_path.read_text(encoding="utf-8"))
    results = {}
    for matchup in matchups:
        batter_id = matchup["batter_mlb_id"]
        pitcher_id = matchup["pitcher_mlb_id"]
        primary_pitch = matchup.get("primary_pitch_type", "FF")
        print(f"Fetching zones for {matchup['batter_name']} vs {matchup['pitcher_name']}...")
        results[str(batter_id)] = {
            "batter_zones": get_batter_zone_stats(batter_id),
            "pitcher_zones": get_pitcher_zone_stats(pitcher_id),
            "batter_vs_pitch_zones": get_batter_zone_by_pitch(batter_id, primary_pitch),
            "primary_pitch": primary_pitch,
            "pitcher_id": pitcher_id,
            "pitcher_name": matchup["pitcher_name"],
            "batter_name": matchup["batter_name"],
        }

    out_path = CACHE_DIR / f"zones_{today}.json"
    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"Zone data cached for {len(results)} batters at {out_path}")


if __name__ == "__main__":
    run()
