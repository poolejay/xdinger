alter table xdinger_scores
  add column if not exists odds_updated_at timestamptz,
  add column if not exists weather_updated_at timestamptz,
  add column if not exists lineup_confirmed boolean default false,
  add column if not exists updated_at timestamptz default now();

alter table matchups
  add column if not exists lineup_confirmed boolean default false,
  add column if not exists batting_order integer,
  add column if not exists updated_at timestamptz default now();

create index if not exists idx_xdinger_game_date on xdinger_scores(game_date);
create index if not exists idx_xdinger_score on xdinger_scores(xdinger_score desc);
create index if not exists idx_laser_game_date on laser_scores(game_date);
create index if not exists idx_matchups_game_date on matchups(game_date);
create index if not exists idx_zone_batter_date on zone_data(batter_mlb_id, game_date);
