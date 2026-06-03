# Supabase Setup for TRAPAGANZA

This project uses Supabase as its database and backend services.

## Tables
- `orders` — ticket and sponsorship purchases (GA, Gold, Platinum, comps)
- `votes` — $5 artist votes recorded on click (artist name stored for the $5 vote flow)
- `settings` — key/value store for organizer-controlled values (e.g. `vrchat_world_link`)

## Local / Production Setup

1. Install Supabase CLI if not installed:
   ```bash
   npm install -g supabase
   ```

2. Login:
   ```bash
   supabase login
   ```

3. Link the project (replace with your project ref):
   ```bash
   supabase link --project-ref gjksmlmepvpadaqbaybe
   ```

4. Push all migrations (creates tables + RLS policies):
   ```bash
   supabase db push
   ```
   If push fails, copy/paste the `.sql` files in this `migrations/` folder directly in the Supabase Dashboard → SQL Editor and run them one by one.

## Required Manual Setup in Supabase Dashboard

### 1. Realtime (for future live features)
Realtime is already enabled on the votes table via the migration:
`alter publication supabase_realtime add table public.votes;`

### 2. Send confirmation emails (Ticket + Sponsorship orders)
The function `send-confirmation` is an Edge Function that sends beautiful emails via Resend when an order is inserted.

This is triggered by a **Database Webhook** (not an Edge Function HTTP call):

- In Supabase Dashboard go to **Database → Database Webhooks** (or Database → Triggers in newer UI).
- Create a new webhook on the `orders` table:
  - Trigger: INSERT
  - URL / type: Supabase Edge Function → `send-confirmation`
- Set the secret env var for the function:
  ```bash
  supabase secrets set --project-ref gjksmlmepvpadaqbaybe RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
  ```

The function uses the `record` from the DB webhook payload exactly as:
`const record = body.record ?? body`

It sends a branded confirmation including the order details. GA orders currently mention the world link (world link is managed dynamically via the settings table in Admin).

### 3. Environment Variables (Frontend)
Already configured in `.env` (do not commit real keys in public repos):

```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=...
```

The `src/supabase.js` client automatically falls back to no-op objects if the env vars are missing (useful for deploys before config).

## Votes / Artist Voting Flow
- When a supporter clicks "Vote — $5" the client directly inserts `{ artist_name: "..." }` into `votes`.
- The `$5` payment itself is collected via a separate Stripe Payment Link that has a prefilled_custom_field for artist name.
- No server-side Stripe webhook is used for votes (per project instructions at the time).
- Leaderboard feature was removed.

## Admin Dashboard
`/admin` route shows:
- Orders list + stats
- Ability to add comps (free tickets/sponsors)
- Refund / status updates
- Set the live VRChat world link (saved to `settings` table, used in confirmation flow / messaging)

## Notes
- All client code uses the anon key. This means RLS policies currently allow "anyone" to read/write the tables. Fine for a small temporary event site. Tighten with authenticated users or service keys in production if you keep the project.
- The existing migrations are numbered and safe to re-run (`create ... if not exists`).

## Quick DB schema reference (see migrations for full SQL)
See the individual `*.sql` files.

## Common Commands
```bash
supabase db push
supabase functions deploy send-confirmation
supabase secrets set RESEND_API_KEY=...
```

For help reach out in the event chat or check Supabase docs.