from __future__ import annotations

from collections import Counter
from datetime import date, timedelta

import requests
from pybaseball import statcast_pitcher

from pipeline_utils import today_str, write_json_cache


def _today_probable_pitchers() -> list[int]:
    today = date.today().isoformat()
    url = f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={today}"
    data = requests.get(url, timeout=30).json()
    ids: list[int] = []
    for d in data.get("dates", []):
        for g in d.get("games", []):
            for side in ("home", "away"):
                pid = g.get("teams", {}).get(side, {}).get("probablePitcher", {}).get("id")
                if pid:
                    ids.append(int(pid))
    return sorted(set(ids))


def main() -> None:
    end_date = date.today()
    start_date = end_date - timedelta(days=30)
    pitcher_ids = _today_probable_pitchers()

    result: dict[str, dict] = {}
    for pitcher_id in pitcher_ids:
        try:
            df = statcast_pitcher(str(start_date), str(end_date), pitcher_id)
        except Exception:
            continue
        if df is None or df.empty or "pitch_type" not in df.columns:
            continue

        pitch_counts = Counter(df["pitch_type"].dropna().tolist())
        total = sum(pitch_counts.values()) or 1
        ranked = pitch_counts.most_common(2)
        primary = ranked[0] if ranked else ("UNK", 0)
        secondary = ranked[1] if len(ranked) > 1 else ("UNK", 0)

        per_pitch = {}
        for pitch_type, count in pitch_counts.items():
            subset = df[df["pitch_type"] == pitch_type]
            per_pitch[pitch_type] = {
                "usage_pct": round(count / total * 100, 2),
                "avg_velocity": float(subset["release_speed"].mean())
                if "release_speed" in subset
                else None,
                "avg_spin_rate": float(subset["release_spin_rate"].mean())
                if "release_spin_rate" in subset
                else None,
            }

        result[str(pitcher_id)] = {
            "primary_pitch_type": primary[0],
            "primary_pitch_pct": round(primary[1] / total * 100, 2),
            "secondary_pitch_type": secondary[0],
            "secondary_pitch_pct": round(secondary[1] / total * 100, 2),
            "pitch_types": per_pitch,
            "batter_vs_pitch": {},
        }

    path = write_json_cache(f"arsenal_{today_str()}.json", result)
    print(f"Wrote arsenal cache for {len(result)} pitchers to {path}.")


if __name__ == "__main__":
    main()
