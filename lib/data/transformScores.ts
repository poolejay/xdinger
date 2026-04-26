import {
  Game,
  HandResult,
  LaserRow,
  PitchResult,
  Player,
  Pitcher,
  XDingerRow,
  ZoneCell,
} from "./types";

type RawRow = Record<string, unknown> & {
  id?: string;
  game_date?: string;
  tier?: string;
  matchups?: {
    players?: Record<string, unknown>;
    pitchers?: Record<string, unknown>;
    games?: Record<string, unknown>;
  };
  zone_data?: Array<Record<string, unknown>>;
};

function getHandResult(bats: string, throws: string, avgVsHand: number): HandResult {
  const sameHand = bats === throws;
  if (avgVsHand >= 0.28) return "hot";
  if (avgVsHand >= 0.23 || sameHand) return "neutral";
  return "cold";
}

function getPitchResult(avgVsPitch: number, whiffRate: number): PitchResult {
  if (avgVsPitch >= 0.3 && whiffRate <= 0.2) return "hot";
  if (avgVsPitch >= 0.22 || whiffRate <= 0.3) return "neutral";
  return "cold";
}

function detectStackFlames(rows: RawRow[]): Set<string> {
  const gameCounts: Record<string, number> = {};
  rows.forEach((row) => {
    if (row.tier === "green") {
      const gameKey = `${row.matchups?.games?.home_team}-${row.matchups?.games?.away_team}`;
      gameCounts[gameKey] = (gameCounts[gameKey] || 0) + 1;
    }
  });

  return new Set(
    Object.entries(gameCounts)
      .filter(([, count]) => count >= 2)
      .map(([key]) => key),
  );
}

function toZoneRecord(value: unknown): Record<number, ZoneCell | null> {
  if (!value || typeof value !== "object") return {};
  const out: Record<number, ZoneCell | null> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, cell]) => {
    out[Number(key)] = (cell as ZoneCell | null) ?? null;
  });
  return out;
}

export function transformXDingerRows(raw: RawRow[]): XDingerRow[] {
  const stackGames = detectStackFlames(raw);

  return raw
    .filter(
      (row) =>
        typeof row.id === "string" &&
        typeof row.game_date === "string" &&
        row.matchups?.players &&
        row.matchups?.pitchers &&
        row.matchups?.games,
    )
    .map((row) => {
      const player = row.matchups!.players as unknown as Player;
      const pitcher = row.matchups!.pitchers as unknown as Pitcher;
      const game = row.matchups!.games as unknown as Game;
      const zoneData = row.zone_data?.[0];
      const avgVsHand = Number(row.batter_avg_vs_hand ?? 0);
      const avgVsPitch = Number(row.batter_avg_vs_pitch ?? 0);
      const whiffVsPitch = Number(row.batter_whiff_vs_pitch ?? 0);

      const gameKey = `${game.home_team}-${game.away_team}`;
      return {
        id: String(row.id),
        game_date: String(row.game_date),
        xdinger_score: Number(row.xdinger_score ?? 0),
        tier: (row.tier as XDingerRow["tier"]) ?? "red",
        player,
        pitcher,
        game,
        rain_probability: Number(row.rain_probability ?? 0),
        env_score: Number(row.env_score ?? 50),
        park_factor: Number(row.park_factor ?? 1.0),
        wind_speed: Number(row.wind_speed ?? 0),
        wind_direction: String(row.wind_direction ?? "none"),
        hand_matchup: String(row.hand_matchup ?? `${player.bats}v${pitcher.throws}`),
        batter_avg_vs_hand: avgVsHand,
        batter_slg_vs_hand: Number(row.batter_slg_vs_hand ?? 0),
        primary_pitch_type: String(row.primary_pitch_type ?? "FF"),
        primary_pitch_pct: Number(row.primary_pitch_pct ?? 0),
        batter_avg_vs_pitch: avgVsPitch,
        batter_whiff_vs_pitch: whiffVsPitch,
        recent_avg: Number(row.recent_avg ?? 0),
        recent_slg: Number(row.recent_slg ?? 0),
        recent_hr: Number(row.recent_hr ?? 0),
        recent_ev: Number(row.recent_ev ?? 0),
        recent_games: Number(row.recent_games ?? 3),
        bvp_hr: Number(row.bvp_hr ?? 0),
        bvp_ab: Number(row.bvp_ab ?? 0),
        bvp_avg: Number(row.bvp_avg ?? 0),
        hr_odds: Number(row.hr_odds ?? 0),
        odds_movement: (row.odds_movement as XDingerRow["odds_movement"]) ?? "flat",
        hand_result: getHandResult(player.bats, pitcher.throws, avgVsHand),
        pitch_result: getPitchResult(avgVsPitch, whiffVsPitch),
        zone_data: zoneData
          ? {
              batter_zones: toZoneRecord(zoneData.batter_zones),
              pitcher_zones: toZoneRecord(zoneData.pitcher_zones),
              batter_vs_pitch_zones: toZoneRecord(zoneData.batter_vs_pitch_zones),
              primary_pitch: String(zoneData.primary_pitch ?? "FF"),
              zone_overlap_score: Number(zoneData.zone_overlap_score ?? 50),
            }
          : undefined,
        stack_flame: stackGames.has(gameKey) && row.tier === "green",
      };
    });
}

export function transformLaserRows(raw: RawRow[]): LaserRow[] {
  return raw
    .filter(
      (row) =>
        typeof row.id === "string" &&
        typeof row.game_date === "string" &&
        row.matchups?.players &&
        row.matchups?.pitchers &&
        row.matchups?.games,
    )
    .map((row) => ({
      id: String(row.id),
      game_date: String(row.game_date),
      laser_score: Number(row.laser_score ?? 0),
      tier: (row.tier as LaserRow["tier"]) ?? "red",
      player: row.matchups!.players as unknown as Player,
      pitcher: row.matchups!.pitchers as unknown as Pitcher,
      game: row.matchups!.games as unknown as Game,
      rain_probability: Number(row.rain_probability ?? 0),
      avg_ev: Number(row.avg_ev ?? 0),
      max_ev_recent: Number(row.max_ev_recent ?? 0),
      barrel_rate: Number(row.barrel_rate ?? 0),
      launch_angle: Number(row.launch_angle ?? 0),
      primary_pitch_type: String(row.primary_pitch_type ?? "FF"),
      primary_pitch_pct: Number(row.primary_pitch_pct ?? 0),
      avg_ev_vs_pitch: Number(row.avg_ev_vs_pitch ?? 0),
      recent_hard_hits: Number(row.recent_hard_hits ?? 0),
      recent_games: Number(row.recent_games ?? 3),
      laser_odds: Number(row.laser_odds ?? 0),
      odds_movement: (row.odds_movement as LaserRow["odds_movement"]) ?? "flat",
    }));
}
