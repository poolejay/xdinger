from __future__ import annotations

import argparse
from datetime import date

from pipeline_utils import get_supabase, normalize, read_json_cache

WEIGHTS = {
    "batter_power": 0.235,
    "pitcher_vulnerability": 0.1692,
    "handedness_edge": 0.188,
    "pitch_matchup": 0.1598,
    "park_wind": 0.094,
    "recent_form": 0.0564,
    "bvp": 0.0376,
    "zone_overlap": 0.06,
}


def _default_recent_form(statcast_entry: dict | None) -> tuple[float, float, int, float, int]:
    if not statcast_entry:
        return 0.25, 0.4, 0, 88.0, 3
    avg = 0.2 + ((statcast_entry.get("avg_exit_velocity") or 88) - 85) / 100
    slg = 0.3 + (statcast_entry.get("hard_hit_rate") or 0.35) * 0.8
    hr = 1 if (statcast_entry.get("hr_rate") or 0) > 0.04 else 0
    ev = statcast_entry.get("max_ev_recent") or statcast_entry.get("avg_exit_velocity") or 88
    return avg, slg, hr, ev, 3


def calculate_zone_overlap_score(batter_zones: dict | None, pitcher_zones: dict | None) -> float:
    """
    Calculate how much the pitcher throws to zones where the batter is dangerous.
    Returns 0-100 score. 50 is neutral.
    """
    if not batter_zones or not pitcher_zones:
        return 50

    overlap_score = 0.0
    total_weight = 0.0
    for zone in range(1, 10):
        b = batter_zones.get(str(zone)) or batter_zones.get(zone)
        p = pitcher_zones.get(str(zone)) or pitcher_zones.get(zone)
        if not b or not p:
            continue
        batter_xslg = b.get("xslg", 0.4) or 0.4
        pitcher_zone_pct = p.get("zone_pct", 0.11) or 0.11
        zone_danger = batter_xslg * pitcher_zone_pct
        overlap_score += zone_danger
        total_weight += pitcher_zone_pct

    if total_weight == 0:
        return 50
    raw = overlap_score / total_weight
    return normalize(raw, 0.25, 0.65)


def main(target_date: str | None = None) -> None:
    today = target_date or date.today().isoformat()
    statcast = read_json_cache(f"statcast_{today}.json", default={}) or {}
    weather = read_json_cache(f"weather_{today}.json", default={}) or {}
    odds = read_json_cache(f"odds_{today}.json", default={}) or {}
    zones = read_json_cache(f"zones_{today}.json", default={}) or {}

    supabase = get_supabase(optional=True)
    if not supabase:
        print("Missing Supabase env; scoring dry run with no DB writes.")
        players = []
    else:
        players = supabase.table("players").select("*").limit(150).execute().data or []

    rows = []
    for player in players:
        mlb_id = str(player["mlb_id"])
        s = statcast.get(mlb_id, {})
        recent_avg, recent_slg, recent_hr, recent_ev, recent_games = _default_recent_form(s)

        power_score = (
            normalize(s.get("barrel_rate"), 0, 0.20) * 0.40
            + normalize(s.get("avg_exit_velocity"), 85, 100) * 0.35
            + normalize(s.get("hr_rate"), 0, 0.08) * 0.25
        )
        pitcher_score = (
            normalize(0.02, 0, 0.05) * 0.40
            + normalize(9 - 4.20, 3, 9) * 0.35
            + normalize(52, 0, 100) * 0.25
        )
        hand_score = (
            normalize(0.245, 0.150, 0.350) * 0.35
            + normalize(0.410, 0.250, 0.650) * 0.35
            + normalize(0.165, 0.050, 0.300) * 0.30
        )
        pitch_score = (
            normalize(0.240, 0.150, 0.400) * 0.40
            + normalize(1 - 0.28, 0.40, 1.0) * 0.35
            + normalize(s.get("avg_exit_velocity"), 85, 100) * 0.25
        )

        team_weather = next(
            (
                w
                for game_key, w in weather.items()
                if game_key.endswith(f"@{player.get('team')}")
            ),
            {"wind_speed": 0, "wind_direction": "unknown", "rain_probability": 0},
        )
        wind_boost = 1 if team_weather.get("wind_speed", 0) >= 15 else 0
        park_wind_score = (
            normalize(1.0, 0.85, 1.15) * 0.60
            + normalize(wind_boost, -1, 1) * 0.40
        )
        form_score = (
            normalize(recent_avg, 0.150, 0.400) * 0.30
            + normalize(recent_slg, 0.250, 0.700) * 0.30
            + normalize(recent_hr / recent_games, 0, 0.5) * 0.25
            + normalize(recent_ev, 85, 100) * 0.15
        )
        bvp_score = 50
        zone_payload = zones.get(mlb_id, {})
        zone_overlap_score = calculate_zone_overlap_score(
            zone_payload.get("batter_zones"),
            zone_payload.get("pitcher_zones"),
        )

        xdinger_score = (
            power_score * WEIGHTS["batter_power"]
            + pitcher_score * WEIGHTS["pitcher_vulnerability"]
            + hand_score * WEIGHTS["handedness_edge"]
            + pitch_score * WEIGHTS["pitch_matchup"]
            + park_wind_score * WEIGHTS["park_wind"]
            + form_score * WEIGHTS["recent_form"]
            + bvp_score * WEIGHTS["bvp"]
            + zone_overlap_score * WEIGHTS["zone_overlap"]
        ) / sum(WEIGHTS.values())

        tier = "green" if xdinger_score >= 70 else "yellow" if xdinger_score >= 50 else "red"

        odds_entry = odds.get(f"{player['name_first']} {player['name_last']}", {})
        rows.append(
            {
                "game_date": today,
                "barrel_rate": s.get("barrel_rate"),
                "exit_velocity": s.get("avg_exit_velocity"),
                "hr_rate": s.get("hr_rate"),
                "pitcher_hr_rate": 0.02,
                "xfip": 4.20,
                "stuff_grade": 52,
                "hand_matchup": "RvR",
                "batter_avg_vs_hand": 0.245,
                "batter_slg_vs_hand": 0.410,
                "batter_iso_vs_hand": 0.165,
                "primary_pitch_type": "FF",
                "primary_pitch_pct": 40,
                "batter_avg_vs_pitch": 0.240,
                "batter_whiff_vs_pitch": 0.28,
                "park_factor": 1.0,
                "wind_speed": team_weather.get("wind_speed"),
                "wind_direction": team_weather.get("wind_direction"),
                "env_score": park_wind_score,
                "rain_probability": team_weather.get("rain_probability"),
                "recent_avg": recent_avg,
                "recent_slg": recent_slg,
                "recent_hr": recent_hr,
                "recent_ev": recent_ev,
                "recent_games": recent_games,
                "bvp_hr": 0,
                "bvp_ab": 0,
                "bvp_avg": 0.0,
                "hr_odds": odds_entry.get("best_odds"),
                "odds_movement": odds_entry.get("odds_movement", "flat"),
                "xdinger_score": round(xdinger_score, 2),
                "tier": tier,
            }
        )

    if rows and supabase:
        supabase.table("xdinger_scores").delete().eq("game_date", today).execute()
        supabase.table("xdinger_scores").insert(rows).execute()
    print(f"Wrote {len(rows)} xDinger score rows for {today}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=date.today().isoformat())
    parser.add_argument("--mode", default="today")
    parser.add_argument("--window", default="")
    args = parser.parse_args()
    main(args.date)
