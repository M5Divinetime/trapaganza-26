-- Settings table for organizer-controlled values (e.g. VRChat world link)
create table if not exists public.settings (
  key   text primary key,
  value text not null default ''
);

alter table public.settings enable row level security;

-- Only service role can write; anon can read (for confirmation page future use)
create policy "Anyone can read settings"
  on public.settings for select
  using (true);

create policy "Service role can upsert settings"
  on public.settings for all
  using (auth.role() = 'service_role');
