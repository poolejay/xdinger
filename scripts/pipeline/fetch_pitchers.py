from __future__ import annotations

from datetime import date

import pandas as pd
import requests
from pybaseball import pitching_stats, playerid_lookup

from pipeline_utils import get_supabase


def _split_name(full_name: str) -> tuple[str, str]:
    cleaned = " ".join(str(full_name).replace("*", "").split())
    parts = cleaned.split(" ")
    if len(parts) == 1:
        return parts[0], parts[0]
    return " ".join(parts[:-1]), parts[-1]


def _lookup_mlb_id(first_name: str, last_name: str) -> int | None:
    try:
        lookup_df = playerid_lookup(last_name, first_name)
    except Exception:
        return None
    if lookup_df is None or lookup_df.empty or "key_mlbam" not in lookup_df.columns:
        return None
    ids = lookup_df["key_mlbam"].dropna().astype(int).tolist()
    return ids[-1] if ids else None


def main() -> None:
    year = date.today().year
    try:
        stats: pd.DataFrame = pitching_stats(year, qual=1)
    except Exception:
        stats = pd.DataFrame()

    starter_col = "GS" if "GS" in stats.columns else None
    if starter_col:
        stats = stats[stats[starter_col].fillna(0) > 0]

    supabase = get_supabase(optional=True)
    rows: list[dict] = []
    for _, row in stats.head(250).iterrows():
        first_name, last_name = _split_name(row.get("Name", ""))
        if not first_name or not last_name:
            continue
        mlb_id = _lookup_mlb_id(first_name, last_name)
        if not mlb_id:
            continue
        throws = str(row.get("Throws", "")).strip().upper()
        throws = throws if throws in {"L", "R"} else None
        rows.append(
            {
                "mlb_id": mlb_id,
                "name_first": first_name,
                "name_last": last_name,
                "team": str(row.get("Team", "UNK"))[:10],
                "throws": throws,
            }
        )

    today = date.today().isoformat()
    sched = requests.get(
        f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={today}&hydrate=probablePitcher,team",
        timeout=30,
    ).json()
    for day in sched.get("dates", []):
        for game in day.get("games", []):
            for side in ("home", "away"):
                pitcher = game.get("teams", {}).get(side, {}).get("probablePitcher", {})
                if not pitcher:
                    continue
                full_name = pitcher.get("fullName", "Unknown Unknown")
                first = full_name.split(" ")[0]
                last = " ".join(full_name.split(" ")[1:]) or "Unknown"
                team_abbr = (
                    game.get("teams", {})
                    .get(side, {})
                    .get("team", {})
                    .get("abbreviation", "UNK")
                )
                rows.append(
                    {
                        "mlb_id": int(pitcher.get("id")),
                        "name_first": first,
                        "name_last": last,
                        "team": team_abbr[:10],
                        "throws": None,
                    }
                )

    payload = list({item["mlb_id"]: item for item in rows}.values())
    if payload and supabase:
        supabase.table("pitchers").upsert(payload, on_conflict="mlb_id").execute()
        print(f"Upserted {len(payload)} pitchers (starters pool).")
    else:
        print(f"Prepared {len(payload)} pitchers (dry run: missing Supabase env).")


if __name__ == "__main__":
    main()
