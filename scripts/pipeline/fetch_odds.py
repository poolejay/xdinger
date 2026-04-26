from __future__ import annotations

import argparse
from datetime import date

import requests

from pipeline_utils import ODDS_API_KEY, write_json_cache


def _to_int_odds(price) -> int | None:
    try:
        return int(price)
    except Exception:
        return None


def main(target_date: str | None = None) -> None:
    run_date = target_date or date.today().isoformat()
    if not ODDS_API_KEY:
        print("ODDS_API_KEY is missing; writing empty odds cache.")
        write_json_cache(f"odds_{run_date}.json", {})
        return

    url = (
        "https://api.the-odds-api.com/v4/sports/baseball_mlb/odds/"
        f"?apiKey={ODDS_API_KEY}&markets=batter_home_runs&regions=us"
    )
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    events = response.json()

    output = {}
    for event in events:
        for bookmaker in event.get("bookmakers", []):
            for market in bookmaker.get("markets", []):
                if market.get("key") != "batter_home_runs":
                    continue
                for outcome in market.get("outcomes", []):
                    name = outcome.get("description") or outcome.get("name")
                    if not name:
                        continue
                    odds = _to_int_odds(outcome.get("price"))
                    if odds is None:
                        continue
                    entry = output.setdefault(name, {"lines": []})
                    entry["lines"].append(odds)

    for player, entry in output.items():
        lines = entry["lines"]
        lines.sort()
        best = max(lines) if lines else None
        consensus = round(sum(lines) / len(lines), 1) if lines else None
        movement = "flat"
        if best is not None and consensus is not None:
            if best > consensus + 10:
                movement = "up"
            elif best < consensus - 10:
                movement = "down"
        output[player] = {
            "best_odds": best,
            "consensus_odds": consensus,
            "odds_movement": movement,
        }

    path = write_json_cache(f"odds_{run_date}.json", output)
    print(f"Wrote odds cache for {len(output)} players to {path}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=date.today().isoformat())
    parser.add_argument("--mode", default="today")
    parser.add_argument("--window", default="")
    args = parser.parse_args()
    main(args.date)
