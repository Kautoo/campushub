-- CampusHub 2.0 — schema for vanilla Postgres (Render Postgres compatible).
-- Ported from supabase/migrations/0001_init.sql with Supabase-isms removed:
--   * references auth.users → public.users (Auth.js-managed table below)
--   * no on_auth_user_created trigger (Auth.js creates users via code)
--   * no auth.uid() helpers / RLS policies (scoping enforced by lib/db/repo.ts)
--   * no storage.* section (replaced by the public.files table)
-- Money: integer cents, currency MYR. Org isolation via org_id + repo scoping.

create extension if not exists "pgcrypto";

-- ============ Auth.js users ============
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null unique,
  email_verified timestamptz,
  image text,
  password_hash text,
  created_at timestamptz not null default now()
);

-- ============ Core identity ============
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  description text,
  currency text not null default 'MYR',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.org_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','staff')),
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- ============ Events ============
create table public.events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  cover_url text,
  venue text,
  category text,
  start_at timestamptz,
  end_at timestamptz,
  capacity integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published','cancelled','completed')),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, slug)
);

create table public.ticket_tiers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  price_cents integer not null default 0,
  quantity integer not null default 0,
  sold integer not null default 0,
  perks text[] default '{}',
  sale_start timestamptz,
  sale_end timestamptz,
  max_per_order integer not null default 5,
  created_at timestamptz not null default now()
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  tier_id uuid references public.ticket_tiers(id),
  org_id uuid not null references public.organizations(id) on delete cascade,
  attendee_name text not null,
  attendee_email text not null,
  qty integer not null default 1,
  amount_cents integer not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','checked_in','cancelled')),
  qr_token text not null unique default gen_random_uuid()::text,
  checkin_at timestamptz,
  paypal_order_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ Commerce ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  images text[] default '{}',
  category text,
  price_cents integer not null default 0,
  stock integer not null default 0,
  low_stock_threshold integer not null default 5,
  sku text,
  status text not null default 'active' check (status in ('active','draft','archived')),
  channel3_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, slug)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  delta integer not null,
  reason text not null,
  ref_id uuid,
  created_at timestamptz not null default now()
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  session_token text not null unique,
  created_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  qty integer not null default 1,
  created_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  order_number text not null unique,
  customer_name text,
  customer_email text not null,
  subtotal_cents integer not null default 0,
  fee_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'MYR',
  status text not null default 'pending' check (status in ('pending','paid','fulfilled','cancelled','refunded')),
  paypal_order_id text,
  paypal_capture_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.products(id),
  tier_id uuid references public.ticket_tiers(id),
  registration_id uuid references public.registrations(id),
  kind text not null default 'product' check (kind in ('product','ticket')),
  name_snapshot text not null,
  qty integer not null default 1,
  unit_price_cents integer not null default 0
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  order_id uuid references public.orders(id),
  registration_id uuid references public.registrations(id),
  provider text not null default 'paypal',
  provider_ref text,
  type text not null default 'payment' check (type in ('payment','refund')),
  amount_cents integer not null default 0,
  currency text not null default 'MYR',
  status text not null default 'pending' check (status in ('pending','completed','failed','reversed')),
  verified boolean not null default false,
  raw jsonb,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'paypal',
  event_type text not null,
  provider_event_id text not null unique,
  payload jsonb,
  status text not null default 'received' check (status in ('received','processed','failed')),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============ Platform ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.users(id),
  type text not null default 'system',
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null default 'summary' check (kind in ('summary','anomaly','recommendation','chat')),
  prompt text,
  response text,
  model text,
  data_window jsonb,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  type text not null,
  params jsonb,
  file_url text,
  status text not null default 'pending' check (status in ('pending','ready','failed')),
  created_at timestamptz not null default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.users(id),
  action text not null,
  entity text,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- ============ Files (replaces Supabase Storage) ============
create table public.files (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  bucket text not null,
  name text not null,
  mime text not null default 'application/octet-stream',
  bytes bytea not null,
  size integer not null default 0,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create index idx_files_org_bucket on public.files(org_id, bucket);

-- ============ Indexes ============
create index idx_events_org on public.events(org_id, status);
create index idx_ticket_tiers_event on public.ticket_tiers(event_id);
create index idx_registrations_org on public.registrations(org_id, status);
create index idx_registrations_event on public.registrations(event_id);
create index idx_products_org on public.products(org_id, status);
create index idx_orders_org on public.orders(org_id, status, created_at desc);
create index idx_order_items_order on public.order_items(order_id);
create index idx_transactions_org on public.transactions(org_id, created_at desc);
create index idx_notifications_org on public.notifications(org_id, read_at);
create index idx_inventory_movements_product on public.inventory_movements(product_id, created_at desc);
create index idx_activity_log_org on public.activity_log(org_id, created_at desc);

-- ============ Order number generator ============
create or replace function public.next_order_number()
returns text language plpgsql as $$
declare
  n bigint;
begin
  select coalesce(max(substring(order_number from '[0-9]+$')::bigint), 1000) + 1
    into n
  from public.orders
  where order_number like 'CH-%'
    and substring(order_number from '[0-9]+$') ~ '^[0-9]+$';
  return 'CH-' || n::text;
end $$;

-- ============ place_order RPC: atomic stock decrement + order creation ============
-- p_items: [{"product_id": uuid, "qty": int}] or [{"tier_id": uuid, "qty": int}]
-- Prices and stock are read from the DB server-side. Never trust the client.
create or replace function public.place_order(
  p_org uuid,
  p_customer_name text,
  p_customer_email text,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_tier public.ticket_tiers;
  v_qty integer;
  v_subtotal integer := 0;
  v_registration_id uuid;
  v_fee integer;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  -- Validate + price every line from DB
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_item->>'qty')::int, 0);
    if v_qty < 1 then
      raise exception 'Invalid quantity';
    end if;

    if v_item ? 'product_id' then
      select * into v_product from public.products
        where id = (v_item->>'product_id')::uuid
          and org_id = p_org
          and status = 'active'
          for update;
      if v_product.id is null then
        raise exception 'Product not available';
      end if;
      if v_product.stock < v_qty then
        raise exception 'Insufficient stock for %', v_product.name;
      end if;
      v_subtotal := v_subtotal + v_product.price_cents * v_qty;
      update public.products
        set stock = stock - v_qty, updated_at = now()
        where id = v_product.id;
      insert into public.inventory_movements (product_id, org_id, delta, reason)
        values (v_product.id, p_org, -v_qty, 'order');
    elsif v_item ? 'tier_id' then
      select * into v_tier from public.ticket_tiers
        where id = (v_item->>'tier_id')::uuid
          and org_id = p_org
          for update;
      if v_tier.id is null then
        raise exception 'Ticket tier not available';
      end if;
      if v_tier.quantity - v_tier.sold < v_qty then
        raise exception 'Sold out: %', v_tier.name;
      end if;
      if v_qty > v_tier.max_per_order then
        raise exception 'Max % per order for %', v_tier.max_per_order, v_tier.name;
      end if;
      v_subtotal := v_subtotal + v_tier.price_cents * v_qty;
      update public.ticket_tiers set sold = sold + v_qty where id = v_tier.id;
    else
      raise exception 'Invalid item';
    end if;
  end loop;

  -- Registration for ticket lines
  for v_item in select * from jsonb_array_elements(p_items) loop
    if v_item ? 'tier_id' then
      select * into v_tier from public.ticket_tiers where id = (v_item->>'tier_id')::uuid;
      insert into public.registrations (event_id, tier_id, org_id, attendee_name, attendee_email, qty, amount_cents, status)
        values (v_tier.event_id, v_tier.id, p_org, p_customer_name, p_customer_email,
                coalesce((v_item->>'qty')::int, 1), v_tier.price_cents * coalesce((v_item->>'qty')::int, 1), 'pending')
        returning id into v_registration_id;
    end if;
  end loop;

  -- Platform fee: 2.9% + RM0.50 (PayPal-like), rounded to cents
  v_fee := round(v_subtotal * 29 / 1000.0) + 50;

  insert into public.orders (org_id, order_number, customer_name, customer_email,
    subtotal_cents, fee_cents, total_cents, currency, status)
  values (p_org, public.next_order_number(), p_customer_name, p_customer_email,
    v_subtotal, v_fee, v_subtotal + v_fee, 'MYR', 'pending')
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    if v_item ? 'product_id' then
      select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
      insert into public.order_items (order_id, org_id, product_id, kind, name_snapshot, qty, unit_price_cents)
        values (v_order.id, p_org, v_product.id, 'product', v_product.name, coalesce((v_item->>'qty')::int, 1), v_product.price_cents);
    elsif v_item ? 'tier_id' then
      select * into v_tier from public.ticket_tiers where id = (v_item->>'tier_id')::uuid;
      insert into public.order_items (order_id, org_id, tier_id, registration_id, kind, name_snapshot, qty, unit_price_cents)
        values (v_order.id, p_org, v_tier.id, v_registration_id, 'ticket', v_tier.name, coalesce((v_item->>'qty')::int, 1), v_tier.price_cents);
    end if;
  end loop;

  return v_order;
end $$;
