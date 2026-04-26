from __future__ import annotations

import argparse
import json
import os
from datetime import datetime

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()


def get_supabase():
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)


def calculate_env_score(park_factor: float, wind_speed: float, wind_direction: str, temp_f: float) -> float:
    """Recalculate env_score from fresh weather data."""
    park_component = ((park_factor - 0.85) / 0.30) * 100
    if "out" in wind_direction.lower():
        wind_boost = min(wind_speed / 20, 1.0)
    elif "in" in wind_direction.lower():
        wind_boost = -min(wind_speed / 20, 1.0)
    else:
        wind_boost = 0
    wind_component = (wind_boost + 1) / 2 * 100
    temp_component = min(max((temp_f - 50) / 50 * 100, 0), 100)
    return round(park_component * 0.50 + wind_component * 0.35 + temp_component * 0.15, 1)


def patch_scores(date: str, window: str):
    """Load fresh odds and weather from cache and patch scores."""
    supabase = get_supabase()
    if not supabase:
        print("Missing Supabase env; skipping score patch.")
        return
    try:
        with open(f"scripts/pipeline/cache/odds_{date}.json", encoding="utf-8") as handle:
            odds_data = json.load(handle)
    except FileNotFoundError:
        odds_data = {}

    try:
        with open(f"scripts/pipeline/cache/weather_{date}.json", encoding="utf-8") as handle:
            weather_data = json.load(handle)
    except FileNotFoundError:
        weather_data = {}

    scores = (
        supabase.table("xdinger_scores")
        .select("id, hr_odds, env_score, rain_probability, matchup_id")
        .eq("game_date", date)
        .execute()
    )

    updated = 0
    for score in scores.data or []:
        updates = {
            "odds_updated_at": datetime.now().isoformat(),
            "weather_updated_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        matchup_odds = odds_data.get(str(score.get("matchup_id")))
        if matchup_odds:
            old_odds = score.get("hr_odds")
            new_odds = matchup_odds.get("best_odds")
            if new_odds and new_odds != old_odds:
                if old_odds and new_odds < old_odds:
                    movement = "up"
                elif old_odds and new_odds > old_odds:
                    movement = "down"
                else:
                    movement = "flat"
                updates["hr_odds"] = new_odds
                updates["odds_movement"] = movement

        matchup_weather = weather_data.get(str(score.get("matchup_id")))
        if matchup_weather:
            park_factor = matchup_weather.get("park_factor", 1.0)
            wind_speed = matchup_weather.get("wind_speed", 0)
            wind_direction = matchup_weather.get("wind_direction", "none")
            temp_f = matchup_weather.get("temp_f", 72)
            rain_prob = matchup_weather.get("rain_probability", 0)
            updates["rain_probability"] = rain_prob
            updates["wind_speed"] = wind_speed
            updates["wind_direction"] = wind_direction
            updates["env_score"] = calculate_env_score(park_factor, wind_speed, wind_direction, temp_f)

        supabase.table("xdinger_scores").update(updates).eq("id", score["id"]).execute()
        updated += 1

    print(f"Patched {updated} scores with fresh odds and weather for window={window or 'default'}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=datetime.today().strftime("%Y-%m-%d"))
    parser.add_argument("--mode", default="today")
    parser.add_argument("--window", default="")
    args = parser.parse_args()
    patch_scores(args.date, args.window)
