export type Tier = "green" | "yellow" | "red";
export type OddsMove = "up" | "down" | "flat";
export type HandResult = "hot" | "neutral" | "cold";
export type PitchResult = "hot" | "neutral" | "cold";

export interface Player {
  mlb_id: number;
  name_first: string;
  name_last: string;
  team: string;
  position: string;
  bats: string;
}

export interface Pitcher {
  mlb_id: number;
  name_first: string;
  name_last: string;
  team: string;
  throws: string;
}

export interface Game {
  game_time: string;
  home_team: string;
  away_team: string;
  venue: string;
  status: string;
}

export interface ZoneCell {
  xslg?: number;
  zone_pct?: number;
  xslg_allowed?: number;
  pa_count?: number;
}

export interface ZoneData {
  batter_zones: Record<number, ZoneCell | null>;
  pitcher_zones: Record<number, ZoneCell | null>;
  batter_vs_pitch_zones: Record<number, ZoneCell | null>;
  primary_pitch: string;
  zone_overlap_score: number;
}

export interface XDingerRow {
  id: string;
  game_date: string;
  xdinger_score: number;
  tier: Tier;
  player: Player;
  pitcher: Pitcher;
  game: Game;
  rain_probability: number;
  env_score: number;
  park_factor: number;
  wind_speed: number;
  wind_direction: string;
  hand_matchup: string;
  batter_avg_vs_hand: number;
  batter_slg_vs_hand: number;
  primary_pitch_type: string;
  primary_pitch_pct: number;
  batter_avg_vs_pitch: number;
  batter_whiff_vs_pitch: number;
  recent_avg: number;
  recent_slg: number;
  recent_hr: number;
  recent_ev: number;
  recent_games: number;
  bvp_hr: number;
  bvp_ab: number;
  bvp_avg: number;
  hr_odds: number;
  odds_movement: OddsMove;
  hand_result: HandResult;
  pitch_result: PitchResult;
  zone_data?: ZoneData;
  stack_flame?: boolean;
}

export interface LaserRow {
  id: string;
  game_date: string;
  laser_score: number;
  tier: Tier;
  player: Player;
  pitcher: Pitcher;
  game: Game;
  rain_probability: number;
  avg_ev: number;
  max_ev_recent: number;
  barrel_rate: number;
  launch_angle: number;
  primary_pitch_type: string;
  primary_pitch_pct: number;
  avg_ev_vs_pitch: number;
  recent_hard_hits: number;
  recent_games: number;
  laser_odds: number;
  odds_movement: OddsMove;
}
