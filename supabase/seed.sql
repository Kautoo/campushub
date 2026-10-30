-- ==============================================================================
-- CampusHub Safe Development Seed Data
-- File: supabase/seed.sql
-- Description: Idempotent seed data for verified development environment.
--              Does NOT overwrite existing production or modified records.
-- ==============================================================================

-- 1. Profiles
INSERT INTO public.profiles (id, student_id, full_name, email, role)
VALUES
    ('c0000000-0000-0000-0000-000000000001', '#STU-882194', 'Alex Rivera', 'arivera27@stanford.edu', 'student'),
    ('c0000000-0000-0000-0000-000000000002', '#ORG-55102', 'Sarah Chen', 'schen@stanford.edu', 'organizer'),
    ('c0000000-0000-0000-0000-000000000003', '#ORG-77201', 'Marcus Vance', 'mvance@stanford.edu', 'organizer'),
    ('c0000000-0000-0000-0000-000000000004', '#ORG-99304', 'Elena Rostova', 'erostova@stanford.edu', 'organizer'),
    ('c0000000-0000-0000-0000-000000000005', '#ADM-00001', 'Campus Administrator', 'admin@campushub.edu', 'admin')
ON CONFLICT (student_id) DO NOTHING;

-- 2. Organizations
INSERT INTO public.organizations (id, name, slug, description, category, verified, contact_email)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Engineering Society', 'engineering-society', 'Faculty Apparel & Hardware Lab', 'Faculty Apparel & Hardware', true, 'merch@engineering-society.org'),
    ('a0000000-0000-0000-0000-000000000002', 'Sustainable Living Club', 'sustainable-living-club', 'Ecological & Reusables Guild', 'Ecological & Reusables', true, 'eco@campushub.org'),
    ('a0000000-0000-0000-0000-000000000003', 'Arts & Media Collective', 'arts-media-collective', 'Design & Print Guild', 'Design & Print Guild', true, 'studio@arts-collective.org'),
    ('a0000000-0000-0000-0000-000000000004', 'BioSciences Guild', 'biosciences-guild', 'Laboratory & Life Sciences', 'Laboratory & Life Sciences', true, 'treasury@biosciences-guild.org'),
    ('a0000000-0000-0000-0000-000000000005', 'Society of Automotive Engineers', 'society-of-automotive-engineers', 'Autonomous Systems & E-Sports', 'Engineering & Autonomous Systems', true, 'sae-formula@campushub.org')
ON CONFLICT (slug) DO NOTHING;

-- 3. Organization Memberships
INSERT INTO public.organization_memberships (organization_id, user_id, role)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'owner'),
    ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', 'owner'),
    ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'owner')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 4. Events
INSERT INTO public.events (
    id, slug, title, subtitle, description, category, status, date, time_display,
    location, venue_href, organizer_name, organization_id, created_by, is_free, currency, capacity, registered_count, plans
) VALUES
    (
        'neon_fun_run_5k',
        'neon-5k-campus-fun-run',
        'Neon 5K Campus Fun Run & Night Lights',
        'Illuminated evening campus loop with live DJ pacers & glow kits',
        'Join 1,200+ students running the dusk loop through Main Quad, Memorial Arch, and Lake Lagunita.',
        'Athletics & Fun Runs',
        'PUBLISHED',
        '2025-11-08 18:30:00+00',
        '6:30 PM PST',
        'Main Quad Archway → Lake Lagunita Loop',
        '/map',
        'Stanford Running Club & ASSU Wellness Guild',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000002',
        false,
        'USD',
        1200,
        1016,
        '[{"id": "plan_a", "code": "PLAN A", "name": "Runner Tech Tee Only", "price": 12, "description": "Official moisture-wicking neon tech shirt.", "perks": ["Tech Tee", "RFID Timing"]}, {"id": "plan_b", "code": "PLAN B", "name": "Tech Tee + Finisher Medal", "price": 22, "description": "Full race kit.", "perks": ["Tech Tee", "Die-Cast Medal", "Acai Bowl"]}]'::jsonb
    ),
    (
        'sunday_plogging_cleanup',
        'sunday-campus-plogging',
        'Sunday Campus Plogging & Eco Trail Cleanup',
        'Community morning jog & litter cleanup',
        'A zero-waste Swedish fitness tradition combining a relaxed 4K morning jog with trail restoration.',
        'Green & Community',
        'PUBLISHED',
        '2025-11-09 08:30:00+00',
        '8:30 AM PST',
        'Lake Lagunita Trailhead • Boathouse Dock',
        '/map',
        'Students for Sustainable Stanford (SSS)',
        'a0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000004',
        true,
        'USD',
        350,
        284,
        '[{"id": "plan_free_plog", "code": "COMMUNITY PASS", "name": "Free Community Plogger Registration", "price": 0, "description": "All cleanup gear and bagels included.", "perks": ["Gloves", "Canvas Tote", "Fresh Bagels"]}]'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Products
INSERT INTO public.products (
    id, name, slug, price, original_price, currency, category, description,
    images, sizes, in_stock, stock_count, society_impact, campus_pickup, organization_id, created_by, is_active
) VALUES
    (
        'prod_archival_hoodie',
        'Heavyweight Archival Hoodie',
        'heavyweight-archival-hoodie',
        68.00,
        85.00,
        'USD',
        'Apparel',
        '500 GSM French Terry collegiate hoodie custom knit for the Stanford Engineering student body.',
        ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80'],
        ARRAY['S', 'M', 'L', 'XL'],
        true,
        32,
        '100% of proceeds fund student community initiatives.',
        true,
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000002',
        true
    ),
    (
        'prod_hydro_flask',
        'Insulated Laser-Etched Flask',
        'insulated-laser-etched-flask',
        34.00,
        42.00,
        'USD',
        'Essentials',
        'Double-wall vacuum insulated 32oz stainless steel bottle featuring laser-etched topographic quad contours.',
        ARRAY['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'],
        ARRAY['One Size'],
        true,
        18,
        '100% of proceeds support campus hydration station upgrades.',
        true,
        'a0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000004',
        true
    )
ON CONFLICT (id) DO NOTHING;
