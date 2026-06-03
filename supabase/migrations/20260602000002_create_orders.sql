-- Orders table for TRAPAGANZA ticket + sponsorship purchases
create table if not exists public.orders (
  id           bigserial primary key,
  order_number text,
  name         text not null,
  email        text not null,
  vrchat       text,
  brand        text,
  logo         text,
  type         text not null,           -- 'ga' | 'gold' | 'platinum'
  qty          integer default 1,
  total        numeric(10,2),
  status       text default 'pending',  -- 'pending' | 'confirmed' | 'refunded' | 'comp'
  note         text,
  created_at   timestamptz default now()
);

-- Enable RLS
alter table public.orders enable row level security;

-- Anyone (anon key) can insert during checkout flow
create policy "Anyone can insert orders"
  on public.orders for insert
  with check (true);

-- Anyone can read (Admin page uses the anon key from the browser)
create policy "Anyone can read orders"
  on public.orders for select
  using (true);

-- Anyone can update status (Admin actions like mark confirmed / refunded)
create policy "Anyone can update orders"
  on public.orders for update
  using (true);

-- (Optional) Enable realtime on orders if you want live admin updates later
-- alter publication supabase_realtime add table public.orders;