-- CampusHub 2.0 — initial schema
-- Money: integer cents, currency MYR. Org isolation via org_id + RLS.

create extension if not exists "pgcrypto";

-- ============ Core identity ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','staff')),
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- Auto-create profile + default org + owner membership on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_org_id uuid;
  org_name text;
  user_name text;
begin
  user_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  org_name := user_name || '''s Org';
  insert into public.profiles (id, full_name)
    values (new.id, user_name)
    on conflict (id) do nothing;
  insert into public.organizations (name, slug)
    values (org_name, lower(substr(regexp_replace(org_name, '[^a-zA-Z0-9]', '', 'g'), 1, 20)) || '-' || substr(gen_random_uuid()::text, 1, 6))
    returning id into new_org_id;
  insert into public.org_members (org_id, user_id, role) values (new_org_id, new.id, 'owner');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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
  created_by uuid references auth.users(id),
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
  user_id uuid references auth.users(id),
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
  actor_id uuid references auth.users(id),
  action text not null,
  entity text,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);

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

-- ============ RLS ============
create or replace function public.is_org_member(p_org uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.org_members
    where org_id = p_org and user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.my_org_ids()
returns setof uuid language sql security definer set search_path = public stable as $$
  select org_id from public.org_members where user_id = auth.uid() and status = 'active';
$$;

-- Caller's role in an org. SECURITY DEFINER so policies can check roles
-- without querying org_members through their own RLS (which would recurse).
create or replace function public.my_role_for(p_org uuid)
returns text language sql security definer set search_path = public stable as $$
  select role from public.org_members
  where org_id = p_org and user_id = auth.uid() and status = 'active'
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.events enable row level security;
alter table public.ticket_tiers enable row level security;
alter table public.registrations enable row level security;
alter table public.products enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.transactions enable row level security;
alter table public.webhook_events enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_insights enable row level security;
alter table public.reports enable row level security;
alter table public.activity_log enable row level security;

-- profiles: own row
create policy "profiles_own_select" on public.profiles for select using (id = auth.uid());
create policy "profiles_own_update" on public.profiles for update using (id = auth.uid());

-- organizations: member read, owner/admin update
create policy "orgs_member_select" on public.organizations for select using (public.is_org_member(id));
create policy "orgs_admin_update" on public.organizations for update using (
  public.my_role_for(id) in ('owner','admin')
);

-- org_members: member read, admin manage
create policy "org_members_select" on public.org_members for select using (user_id = auth.uid() or public.is_org_member(org_id));
create policy "org_members_admin_all" on public.org_members for all using (
  public.my_role_for(org_id) in ('owner','admin')
) with check (
  public.my_role_for(org_id) in ('owner','admin')
);

-- events: org CRUD; public read published
create policy "events_org_select" on public.events for select using (public.is_org_member(org_id));
create policy "events_public_select" on public.events for select to anon, authenticated using (status = 'published');
create policy "events_org_write" on public.events for insert with check (public.is_org_member(org_id));
create policy "events_org_update" on public.events for update using (public.is_org_member(org_id));
create policy "events_org_delete" on public.events for delete using (
  public.my_role_for(org_id) in ('owner','admin')
);

-- ticket_tiers: org CRUD; public read for published events
create policy "tiers_org_select" on public.ticket_tiers for select using (public.is_org_member(org_id));
create policy "tiers_public_select" on public.ticket_tiers for select to anon, authenticated using (
  exists (select 1 from public.events e where e.id = event_id and e.status = 'published')
);
create policy "tiers_org_write" on public.ticket_tiers for all using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

-- registrations: org read/update; public insert pending (guest checkout)
create policy "registrations_org_select" on public.registrations for select using (public.is_org_member(org_id));
create policy "registrations_org_update" on public.registrations for update using (public.is_org_member(org_id));
create policy "registrations_public_insert" on public.registrations for insert to anon, authenticated with check (status = 'pending');

-- products: org CRUD; public read active
create policy "products_org_select" on public.products for select using (public.is_org_member(org_id));
create policy "products_public_select" on public.products for select to anon, authenticated using (status = 'active');
create policy "products_org_write" on public.products for all using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

-- inventory_movements: org read + insert
create policy "inv_org_select" on public.inventory_movements for select using (public.is_org_member(org_id));
create policy "inv_org_insert" on public.inventory_movements for insert with check (public.is_org_member(org_id));

-- carts: anon via session token; members see own org's
create policy "carts_member_select" on public.carts for select using (public.is_org_member(org_id));
create policy "carts_anon_insert" on public.carts for insert to anon, authenticated with check (true);
create policy "carts_anon_select" on public.carts for select to anon, authenticated using (true);
create policy "carts_anon_update" on public.carts for update to anon, authenticated using (true) with check (true);
create policy "carts_anon_delete" on public.carts for delete to anon, authenticated using (true);

create policy "cart_items_anon_all" on public.cart_items for all to anon, authenticated using (true) with check (true);
create policy "cart_items_member_select" on public.cart_items for select using (
  exists (select 1 from public.carts c where c.id = cart_id and public.is_org_member(c.org_id))
);

-- orders / order_items: org read, insert via RPC (security definer bypasses RLS anyway)
create policy "orders_org_select" on public.orders for select using (public.is_org_member(org_id));
create policy "orders_org_update" on public.orders for update using (public.is_org_member(org_id));
create policy "order_items_org_select" on public.order_items for select using (public.is_org_member(org_id));
create policy "order_items_org_update" on public.order_items for update using (public.is_org_member(org_id));

-- transactions / webhook_events: org read only (webhooks use service role)
create policy "transactions_org_select" on public.transactions for select using (public.is_org_member(org_id));
create policy "webhook_events_service_only" on public.webhook_events for select using (false);

-- notifications: org read; user update own read_at
create policy "notifications_org_select" on public.notifications for select using (public.is_org_member(org_id));
create policy "notifications_org_update" on public.notifications for update using (public.is_org_member(org_id));
create policy "notifications_org_insert" on public.notifications for insert with check (public.is_org_member(org_id));

-- ai_insights / reports / activity_log: org read+insert
create policy "ai_insights_org_select" on public.ai_insights for select using (public.is_org_member(org_id));
create policy "ai_insights_org_insert" on public.ai_insights for insert with check (public.is_org_member(org_id));
create policy "reports_org_select" on public.reports for select using (public.is_org_member(org_id));
create policy "reports_org_insert" on public.reports for insert with check (public.is_org_member(org_id));
create policy "activity_log_org_select" on public.activity_log for select using (public.is_org_member(org_id));
create policy "activity_log_org_insert" on public.activity_log for insert with check (public.is_org_member(org_id));

-- ============ Storage ============
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('event-covers', 'event-covers', true),
  ('report-exports', 'report-exports', false)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product_images_org_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1]::uuid in (select public.my_org_ids()));
create policy "event_covers_public_read" on storage.objects for select using (bucket_id = 'event-covers');
create policy "event_covers_org_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'event-covers' and (storage.foldername(name))[1]::uuid in (select public.my_org_ids()));
create policy "report_exports_org_read" on storage.objects for select to authenticated
  using (bucket_id = 'report-exports' and (storage.foldername(name))[1]::uuid in (select public.my_org_ids()));
create policy "report_exports_org_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'report-exports' and (storage.foldername(name))[1]::uuid in (select public.my_org_ids()));
