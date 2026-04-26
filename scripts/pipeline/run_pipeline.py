from __future__ import annotations

import argparse
import subprocess
import sys
import time
from datetime import datetime, timedelta

import pytz
import requests

ET = pytz.timezone("America/New_York")

PIPELINE_MODES = {
    "full": [
        "fetch_players.py",
        "fetch_pitchers.py",
        "fetch_games.py",
        "fetch_statcast.py",
        "fetch_splits.py",
        "fetch_pitch_arsenal.py",
        "fetch_zones.py",
        "fetch_bvp.py",
        "fetch_weather.py",
        "fetch_odds.py",
        "score_xdinger.py",
        "score_laser.py",
    ],
    "research": [
        "fetch_players.py",
        "fetch_pitchers.py",
        "fetch_games.py",
        "fetch_splits.py",
        "fetch_pitch_arsenal.py",
        "fetch_zones.py",
        "fetch_bvp.py",
        "score_xdinger.py",
    ],
    "statcast_refresh": [
        "fetch_statcast.py",
        "score_xdinger.py",
        "score_laser.py",
    ],
    "fast_update": [
        "fetch_weather.py",
        "fetch_odds.py",
        "fetch_lineups.py",
        "update_scores.py",
    ],
}


def is_statcast_ready(date: str, max_retries: int = 3) -> bool:
    """Check if today's Statcast data is processed by MLB."""
    for attempt in range(max_retries):
        try:
            url = (
                "https://baseballsavant.mlb.com/statcast_search/csv"
                f"?all=true&type=details&game_date_gt={date}&game_date_lt={date}&player_type=batter"
            )
            response = requests.head(url, timeout=10)
            if response.status_code == 200:
                return True
        except Exception as exc:
            print(f"Statcast check attempt {attempt + 1} failed: {exc}")
        if attempt < max_retries - 1:
            print("Statcast not ready, retrying in 30 minutes...")
            time.sleep(1800)
    return False


def has_games_today(date: str) -> bool:
    """Check if there are MLB games scheduled."""
    url = f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={date}"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        total = data.get("totalGames", 0)
        print(f"Games scheduled for {date}: {total}")
        return total > 0
    except Exception as exc:
        print(f"Error checking schedule: {exc}")
        return False


def run_script(script: str, date: str, mode: str, window: str = "") -> bool:
    """Run a single pipeline script."""
    cmd = [
        sys.executable,
        f"scripts/pipeline/{script}",
        "--date",
        date,
        "--mode",
        mode,
    ]
    if window:
        cmd.extend(["--window", window])

    start = time.time()
    print(f"\n{'=' * 50}")
    print(f"Running {script} [{mode}] {f'window={window}' if window else ''}")
    print(f"{'=' * 50}")

    result = subprocess.run(cmd, capture_output=True, text=True)
    elapsed = round(time.time() - start, 1)
    if result.returncode == 0:
        print(f"✓ {script} complete ({elapsed}s)")
        if result.stdout:
            print(result.stdout)
        return True

    print(f"✗ {script} FAILED ({elapsed}s)")
    if result.stderr:
        print(result.stderr)
    return False


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--type",
        default="full",
        choices=["full", "research", "statcast_refresh", "fast_update"],
    )
    parser.add_argument("--mode", default="today", choices=["today", "tomorrow"])
    parser.add_argument("--window", default="", choices=["", "morning", "afternoon", "evening"])
    args = parser.parse_args()

    now = datetime.now(ET)
    today = now.strftime("%Y-%m-%d")
    tomorrow = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    target_date = tomorrow if args.mode == "tomorrow" else today

    print(f"\n{'=' * 60}")
    print("PIPELINE START")
    print(f"Type: {args.type} | Mode: {args.mode} | Date: {target_date}")
    print(f"Time: {now.strftime('%Y-%m-%d %H:%M:%S ET')}")
    print(f"{'=' * 60}\n")

    if not has_games_today(target_date):
        print(f"No games scheduled for {target_date}. Exiting.")
        sys.exit(0)

    if args.type == "statcast_refresh":
        if not is_statcast_ready(today):
            print("Statcast data not ready after max retries. Exiting.")
            sys.exit(1)

    scripts = PIPELINE_MODES[args.type]
    failed: list[str] = []
    start_total = time.time()

    for script in scripts:
        success = run_script(script, target_date, args.mode, args.window)
        if not success:
            failed.append(script)
            if script in ["fetch_games.py", "score_xdinger.py"]:
                print(f"Critical script {script} failed. Stopping pipeline.")
                break

    total_time = round(time.time() - start_total, 1)
    print(f"\n{'=' * 60}")
    print(f"PIPELINE COMPLETE — {total_time}s total")
    if failed:
        print(f"Failed scripts: {', '.join(failed)}")
    else:
        print("All scripts successful ✓")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()
