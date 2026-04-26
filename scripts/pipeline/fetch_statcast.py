from __future__ import annotations

from datetime import date, timedelta

import pandas as pd
from pybaseball import statcast_batter

from pipeline_utils import today_str, write_json_cache


def _safe_rate(numerator: float, denominator: float) -> float:
    if denominator <= 0:
        return 0.0
    return float(numerator) / float(denominator)


def main() -> None:
    end_date = date.today()
    start_date = end_date - timedelta(days=30)

    players_df = pd.read_json("scripts/pipeline/cache/active_players.json") if False else None
    player_ids: list[int] = []
    try:
        import os
        from supabase import create_client
        from dotenv import load_dotenv

        load_dotenv()
        supabase = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
        res = supabase.table("players").select("mlb_id").limit(150).execute()
        player_ids = [int(row["mlb_id"]) for row in res.data or []]
    except Exception:
        player_ids = []

    results: dict[str, dict] = {}
    for player_id in player_ids:
        try:
            df = statcast_batter(str(start_date), str(end_date), player_id)
        except Exception:
            continue
        if df is None or df.empty:
            continue

        batted = df[df["launch_speed"].notna()].copy()
        pa = len(df)
        barrels = float(batted.get("barrel", pd.Series(dtype=float)).fillna(0).sum()) if "barrel" in batted else 0
        hard_hit = float((batted["launch_speed"] >= 95).sum()) if "launch_speed" in batted else 0
        hrs = float((df.get("events", "") == "home_run").sum()) if "events" in df else 0

        max_ev_recent = (
            float(batted.tail(150)["launch_speed"].max()) if not batted.empty else None
        )
        results[str(player_id)] = {
            "avg_exit_velocity": float(batted["launch_speed"].mean()) if not batted.empty else None,
            "barrel_rate": _safe_rate(barrels, len(batted)),
            "hr_rate": _safe_rate(hrs, pa),
            "hard_hit_rate": _safe_rate(hard_hit, len(batted)),
            "avg_launch_angle": float(batted["launch_angle"].mean()) if "launch_angle" in batted else None,
            "max_ev_recent": max_ev_recent,
            "sample_pa": pa,
            "sample_batted": int(len(batted)),
        }

    path = write_json_cache(f"statcast_{today_str()}.json", results)
    print(f"Wrote Statcast cache for {len(results)} players to {path}.")


if __name__ == "__main__":
    main()
