-- CampusHub 2.0 — demo seed: org "Tech Society", events, tiers, products, orders, transactions, notifications
-- Demo login: owner@campushub.test (see the demo users section at the bottom).

-- Demo org with a FIXED id so seed data stays consistent
insert into public.organizations (id, name, slug, description, currency, settings)
values (
  '00000000-0000-4000-8000-000000000001',
  'Tech Society',
  'tech-society',
  'Campus technology & innovation society — events, merch, and community.',
  'MYR',
  '{"gateways": {"paypal": true}, "platform_fee_pct": 2.9}'::jsonb
) on conflict (id) do nothing;

-- ============ Events ============
insert into public.events (id, org_id, title, slug, description, venue, category, start_at, end_at, capacity, status) values
('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','Innovation Week 2026','innovation-week-2026','A five-day showcase of student startups, hackathons, and keynote talks from industry leaders.','Main Hall, Block C','conference', now() + interval '12 days', now() + interval '17 days', 500, 'published'),
('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','AI & ML Bootcamp','ai-ml-bootcamp','Hands-on machine learning bootcamp: from regression to transformers, with lab sessions.','Lab 2, CS Building','workshop', now() + interval '25 days', now() + interval '27 days', 80, 'published'),
('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','Hack the Campus 48h','hack-the-campus-48h','48-hour hackathon. Teams of four, RM10,000 in prizes, free merch for all participants.','Innovation Lab','hackathon', now() + interval '40 days', now() + interval '42 days', 200, 'published'),
('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','Startup Career Fair','startup-career-fair','Meet 40+ startups hiring interns and graduates. Bring your resume.','Exhibition Hall B','career', now() + interval '60 days', now() + interval '60 days' + interval '8 hours', 800, 'published'),
('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000001','Cybersecurity Night','cybersecurity-night','Evening talks on ethical hacking and digital defense, followed by CTF prelims.','Auditorium 1','talk', now() + interval '8 days', now() + interval '8 days' + interval '4 hours', 150, 'draft'),
('10000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000001','DevFest Freshers 2025','devfest-freshers-2025','Last semester''s welcome festival — archived for reporting.','Main Hall, Block C','conference', now() - interval '90 days', now() - interval '89 days', 400, 'completed');

-- ============ Ticket tiers (3 per event) ============
insert into public.ticket_tiers (id, event_id, org_id, name, price_cents, quantity, sold, perks, max_per_order) values
('11000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','Student Pass',      4900, 300, 142, array['All talks','Lunch day 2'], 4),
('11000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','Standard Pass',     9900, 150, 61,  array['All talks','Lunch','Workshop access'], 4),
('11000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','VIP Pass',         19900, 50,  17,  array['Front row','Speaker dinner','Swag box'], 2),
('11000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','Bootcamp Seat',    29900, 60,  23,  array['3-day access','Lab materials'], 3),
('11000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','Bootcamp + Mentor',44900, 20,  8,   array['Seat','1:1 mentor hours'], 2),
('11000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','Observer',          0,  30,  4,   array['Watch-only'], 1),
('11000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','Team Entry',       12000, 50,  12,  array['4 hackers','Meals','Merch'], 2),
('11000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','Solo Hacker',       3000, 60,  21,  array['Meals','Merch'], 1),
('11000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','Mentor Pass',       0,  20,  5,   array['Mentor lounge'], 1),
('11000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','Attendee',          0,  700, 0,   array['Free entry'], 1),
('11000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','Fast Track',       1500, 100, 0,   array['Skip the queue','Coffee'], 1),
('11000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000001','Early Bird',       2500, 100, 0,   array['Talks','CTF seat'], 2);

-- ============ Products (12, MYR price points) ============
insert into public.products (id, org_id, name, slug, description, category, price_cents, stock, low_stock_threshold, sku, status) values
('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','CampusHub Tee — Navy','tee-navy','100% cotton, embroidered crest.','Apparel', 4500, 120, 20, 'TS-TEE-NVY', 'active'),
('20000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','CampusHub Tee — Teal','tee-teal','100% cotton, screen-printed logo.','Apparel', 4500, 98, 20, 'TS-TEE-TEA', 'active'),
('20000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','Hoodie — Midnight','hoodie-midnight','Fleece-lined hoodie with tonal print.','Apparel', 11900, 45, 10, 'TS-HOD-MDN', 'active'),
('20000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','Sticker Pack (12)','sticker-pack','Laptop-ready vinyl stickers, matte finish.','Merch', 800, 500, 50, 'TS-STK-012', 'active'),
('20000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000001','Enamel Pin — Rocket','pin-rocket','Hard enamel, butterfly clutch.','Merch', 1200, 210, 30, 'TS-PIN-RKT', 'active'),
('20000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000001','Notebook — Dot Grid','notebook-dotgrid','A5, 160 pages, lay-flat binding.','Stationery', 2200, 180, 25, 'TS-NTB-DOT', 'active'),
('20000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000001','Tote Bag — Canvas','tote-canvas','Heavy canvas, inner pocket.','Apparel', 3500, 76, 15, 'TS-TOT-CNV', 'active'),
('20000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000001','Water Bottle 750ml','bottle-750','Insulated steel, teal powder coat.','Merch', 5900, 62, 10, 'TS-BTL-750', 'active'),
('20000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000001','Mousepad XL','mousepad-xl','900×400mm, stitched edge.','Tech', 3900, 34, 10, 'TS-MPD-XL', 'active'),
('20000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','Mech Keycap Set','keycap-set','PBT dye-sub, teal novelties.','Tech', 15900, 12, 8, 'TS-KC-PBT', 'active'),
('20000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','Cap — Crest','cap-crest','6-panel, adjustable strap.','Apparel', 3200, 88, 15, 'TS-CAP-CRS', 'active'),
('20000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000001','Lanyard + Card Holder','lanyard-holder','Woven lanyard, RFID-safe holder.','Merch', 1500, 240, 40, 'TS-LNY-RFID', 'active');

-- ============ Orders: 40 across statuses over the last 30 days ============
do $$
declare
  v_prod uuid;
  v_qty int;
  v_sub int;
  v_status text;
  v_order_id uuid;
  v_i int;
  v_paid int := 0;
  statuses text[] := array['paid','paid','paid','paid','paid','paid','paid','paid','paid','paid',
                           'paid','paid','paid','paid','paid','paid','paid','paid','paid','paid',
                           'paid','paid','paid','paid','paid','paid','paid','paid',
                           'pending','pending','pending','pending','pending','pending',
                           'fulfilled','fulfilled','fulfilled','cancelled','cancelled','refunded'];
  buyers text[] := array['aminah.h@campus.edu.my','wei.jian@campus.edu.my','priya.n@campus.edu.my',
                         'danish.k@campus.edu.my','sofia.l@campus.edu.my','arif.z@campus.edu.my',
                         'mei.ling@campus.edu.my','hafiz.r@campus.edu.my','nadia.s@campus.edu.my',
                         'josh.tan@campus.edu.my'];
  names text[] := array['Aminah Hassan','Wei Jian Lim','Priya Nair','Danish Karim','Sofia Lopez',
                        'Arif Zulkifli','Mei Ling Chan','Hafiz Rahman','Nadia Salleh','Josh Tan'];
begin
  for v_i in 1..40 loop
    v_prod := (('20000000-0000-4000-8000-0000000000' || lpad(((v_i - 1) % 12 + 1)::text, 2, '0'))::uuid);
    v_qty := (v_i % 3) + 1;
    select price_cents into v_sub from public.products where id = v_prod;
    v_sub := v_sub * v_qty;
    v_status := statuses[v_i];

    if v_status = 'cancelled' then
      -- cancelled orders keep price history but no transaction
      insert into public.orders (org_id, order_number, customer_name, customer_email, subtotal_cents, fee_cents, total_cents, currency, status, created_at)
      values ('00000000-0000-4000-8000-000000000001', 'CH-' || (1000 + v_i)::text, names[(v_i % 10) + 1], buyers[(v_i % 10) + 1],
              v_sub, round(v_sub * 29 / 1000.0) + 50, v_sub + round(v_sub * 29 / 1000.0) + 50, 'MYR', 'cancelled',
              now() - ((40 - v_i) || ' days')::interval)
      returning id into v_order_id;
    else
      insert into public.orders (org_id, order_number, customer_name, customer_email, subtotal_cents, fee_cents, total_cents, currency, status,
        paypal_order_id, paypal_capture_id, created_at)
      values ('00000000-0000-4000-8000-000000000001', 'CH-' || (1000 + v_i)::text, names[(v_i % 10) + 1], buyers[(v_i % 10) + 1],
              v_sub, round(v_sub * 29 / 1000.0) + 50, v_sub + round(v_sub * 29 / 1000.0) + 50, 'MYR', v_status,
              'DEMO-PP-ORDER-' || v_i::text, case when v_status in ('paid','fulfilled','refunded') then 'DEMO-CAP-' || v_i::text else null end,
              now() - ((40 - v_i) || ' days')::interval)
      returning id into v_order_id;

      insert into public.order_items (order_id, org_id, product_id, kind, name_snapshot, qty, unit_price_cents)
      values (v_order_id, '00000000-0000-4000-8000-000000000001', v_prod, 'product',
              (select name from public.products where id = v_prod), v_qty, v_sub / v_qty);

      if v_status in ('paid','fulfilled','refunded') then
        v_paid := v_paid + 1;
        insert into public.transactions (org_id, order_id, provider, provider_ref, type, amount_cents, currency, status, verified, raw, created_at)
        values ('00000000-0000-4000-8000-000000000001', v_order_id, 'paypal', 'DEMO-CAP-' || v_i::text,
                case when v_status = 'refunded' then 'refund' else 'payment' end,
                case when v_status = 'refunded' then v_sub + round(v_sub * 29 / 1000.0) + 50 else v_sub + round(v_sub * 29 / 1000.0) + 50 end,
                'MYR', 'completed', true, '{"demo": true}'::jsonb, now() - ((40 - v_i) || ' days')::interval);
      end if;

      if v_status = 'pending' then
        insert into public.transactions (org_id, order_id, provider, provider_ref, type, amount_cents, currency, status, verified, raw, created_at)
        values ('00000000-0000-4000-8000-000000000001', v_order_id, 'paypal', 'DEMO-PP-ORDER-' || v_i::text, 'payment',
                v_sub + round(v_sub * 29 / 1000.0) + 50, 'MYR', 'pending', false, '{"demo": true}'::jsonb,
                now() - ((40 - v_i) || ' days')::interval);
      end if;
    end if;
  end loop;
end $$;

-- Demo event registrations from ticket sales already reflected in sold counts
insert into public.registrations (event_id, tier_id, org_id, attendee_name, attendee_email, qty, amount_cents, status, created_at)
select t.event_id, t.id, t.org_id, 'Seed Attendee ' || n, 'attendee' || n || '@campus.edu.my', 1, t.price_cents,
       case when n % 4 = 0 then 'checked_in' else 'confirmed' end, now() - (n || ' days')::interval
from (select id, event_id, org_id, price_cents, row_number() over (partition by event_id order by id) rn from public.ticket_tiers where sold > 0) t,
     generate_series(1, 4) n
where rn <= 3;

-- ============ Notifications ============
insert into public.notifications (org_id, type, title, body, link, read_at) values
('00000000-0000-4000-8000-000000000001','order','New paid order','CH-1040 was paid via PayPal.','/dashboard/orders', null),
('00000000-0000-4000-8000-000000000001','stock','Low stock alert','Mech Keycap Set has 12 units left.','/dashboard/products', null),
('00000000-0000-4000-8000-000000000001','event','Event published','Innovation Week 2026 is live on the storefront.','/dashboard/events', null),
('00000000-0000-4000-8000-000000000001','registration','14 new registrations','AI & ML Bootcamp seats are filling up.','/dashboard/registrations', now() - interval '2 hours'),
('00000000-0000-4000-8000-000000000001','system','Payout processed','PayPal payout of RM 3,214.80 settled.','/dashboard/transactions', now() - interval '1 day'),
('00000000-0000-4000-8000-000000000001','ai','Weekly insight ready','Your commerce summary for last week is available.','/dashboard/ai-insights', now() - interval '1 day'),
('00000000-0000-4000-8000-000000000001','order','New paid order','CH-1036 was paid via PayPal.','/dashboard/orders', now() - interval '2 days'),
('00000000-0000-4000-8000-000000000001','system','Refund issued','CH-1040 refunded in full.','/dashboard/transactions', now() - interval '3 days');


-- ============ Demo users (Auth.js credentials; scrypt password_hash) ============
-- Password for every demo account: "campushub-demo" (documented in README).
-- Hashes are scrypt: format "scrypt$N$r$p$salthex$keyhex" — generated by lib/auth/password.ts.

insert into public.users (id, name, email, email_verified, image, password_hash)
values
  ('40000000-0000-4000-8000-000000000001', 'Demo Owner',  'owner@campushub.test', now(), null,
   'scrypt$16384$8$1$6fd14122052796ac09f314e7f9c85b21$15a96bfab4e1d3079f3044ddc4fc4515affbd71203fc5ef4ed527c4ac7b56cd734a19f0f0dd84609d661db81bba78e6fd88a2cdf4930c8c9f7b2cffbc187dc69'),
  ('40000000-0000-4000-8000-000000000002', 'Demo Admin',  'admin@campushub.test', now(), null,
   'scrypt$16384$8$1$dc3c5721c843f5304d94acda6618b66a$236e2734694c36840092c8ffb1766fd59090d58523ce66828553d99c4253e03cc791be52847654a1f563cb286d844b0e89bc1fb81590c2cc0656757196d326be'),
  ('40000000-0000-4000-8000-000000000003', 'Demo Staff',  'staff@campushub.test', now(), null,
   'scrypt$16384$8$1$81dca9cc0109c5ac5de2d01ad26bbbc5$a570330b8792476c2ad3c8f6787ac9bc0a9203c02c594c1e9f576c23b69296e0c892dcaadeadcee95cacf1b1fa855e102ece0b7d57f58f27ba5b5f8153703819')
on conflict (email) do nothing;

-- Demo memberships (owner/admin/staff of the fixed demo org)
insert into public.org_members (org_id, user_id, role, status)
values
  ('00000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'owner', 'active'),
  ('00000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', 'admin', 'active'),
  ('00000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000003', 'staff', 'active')
on conflict (org_id, user_id) do nothing;

