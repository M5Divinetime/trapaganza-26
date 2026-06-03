-- Allow the public client (Admin UI using anon key) to upsert/read settings
-- (the earlier migration restricted writes to service role only)

-- Drop service-only policy if it exists (safe re-run)
drop policy if exists "Service role can upsert settings" on public.settings;

-- Allow anon to manage settings (World link, etc). You can lock this down later.
create policy "Anyone can manage settings"
  on public.settings for all
  using (true)
  with check (true);

-- Ensure read policy remains (harmless)
create policy if not exists "Anyone can read settings"
  on public.settings for select using (true);