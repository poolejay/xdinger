-- User profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_pro boolean default false,
  trial_started_at timestamptz,
  trial_expires_at timestamptz,
  trial_used boolean default false,
  revenuecat_id text,
  subscription_status text default 'free',
  -- free | trialing | active | cancelled | expired
  subscription_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- RLS
alter table profiles enable row level security;
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);
