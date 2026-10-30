-- ==============================================================================
-- CampusHub Phase 2 Schema Migration: PayPal Sandbox Payment Integration
-- Migration: 20261030000001_phase2_paypal_payments.sql
-- Description: Enhances schema for PayPal order/capture tracking, idempotency,
--              payment status constraints, and event registration linkage.
-- ==============================================================================

-- 1. Enhance event_registrations table for order linkage and payment tracking
ALTER TABLE IF EXISTS public.event_registrations
    ADD COLUMN IF NOT EXISTS order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
    ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

-- 2. Enhance payments table for user tracking and captured timestamp
ALTER TABLE IF EXISTS public.payments
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS student_id TEXT,
    ADD COLUMN IF NOT EXISTS captured_at TIMESTAMPTZ;

-- 3. Indexes for payment integrity, fast lookups, and capture uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_provider_capture
    ON public.payments (provider_capture_id)
    WHERE provider_capture_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_provider_order
    ON public.payments (provider_order_id);

CREATE INDEX IF NOT EXISTS idx_registrations_order
    ON public.event_registrations (order_id);

CREATE INDEX IF NOT EXISTS idx_registrations_paypal_order
    ON public.event_registrations (paypal_order_id);

-- 4. Enhance orders table with order_type, registration linkage, and payment_status
ALTER TABLE IF EXISTS public.orders
    ADD COLUMN IF NOT EXISTS order_type TEXT CHECK (order_type IN ('merchandise', 'event_registration')) DEFAULT 'merchandise',
    ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')) DEFAULT 'PENDING';
