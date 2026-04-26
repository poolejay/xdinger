-- Players (batters)
create table players (
  id uuid primary key default gen_random_uuid(),
  mlb_id integer unique not null,
  name_first text not null,
  name_last text not null,
  team text not null,
  position text,
  bats text, -- L, R, S
  created_at timestamptz default now()
);

-- Pitchers
create table pitchers (
  id uuid primary key default gen_random_uuid(),
  mlb_id integer unique not null,
  name_first text not null,
  name_last text not null,
  team text not null,
  throws text, -- L or R
  created_at timestamptz default now()
);

-- Games
create table games (
  id uuid primary key default gen_random_uuid(),
  game_date date not null,
  game_time timestamptz,
  home_team text not null,
  away_team text not null,
  venue text,
  status text default 'scheduled',
  created_at timestamptz default now()
);

-- Daily matchups (one row per batter per game)
create table matchups (
  id uuid primary key default gen_random_uuid(),
  game_date date not null,
  game_id uuid references games(id),
  player_id uuid references players(id),
  pitcher_id uuid references pitchers(id),
  batting_order integer,
  created_at timestamptz default now()
);

-- xDinger scores
create table xdinger_scores (
  id uuid primary key default gen_random_uuid(),
  matchup_id uuid references matchups(id),
  game_date date not null,
  -- Batter power
  barrel_rate numeric,
  exit_velocity numeric,
  hr_rate numeric,
  -- Pitcher vulnerability
  pitcher_hr_rate numeric,
  xfip numeric,
  stuff_grade numeric,
  -- Handedness edge
  hand_matchup text, -- RvR, RvL, LvR, LvL
  batter_avg_vs_hand numeric,
  batter_slg_vs_hand numeric,
  batter_iso_vs_hand numeric,
  -- Pitch matchup
  primary_pitch_type text, -- FF, SL, CU, CH, SI
  primary_pitch_pct numeric,
  batter_avg_vs_pitch numeric,
  batter_whiff_vs_pitch numeric,
  -- Park + Wind
  park_factor numeric,
  wind_speed numeric,
  wind_direction text,
  env_score numeric,
  -- Rain
  rain_probability numeric,
  -- Recent form (N games)
  recent_avg numeric,
  recent_slg numeric,
  recent_hr integer,
  recent_ev numeric,
  recent_games integer default 3,
  -- BvP
  bvp_hr integer,
  bvp_ab integer,
  bvp_avg numeric,
  -- Odds
  hr_odds integer,
  odds_movement text, -- up, down, flat
  -- Final scores
  xdinger_score numeric,
  tier text, -- green, yellow, red
  created_at timestamptz default now()
);

-- Laser scores
create table laser_scores (
  id uuid primary key default gen_random_uuid(),
  matchup_id uuid references matchups(id),
  game_date date not null,
  avg_ev numeric,
  max_ev_recent numeric,
  barrel_rate numeric,
  launch_angle numeric,
  primary_pitch_type text,
  primary_pitch_pct numeric,
  avg_ev_vs_pitch numeric,
  recent_hard_hits integer,
  recent_games integer default 3,
  rain_probability numeric,
  laser_odds integer,
  odds_movement text,
  laser_score numeric,
  tier text, -- laser, yellow, red
  created_at timestamptz default now()
);

create table zone_data (
  id uuid primary key default gen_random_uuid(),
  game_date date not null,
  batter_mlb_id integer not null,
  pitcher_mlb_id integer not null,
  primary_pitch text,
  batter_zones jsonb,
  pitcher_zones jsonb,
  batter_vs_pitch_zones jsonb,
  zone_overlap_score numeric,
  created_at timestamptz default now()
);

-- Enable RLS
alter table players enable row level security;
alter table pitchers enable row level security;
alter table games enable row level security;
alter table matchups enable row level security;
alter table xdinger_scores enable row level security;
alter table laser_scores enable row level security;
alter table zone_data enable row level security;

-- Public read policy (free tier sees limited data, pro sees all)
create policy "public read" on xdinger_scores for select using (true);
create policy "public read" on laser_scores for select using (true);
create policy "public read" on matchups for select using (true);
create policy "public read" on players for select using (true);
create policy "public read" on pitchers for select using (true);
create policy "public read" on games for select using (true);
create policy "public read zone data" on zone_data for select using (true);
