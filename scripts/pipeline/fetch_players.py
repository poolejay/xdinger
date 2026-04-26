from __future__ import annotations

from datetime import date

import pandas as pd
import requests
from pybaseball import batting_stats, playerid_lookup

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
    mlb_ids = (
        lookup_df["key_mlbam"].dropna().astype(int).sort_values(ascending=False).tolist()
    )
    return mlb_ids[0] if mlb_ids else None


def main() -> None:
    year = date.today().year
    try:
        stats: pd.DataFrame = batting_stats(year, qual=0)
    except Exception:
        stats = pd.DataFrame()

    supabase = get_supabase(optional=True)
    records: list[dict] = []

    # Limit lookup volume to realistic active hitter pool.
    for _, row in stats.head(500).iterrows():
        first_name, last_name = _split_name(row.get("Name", ""))
        if not first_name or not last_name:
            continue
        mlb_id = _lookup_mlb_id(first_name, last_name)
        if not mlb_id:
            continue

        records.append(
            {
                "mlb_id": mlb_id,
                "name_first": first_name,
                "name_last": last_name,
                "team": str(row.get("Team", "UNK"))[:10],
                "position": str(row.get("Pos", ""))[:10] or None,
                "bats": None,
            }
        )

    # MLB Stats API fallback to avoid Fangraphs-blocked runs.
    teams_resp = requests.get("https://statsapi.mlb.com/api/v1/teams?sportId=1", timeout=30)
    teams_resp.raise_for_status()
    teams = teams_resp.json().get("teams", [])
    for team in teams:
        roster_resp = requests.get(
            f"https://statsapi.mlb.com/api/v1/teams/{team['id']}/roster?rosterType=active",
            timeout=30,
        )
        if roster_resp.status_code != 200:
            continue
        for player in roster_resp.json().get("roster", []):
            person = player.get("person", {})
            position = player.get("position", {}).get("abbreviation", "")
            if position == "P":
                continue
            records.append(
                {
                    "mlb_id": person.get("id"),
                    "name_first": person.get("fullName", "").split(" ")[0] or "Unknown",
                    "name_last": " ".join(person.get("fullName", "").split(" ")[1:]) or "Unknown",
                    "team": team.get("abbreviation", "UNK")[:10],
                    "position": position[:10] or None,
                    "bats": None,
                }
            )

    unique_by_mlb_id = {item["mlb_id"]: item for item in records if item.get("mlb_id")}
    payload = list(unique_by_mlb_id.values())
    if not payload:
        print("No players resolved with MLBAM IDs.")
        return

    if supabase:
        supabase.table("players").upsert(payload, on_conflict="mlb_id").execute()
        print(f"Upserted {len(payload)} players.")
    else:
        print(f"Prepared {len(payload)} players (dry run: missing Supabase env).")


if __name__ == "__main__":
    main()
