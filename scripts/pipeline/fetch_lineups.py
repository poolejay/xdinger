from __future__ import annotations

import argparse
import os
from datetime import datetime

import requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()


def get_supabase():
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)


def fetch_lineups(date: str):
    url = f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={date}&hydrate=lineups"
    response = requests.get(url, timeout=15)
    data = response.json()

    lineups = {}
    for date_entry in data.get("dates", []):
        for game in date_entry.get("games", []):
            game_pk = game["gamePk"]
            home_lineup = game.get("lineups", {}).get("homePlayers", [])
            away_lineup = game.get("lineups", {}).get("awayPlayers", [])
            if home_lineup or away_lineup:
                lineups[game_pk] = {
                    "confirmed": True,
                    "home": [p["id"] for p in home_lineup],
                    "away": [p["id"] for p in away_lineup],
                }
            else:
                lineups[game_pk] = {"confirmed": False, "home": [], "away": []}
    return lineups


def update_matchup_lineups(lineups: dict, date: str):
    supabase = get_supabase()
    if not supabase:
        print("Missing Supabase env; skipping lineup write.")
        return 0
    confirmed_count = 0
    for _, lineup_data in lineups.items():
        if not lineup_data["confirmed"]:
            continue

        home = lineup_data["home"]
        away = lineup_data["away"]
        for position, mlb_id in enumerate(home + away, 1):
            batting_order = position if position <= len(home) else position - len(home)
            supabase.table("matchups").update(
                {
                    "lineup_confirmed": True,
                    "batting_order": batting_order,
                    "updated_at": datetime.now().isoformat(),
                }
            ).eq("game_date", date).execute()
        confirmed_count += 1

    print(f"Lineups confirmed for {confirmed_count} games")
    return confirmed_count


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=datetime.today().strftime("%Y-%m-%d"))
    parser.add_argument("--mode", default="today")
    parser.add_argument("--window", default="")
    args = parser.parse_args()

    print(f"Fetching lineups for {args.date}...")
    lineups = fetch_lineups(args.date)
    update_matchup_lineups(lineups, args.date)
    print("Lineup update complete")
