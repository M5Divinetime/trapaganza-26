# TRAPAGANZA 26

**Trap Street Radio presents TRAPAGANZA** — a live VRChat music event on June 13, 2026 at 8:30 PM ET.

Website: https://www.trapaganza.com (or preview via the orchids platform)

## Features
- Hero + schedule + artist lineup
- Live Voting for your favorite artist with direct $5 Stripe Payment Links (artist name pre-filled)
- Tickets (GA) + tiered Sponsorship packages (Gold / Platinum) sold via Stripe Checkout
- Admin dashboard for managing orders, comps, refunds and the VRChat world link that is emailed to attendees
- Email confirmation on purchase (powered by Resend via Supabase Edge Function)
- Supabase-powered data layer:
  - `orders` table for sales tracking
  - `votes` table for recording artist vote clicks
  - `settings` table for dynamic world link / other organizer config

## Tech Stack
- **Frontend**: Vite + React 19 + Tailwind CSS + custom angled UI components matching the dark red/black aesthetic
- **Backend / DB**: Supabase (Postgres + RLS + Realtime + Edge Functions)
- **Payments**: Stripe (hosted checkout + Payment Links)
- **Email**: Resend via Supabase DB Webhook

## Development

### Local Setup

```bash
git clone https://github.com/M5Divinetime/trapaganza-26.git
cd trapaganza-26

# install
npm install
# or with bun
# bun install

# create .env based on .env.example and fill:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON
#   VITE_APP_URL (optional — set to your orchids preview origin)
cp .env.example .env

npm run dev
```

Open localhost:5173.

### Supabase

See `supabase/README.md` for full setup:

- Tables:
  - `orders`
  - `votes`
  - `settings`
- Database migrations are located under `supabase/migrations/`
- Push migrations with `supabase db push` after `supabase link`
- Set up the DB Webhook on the `orders` table pointing to the `send-confirmation` Edge Function (used for emailing buyers)
- Store `RESEND_API_KEY` under Supabase project secrets

## Stripe Payment Links

Ticket / sponsorship purchases use direct Stripe hosted checkout links (configured in `src/Tickets.jsx`).

Artist votes use a fixed Stripe Payment Link that includes an `artist_name` custom text field (pre-filled via query param in `src/VoteSection.jsx`).

When testing on a preview environment with a custom branded domain (e.g. `www.trapaganza.com`), set:

```
VITE_APP_URL=https://your-safe-orchids-cloud-preview-url
```

This ensures Stripe success/cancel redirect URLs point to a domain with proper certificates.

## Admin

Visit `/admin` (route handled via routing in the platform). Requires no password — kept simple for the event organizers.

Features:
- Live stats (revenue, ticket counts)
- Full orders list with status management and CSV exports
- Comp / free ticket issuance
- Set the VRChat world link (persisted in Supabase settings and used in UI text)

## Notes

- No leaderboard anymore (per latest updates).
- Votes are inserted client side when the Vote button is pressed (before the Stripe Payment Link tab is opened).
- Worlds entry links are delivered manually / by email; the link value is managed in Admin and referenced in paid order confirmations.
- All sales are final.

## Deployment

Hosted via the Orchids preview platform for rapid iteration (orchids.cloud subdomains).

For custom domains, make sure SSL certificates are fully provisioned by the platform before pointing `https://www.trapaganza.com`.

## License

Private / event use.

## Credits
Trap Street Radio / Goddesz609vr

---

Built with ❤️ + a lot of red accents for Trapaganza 26.