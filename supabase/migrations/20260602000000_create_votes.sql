-- Create votes table for Trapaganza 26 artist voting
create table if not exists public.votes (
  id          bigserial primary key,
  artist_name text      not null,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.votes enable row level security;

-- Allow anyone to insert votes
create policy "Anyone can insert votes"
  on public.votes for insert
  with check (true);

-- Allow anyone to read votes (for leaderboard)
create policy "Anyone can read votes"
  on public.votes for select
  using (true);

-- Create an aggregated view for the leaderboard
create or replace view public.vote_counts as
  select artist_name, count(*) as vote_count
  from public.votes
  group by artist_name
  order by vote_count desc;

-- Enable realtime on votes table
alter publication supabase_realtime add table public.votes;
