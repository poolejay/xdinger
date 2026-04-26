from __future__ import annotations

import argparse
from datetime import date

import requests

from pipeline_utils import get_supabase


def main(target_date: str | None = None) -> None:
    today = target_date or date.today().isoformat()
    url = f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={today}"
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    payload = response.json()

    dates = payload.get("dates", [])
    if not dates:
        print("No games scheduled today.")
        return

    games = []
    for game in dates[0].get("games", []):
        teams = game.get("teams", {})
        home_team = teams.get("home", {}).get("team", {})
        away_team = teams.get("away", {}).get("team", {})
        home_abbr = home_team.get("abbreviation") or home_team.get("teamCode") or home_team.get("name", "UNK")[:3].upper()
        away_abbr = away_team.get("abbreviation") or away_team.get("teamCode") or away_team.get("name", "UNK")[:3].upper()
        game_time = game.get("gameDate")
        game_row = {
            "game_date": today,
            "game_time": game_time,
            "home_team": home_abbr,
            "away_team": away_abbr,
            "venue": game.get("venue", {}).get("name"),
            "status": game.get("status", {}).get("detailedState", "scheduled"),
        }
        games.append(game_row)

    supabase = get_supabase(optional=True)
    if games and supabase:
        supabase.table("games").delete().eq("game_date", today).execute()
        supabase.table("games").insert(games).execute()

    print(f"Upserted {len(games)} games for {today}:")
    for game in games:
        print(
            f"- {game['away_team']} @ {game['home_team']} ({game['status']}) {game.get('game_time', '')}"
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=date.today().isoformat())
    parser.add_argument("--mode", default="today")
    parser.add_argument("--window", default="")
    args = parser.parse_args()
    main(args.date)
