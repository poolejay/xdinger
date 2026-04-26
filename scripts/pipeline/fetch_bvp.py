from __future__ import annotations

from datetime import date

from pybaseball import statcast

from pipeline_utils import today_str, write_json_cache


def main() -> None:
    today = date.today().isoformat()
    output = {}

    # Without a dedicated matchups feed in this stage, we emit a date-stamped
    # placeholder payload that downstream scoring can safely read.
    try:
        df = statcast(start_dt=today, end_dt=today)
        sample_size = 0 if df is None else len(df)
    except Exception:
        sample_size = 0

    output["_meta"] = {
        "date": today,
        "note": "BvP requires batter/pitcher matchup pairs; will be enriched after matchup ingest is added.",
        "sample_rows": sample_size,
    }

    path = write_json_cache(f"bvp_{today_str()}.json", output)
    print(f"Wrote BvP cache to {path}.")


if __name__ == "__main__":
    main()
