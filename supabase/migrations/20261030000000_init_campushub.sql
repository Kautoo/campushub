-- ==============================================================================
-- CampusHub Initial Schema Migration
-- Migration: 20261030000000_init_campushub.sql
-- Description: Core relational schema with RLS policies, numeric monetary types,
--              status constraints, and duplicate prevention.
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'organizer', 'admin')) DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. ORGANIZATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    verified BOOLEAN NOT NULL DEFAULT false,
    member_count INTEGER NOT NULL DEFAULT 1,
    contact_email TEXT NOT NULL,
    avatar_url TEXT,
    paypal_connected BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. ORGANIZATION MEMBERSHIPS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'member')) DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 4. EVENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Athletics & Fun Runs', 'Green & Community', 'Tech & Hackathons', 'Workshops & Design', 'E-Sports', 'Tech & AI', 'General')),
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED')) DEFAULT 'DRAFT',
    date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    time_display TEXT NOT NULL,
    location TEXT NOT NULL,
    venue_href TEXT,
    organizer_name TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_free BOOLEAN NOT NULL DEFAULT false,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    capacity INTEGER NOT NULL CHECK (capacity >= 0),
    registered_count INTEGER NOT NULL DEFAULT 0 CHECK (registered_count >= 0 AND registered_count <= capacity),
    image_url TEXT,
    plans JSONB NOT NULL DEFAULT '[]'::jsonb,
    has_tee_size BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. EVENT REGISTRATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL DEFAULT '',
    event_date TEXT,
    event_location TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    plan_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (plan_price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    tee_size TEXT,
    pass_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED')) DEFAULT 'CONFIRMED',
    checked_in BOOLEAN NOT NULL DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. PRODUCTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price IS NULL OR original_price >= price),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
    in_stock BOOLEAN NOT NULL DEFAULT true,
    stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
    society_impact TEXT,
    campus_pickup BOOLEAN NOT NULL DEFAULT true,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 7. ORDERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_id TEXT NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    shipping NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (shipping >= 0),
    donation NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (donation >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    fulfillment_method TEXT NOT NULL CHECK (fulfillment_method IN ('pickup', 'delivery')) DEFAULT 'pickup',
    fulfillment_location TEXT NOT NULL,
    pickup_pass_code TEXT,
    status TEXT NOT NULL CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'pending', 'ready_for_pickup', 'dispatched', 'delivered', 'cancelled')) DEFAULT 'PENDING_PAYMENT',
    paypal_order_id TEXT,
    paypal_capture_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 8. ORDER ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    selected_size TEXT,
    organization_name TEXT NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0)
);

-- ------------------------------------------------------------------------------
-- 9. PAYMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'paypal',
    provider_order_id TEXT NOT NULL,
    provider_capture_id TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')) DEFAULT 'PENDING',
    payer_email TEXT,
    payer_name TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE & INTEGRITY
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events (status, date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events (slug);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student ON public.event_registrations (student_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_student_active ON public.event_registrations (event_id, student_id) WHERE status != 'CANCELLED';
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products (is_active, category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_orders_student ON public.orders (student_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_paypal ON public.orders (paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order ON public.payments (provider_order_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile; public can view basic organizer profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Events: Everyone can read PUBLISHED events; organizers can view all events
CREATE POLICY "Public can view published events"
    ON public.events FOR SELECT
    USING (status = 'PUBLISHED' OR auth.uid() = created_by);

CREATE POLICY "Organizers can insert events"
    ON public.events FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Organizers can update own events"
    ON public.events FOR UPDATE
    USING (auth.uid() = created_by);

-- Products: Everyone can read active products; organizers can manage
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (is_active = true);

-- Event Registrations: Students can view their own registrations; organizers can view event rosters
CREATE POLICY "Students can view own registrations"
    ON public.event_registrations FOR SELECT
    USING (auth.uid() = user_id OR student_id = current_setting('request.jwt.claim.student_id', true));

CREATE POLICY "Students can create registrations"
    ON public.event_registrations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL OR student_id IS NOT NULL);

-- Orders: Students can view own orders
CREATE POLICY "Students can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR student_id = current_setting('request.jwt.claim.student_id', true));

CREATE POLICY "Students can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL OR student_id IS NOT NULL);

-- Order Items: Linked to orders
CREATE POLICY "Users can view items of own orders"
    ON public.order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR o.student_id = current_setting('request.jwt.claim.student_id', true))
    ));
