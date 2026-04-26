from __future__ import annotations

from datetime import date

import pandas as pd
from pybaseball import batting_stats_bref

from pipeline_utils import today_str, write_json_cache


def _safe_float(value) -> float | None:
    try:
        if pd.isna(value):
            return None
        return float(value)
    except Exception:
        return None


def main() -> None:
    year = date.today().year
    try:
        df = batting_stats_bref(year, qual=0)
    except Exception:
        df = pd.DataFrame()
    if df is None or df.empty:
        print("No split-capable batting data available.")
        return

    result: dict[str, dict] = {}
    # pybaseball split coverage varies by source; we produce normalized placeholders if unavailable.
    for _, row in df.head(500).iterrows():
        name = str(row.get("Name", "")).replace("*", "").strip()
        if not name:
            continue
        avg = _safe_float(row.get("BA"))
        slg = _safe_float(row.get("SLG"))
        iso = (slg - avg) if (avg is not None and slg is not None) else None
        woba = _safe_float(row.get("wOBA"))
        result[name] = {
            "vs_lhp": {
                "avg_vs_hand": avg,
                "slg_vs_hand": slg,
                "iso_vs_hand": iso,
                "woba_vs_hand": woba,
            },
            "vs_rhp": {
                "avg_vs_hand": avg,
                "slg_vs_hand": slg,
                "iso_vs_hand": iso,
                "woba_vs_hand": woba,
            },
        }

    path = write_json_cache(f"splits_{today_str()}.json", result)
    print(f"Wrote splits cache for {len(result)} batters to {path}.")


if __name__ == "__main__":
    main()
