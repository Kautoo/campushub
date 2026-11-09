/**
 * Repo layer: explicit org-scoped queries replacing Supabase RLS.
 * Every list/get takes `orgIds` (the caller's org membership, resolved once
 * per request from the session) and scopes with `org_id = ANY($n)`.
 * Row shapes mirror the old supabase-js Database types (snake_case fields).
 */
import { query, withTransaction, type QueryRow } from "./index";

// ---------- Row types (kept from the old Database type) ----------

export type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  currency: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type EventRow = {
  id: string;
  org_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  venue: string | null;
  category: string | null;
  start_at: string | null;
  end_at: string | null;
  capacity: number;
  status: "draft" | "published" | "cancelled" | "completed";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TicketTierRow = {
  id: string;
  event_id: string;
  org_id: string;
  name: string;
  price_cents: number;
  quantity: number;
  sold: number;
  perks: string[] | null;
  sale_start: string | null;
  sale_end: string | null;
  max_per_order: number;
  created_at: string;
};

export type RegistrationRow = {
  id: string;
  event_id: string;
  tier_id: string | null;
  org_id: string;
  attendee_name: string;
  attendee_email: string;
  qty: number;
  amount_cents: number;
  status: "pending" | "confirmed" | "checked_in" | "cancelled";
  qr_token: string;
  checkin_at: string | null;
  paypal_order_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[] | null;
  category: string | null;
  price_cents: number;
  stock: number;
  low_stock_threshold: number;
  sku: string | null;
  status: "active" | "draft" | "archived";
  channel3_ref: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  org_id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string;
  subtotal_cents: number;
  fee_cents: number;
  total_cents: number;
  currency: string;
  status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  org_id: string;
  product_id: string | null;
  tier_id: string | null;
  registration_id: string | null;
  kind: "product" | "ticket";
  name_snapshot: string;
  qty: number;
  unit_price_cents: number;
};

export type TransactionRow = {
  id: string;
  org_id: string;
  order_id: string | null;
  registration_id: string | null;
  provider: string;
  provider_ref: string | null;
  type: "payment" | "refund";
  amount_cents: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "reversed";
  verified: boolean;
  raw: Record<string, unknown> | null;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  org_id: string;
  user_id: string | null;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export type OrgMemberRow = {
  org_id: string;
  user_id: string;
  role: "owner" | "admin" | "staff";
  status: "active" | "invited" | "suspended";
  created_at: string;
};

export type UserRow = {
  id: string;
  name: string | null;
  email: string;
  email_verified: Date | null;
  image: string | null;
  password_hash: string | null;
  created_at: string;
};

export type AiInsightRow = {
  id: string;
  org_id: string;
  kind: "summary" | "anomaly" | "recommendation" | "chat";
  prompt: string | null;
  response: string | null;
  model: string | null;
  data_window: Record<string, unknown> | null;
  created_at: string;
};

export type InventoryMovementRow = {
  id: string;
  product_id: string;
  org_id: string;
  delta: number;
  reason: string;
  ref_id: string | null;
  created_at: string;
};

export type ReportRow = {
  id: string;
  org_id: string;
  type: string;
  params: Record<string, unknown> | null;
  file_url: string | null;
  status: "pending" | "ready" | "failed";
  created_at: string;
};

export type WebhookEventRow = {
  id: string;
  provider: string;
  event_type: string;
  provider_event_id: string;
  payload: Record<string, unknown> | null;
  status: "received" | "processed" | "failed";
  processed_at: string | null;
  created_at: string;
};

export type FileRow = {
  id: string;
  org_id: string;
  bucket: string;
  name: string;
  mime: string;
  bytes: Buffer;
  size: number;
  created_by: string | null;
  created_at: string;
};

// ---------- helpers ----------

// ---------- orgs ----------

export const orgs = {
  /** First org for a user — resolves membership by user id (no RLS). */
  async firstForUser(userId: string): Promise<OrganizationRow | null> {
    const rows = await query<OrganizationRow>(
      `select o.* from public.organizations o
       join public.org_members m on m.org_id = o.id
       where m.user_id = $1::uuid and m.status = 'active'
       order by o.created_at asc
       limit 1`,
      [userId],
    );
    return rows[0] ?? null;
  },

  /** All org ids the user is an active member of. */
  async listIdsByUser(userId: string): Promise<string[]> {
    const rows = await query<{ org_id: string }>(
      `select org_id from public.org_members
       where user_id = $1::uuid and status = 'active'`,
      [userId],
    );
    return rows.map((r) => r.org_id);
  },

  /** Orgs scoped to the caller's memberships (replaces RLS member read). */
  async list(orgIds: string[]): Promise<OrganizationRow[]> {
    const rows = await query<OrganizationRow>(
      `select * from public.organizations
       where id = ANY($1::uuid[])
       order by created_at asc
       limit 10`,
      [orgIds],
    );
    return rows;
  },

  async getById(orgId: string): Promise<OrganizationRow | null> {
    const rows = await query<OrganizationRow>(
      `select * from public.organizations where id = $1::uuid limit 1`,
      [orgId],
    );
    return rows[0] ?? null;
  },

  async update(
    orgId: string,
    orgIds: string[],
    fields: { name: string; description: string | null; currency: string; settings: Record<string, unknown> },
  ): Promise<OrganizationRow | null> {
    const rows = await query<OrganizationRow>(
      `update public.organizations
       set name = $1, description = $2, currency = $3, settings = $4::jsonb, updated_at = now()
       where id = $5::uuid and id = ANY($6::uuid[])
       returning *`,
      [fields.name, fields.description, fields.currency, JSON.stringify(fields.settings), orgId, orgIds],
    );
    return rows[0] ?? null;
  },
};

// ---------- org_members ----------

export const orgMembers = {
  async listByOrgs(orgIds: string[]): Promise<OrgMemberRow[]> {
    return query<OrgMemberRow>(
      `select org_id, user_id, role, status, created_at from public.org_members
       where org_id = ANY($1::uuid[])
       order by created_at asc`,
      [orgIds],
    );
  },

  async listByUser(userId: string): Promise<OrgMemberRow[]> {
    return query<OrgMemberRow>(
      `select org_id, user_id, role, status, created_at from public.org_members
       where user_id = $1::uuid
       limit 1`,
      [userId],
    );
  },

  async updateRole(
    orgId: string,
    orgIds: string[],
    userId: string,
    role: string,
  ): Promise<OrgMemberRow | null> {
    const rows = await query<OrgMemberRow>(
      `update public.org_members set role = $1
       where org_id = $2::uuid and org_id = ANY($3::uuid[]) and user_id = $4::uuid
       returning org_id, user_id, role, status, created_at`,
      [role, orgId, orgIds, userId],
    );
    return rows[0] ?? null;
  },

  async delete(
    orgId: string,
    orgIds: string[],
    userId: string,
  ): Promise<boolean> {
    const res = await query(
      `delete from public.org_members
       where org_id = $1::uuid and org_id = ANY($2::uuid[]) and user_id = $3::uuid`,
      [orgId, orgIds, userId],
    );
    return (res as unknown as { length: number }).length > 0;
  },

};

// ---------- users (Auth.js) ----------

export const users = {
  async getById(id: string): Promise<UserRow | null> {
    const rows = await query<UserRow>(
      `select id, name, email, email_verified, image, password_hash, created_at
       from public.users where id = $1::uuid limit 1`,
      [id],
    );
    return rows[0] ?? null;
  },

  async getByEmail(email: string): Promise<UserRow | null> {
    const rows = await query<UserRow>(
      `select id, name, email, email_verified, image, password_hash, created_at
       from public.users where lower(email) = lower($1) limit 1`,
      [email],
    );
    return rows[0] ?? null;
  },

  async insert(fields: {
    id?: string;
    name: string | null;
    email: string;
    password_hash: string;
    email_verified?: Date | null;
  }): Promise<UserRow> {
    const rows = await query<UserRow>(
      `insert into public.users (name, email, password_hash, email_verified)
       values ($1, $2, $3, $4)
       returning id, name, email, email_verified, image, password_hash, created_at`,
      [fields.name, fields.email, fields.password_hash, fields.email_verified ?? null],
    );
    return rows[0];
  },

  /** Users joined to the given org's memberships (members page). */
  async listByIds(ids: string[]): Promise<Array<Pick<UserRow, "id" | "name" | "image">>> {
    if (ids.length === 0) return [];
    return query<Pick<UserRow, "id" | "name" | "image">>(
      `select id, name, image from public.users where id = ANY($1::uuid[])`,
      [ids],
    );
  },
};

// ---------- events ----------

export const events = {
  /** Org events, newest start first (metrics + lists). */
  async listByOrgs(orgIds: string[]): Promise<EventRow[]> {
    return query<EventRow>(
      `select * from public.events where org_id = ANY($1::uuid[])`,
      [orgIds],
    );
  },

  /** Org events with nested tiers (replaces the `*, ticket_tiers(*)` embed). */
  async listWithTiers(orgIds: string[]): Promise<Array<EventRow & { ticket_tiers: TicketTierRow[] }>> {
    const [eventRows, tierRows] = await Promise.all([
      query<EventRow>(
        `select * from public.events
         where org_id = ANY($1::uuid[])
         order by start_at desc nulls last`,
        [orgIds],
      ),
      query<TicketTierRow>(
        `select tt.* from public.ticket_tiers tt
         where tt.org_id = ANY($1::uuid[])`,
        [orgIds],
      ),
    ]);
    return eventRows.map((e) => ({
      ...e,
      ticket_tiers: tierRows.filter((t) => t.event_id === e.id),
    }));
  },

  async insert(fields: {
    org_id: string;
    created_by: string | null;
    title: string;
    slug: string;
    description: string | null;
    cover_url?: string | null;
    venue: string | null;
    category: string | null;
    start_at: string | null;
    end_at: string | null;
    capacity: number;
    status: string;
  }): Promise<EventRow | null> {
    const rows = await query<EventRow>(
      `insert into public.events
        (org_id, created_by, title, slug, description, cover_url, venue, category, start_at, end_at, capacity, status)
       values ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9::timestamptz, $10::timestamptz, $11, $12)
       returning *`,
      [fields.org_id, fields.created_by, fields.title, fields.slug, fields.description,
       fields.cover_url ?? null, fields.venue, fields.category, fields.start_at, fields.end_at, fields.capacity, fields.status],
    );
    return rows[0] ?? null;
  },

  async update(id: string, orgIds: string[], fields: {
    title: string;
    slug: string;
    description: string | null;
    cover_url?: string | null;
    venue: string | null;
    category: string | null;
    start_at: string | null;
    end_at: string | null;
    capacity: number;
    status: string;
  }): Promise<EventRow | null> {
    const rows = await query<EventRow>(
      `update public.events set
         title = $1, slug = $2, description = $3, cover_url = $4, venue = $5, category = $6,
         start_at = $7::timestamptz, end_at = $8::timestamptz, capacity = $9, status = $10,
         updated_at = now()
       where id = $11::uuid and org_id = ANY($12::uuid[])
       returning *`,
      [fields.title, fields.slug, fields.description, fields.cover_url ?? null, fields.venue, fields.category,
       fields.start_at, fields.end_at, fields.capacity, fields.status, id, orgIds],
    );
    return rows[0] ?? null;
  },
  async updateStatus(id: string, orgIds: string[], status: string): Promise<EventRow | null> {
    const rows = await query<EventRow>(
      `update public.events set status = $1, updated_at = now()
       where id = $2::uuid and org_id = ANY($3::uuid[])
       returning *`,
      [status, id, orgIds],
    );
    return rows[0] ?? null;
  },

};

// ---------- ticket_tiers ----------

export const ticketTiers = {
  async listByOrgs(orgIds: string[]): Promise<TicketTierRow[]> {
    return query<TicketTierRow>(
      `select * from public.ticket_tiers where org_id = ANY($1::uuid[])`,
      [orgIds],
    );
  },
};

// ---------- registrations ----------

export const registrations = {
  /** Org registrations with event/tier titles (replaces FK embeds). */
  async listWithJoins(
    orgIds: string[],
    limit = 500,
  ): Promise<Array<RegistrationRow & { event_title: string | null; tier_name: string | null }>> {
    return query<RegistrationRow & { event_title: string | null; tier_name: string | null }>(
      `select r.*, e.title as event_title, tt.name as tier_name
       from public.registrations r
       left join public.events e on e.id = r.event_id
       left join public.ticket_tiers tt on tt.id = r.tier_id
       where r.org_id = ANY($1::uuid[])
       order by r.created_at desc
       limit $2`,
      [orgIds, limit],
    );
  },

  async updateStatus(
    id: string,
    orgIds: string[],
    fields: { status: string; checkin_at?: string | null; paypal_order_id?: string },
  ): Promise<RegistrationRow | null> {
    const rows = await query<RegistrationRow>(
      `update public.registrations set
         status = $1,
         checkin_at = coalesce($2::timestamptz, checkin_at),
         paypal_order_id = coalesce($3, paypal_order_id),
         updated_at = now()
       where id = $4::uuid and org_id = ANY($5::uuid[])
       returning *`,
      [fields.status, fields.checkin_at ?? null, fields.paypal_order_id ?? null, id, orgIds],
    );
    return rows[0] ?? null;
  },

  /** Confirm registrations by ids (PayPal capture, service path). */
  async confirmByIds(ids: string[], paypalOrderId: string): Promise<number> {
    const res = await query(
      `update public.registrations
       set status = 'confirmed', paypal_order_id = $1, updated_at = now()
       where id = ANY($2::uuid[])`,
      [paypalOrderId, ids],
    );
    return (res as unknown as { length: number }).length;
  },
};

// ---------- products ----------

export const products = {
  async list(orgIds: string[]): Promise<ProductRow[]> {
    return query<ProductRow>(
      `select * from public.products
       where org_id = ANY($1::uuid[])
       order by created_at desc`,
      [orgIds],
    );
  },

  /** Movements with product name (replaces the `products(name)` embed). */
  async listMovements(
    orgIds: string[],
    limit = 50,
  ): Promise<Array<InventoryMovementRow & { product_name: string | null }>> {
    return query<InventoryMovementRow & { product_name: string | null }>(
      `select m.id, m.product_id, m.org_id, m.delta, m.reason, m.ref_id, m.created_at, p.name as product_name
       from public.inventory_movements m
       left join public.products p on p.id = m.product_id
       where m.org_id = ANY($1::uuid[])
       order by m.created_at desc
       limit $2`,
      [orgIds, limit],
    );
  },

  async insert(
    fields: Record<string, unknown>,
    orgId: string,
  ): Promise<ProductRow | null> {
    const rows = await query<ProductRow>(
      `insert into public.products
        (org_id, name, slug, description, images, category, price_cents, stock, low_stock_threshold, sku, status, channel3_ref)
       values ($1::uuid, $2, $3, $4, $5::text[], $6, $7, $8, $9, $10, $11, $12)
       returning *`,
      [orgId, fields.name, fields.slug, fields.description, fields.images ?? [],
       fields.category, fields.price_cents, fields.stock, fields.low_stock_threshold,
       fields.sku, fields.status, fields.channel3_ref],
    );
    return rows[0] ?? null;
  },

  async update(
    id: string,
    orgIds: string[],
    fields: Record<string, unknown>,
  ): Promise<ProductRow | null> {
    const rows = await query<ProductRow>(
      `update public.products set
         name = $1, slug = $2, description = $3, images = $4::text[], category = $5,
         price_cents = $6, stock = $7, low_stock_threshold = $8, sku = $9, status = $10,
         channel3_ref = $11, updated_at = now()
       where id = $12::uuid and org_id = ANY($13::uuid[])
       returning *`,
      [fields.name, fields.slug, fields.description, fields.images ?? [], fields.category,
       fields.price_cents, fields.stock, fields.low_stock_threshold, fields.sku, fields.status,
       fields.channel3_ref, id, orgIds],
    );
    return rows[0] ?? null;
  },

  async updateStatus(
    id: string,
    orgIds: string[],
    status: string,
  ): Promise<ProductRow | null> {
    const rows = await query<ProductRow>(
      `update public.products set status = $1, updated_at = now()
       where id = $2::uuid and org_id = ANY($3::uuid[])
       returning *`,
      [status, id, orgIds],
    );
    return rows[0] ?? null;
  },

  async getById(id: string, orgIds: string[]): Promise<ProductRow | null> {
    const rows = await query<ProductRow>(
      `select * from public.products where id = $1::uuid and org_id = ANY($2::uuid[]) limit 1`,
      [id, orgIds],
    );
    return rows[0] ?? null;
  },
};

// ---------- inventory_movements ----------

export const inventoryMovements = {
  async insert(fields: {
    product_id: string;
    org_id: string;
    delta: number;
    reason: string;
  }): Promise<void> {
    await query(
      `insert into public.inventory_movements (product_id, org_id, delta, reason)
       values ($1::uuid, $2::uuid, $3, $4)`,
      [fields.product_id, fields.org_id, fields.delta, fields.reason],
    );
  },
};

// ---------- orders ----------

export const orders = {
  async listWithItems(
    orgIds: string[],
    limit = 200,
  ): Promise<Array<OrderRow & { order_items: OrderItemRow[] }>> {
    const [orderRows, itemRows] = await Promise.all([
      query<OrderRow>(
        `select * from public.orders
         where org_id = ANY($1::uuid[])
         order by created_at desc
         limit $2`,
        [orgIds, limit],
      ),
      query<OrderItemRow>(
        `select oi.* from public.order_items oi
         where oi.org_id = ANY($1::uuid[])`,
        [orgIds],
      ),
    ]);
    const byOrder = new Map<string, OrderItemRow[]>();
    for (const item of itemRows) {
      const list = byOrder.get(item.order_id) ?? [];
      list.push(item);
      byOrder.set(item.order_id, list);
    }
    return orderRows.map((o) => ({ ...o, order_items: byOrder.get(o.id) ?? [] }));
  },

  async listSimple(orgIds: string[], filters?: {
    statuses?: string[];
    since?: string;
  }): Promise<OrderRow[]> {
    const clauses = ["org_id = ANY($1::uuid[])"];
    const values: unknown[] = [orgIds];
    if (filters?.statuses?.length) {
      values.push(filters.statuses);
      clauses.push(`status = ANY($${values.length}::text[])`);
    }
    if (filters?.since) {
      values.push(filters.since);
      clauses.push(`created_at >= $${values.length}::timestamptz`);
    }
    return query<OrderRow>(
      `select * from public.orders
       where ${clauses.join(" and ")}`,
      values,
    );
  },

  async listRecent(orgIds: string[], limit: number): Promise<OrderRow[]> {
    return query<OrderRow>(
      `select id, order_number, customer_name, total_cents, status, created_at
       from public.orders
       where org_id = ANY($1::uuid[])
       order by created_at desc
       limit $2`,
      [orgIds, limit],
    );
  },

  async getById(id: string, orgIds: string[]): Promise<OrderRow | null> {
    const rows = await query<OrderRow>(
      `select * from public.orders where id = $1::uuid and org_id = ANY($2::uuid[]) limit 1`,
      [id, orgIds],
    );
    return rows[0] ?? null;
  },

  async getByPaypalOrderId(paypalOrderId: string): Promise<OrderRow[]> {
    return query<OrderRow>(
      `select * from public.orders where paypal_order_id = $1`,
      [paypalOrderId],
    );
  },

  async updateStatus(
    id: string,
    orgIds: string[] | null,
    fields: { status: string; paypal_capture_id?: string | null; paypal_order_id?: string },
  ): Promise<OrderRow | null> {
    const rows = await query<OrderRow>(
      `update public.orders set
         status = $1,
         paypal_capture_id = coalesce($2, paypal_capture_id),
         paypal_order_id = coalesce($3, paypal_order_id),
         updated_at = now()
       where id = $4::uuid
         ${orgIds ? "and org_id = ANY($5::uuid[])" : ""}
       returning *`,
      orgIds
        ? [fields.status, fields.paypal_capture_id ?? null, fields.paypal_order_id ?? null, id, orgIds]
        : [fields.status, fields.paypal_capture_id ?? null, fields.paypal_order_id ?? null, id],
    );
    return rows[0] ?? null;
  },

  async updateFields(
    id: string,
    orgIds: string[] | null,
    fields: Record<string, unknown>,
  ): Promise<OrderRow | null> {
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const scopeOffset = keys.length;
    const rows = await query<OrderRow>(
      `update public.orders set ${sets}, updated_at = now()
       where id = $${scopeOffset + 1}::uuid
         ${orgIds ? `and org_id = ANY($${scopeOffset + 2}::uuid[])` : ""}
       returning *`,
      [...keys.map((k) => fields[k]), id, ...(orgIds ? [orgIds] : [])],
    );
    return rows[0] ?? null;
  },
};

// ---------- order_items ----------

export const orderItems = {
  /** All product-line items for the orgs (metrics top-products, all time). */
  async listByOrgAllTime(orgIds: string[]): Promise<OrderItemRow[]> {
    return query<OrderItemRow>(
      `select id, order_id, org_id, product_id, tier_id, registration_id, kind, name_snapshot, qty, unit_price_cents
       from public.order_items
       where org_id = ANY($1::uuid[]) and kind = 'product'`,
      [orgIds],
    );
  },

  async listTicketRegistrationIds(orderId: string): Promise<string[]> {
    const rows = await query<{ registration_id: string | null }>(
      `select registration_id from public.order_items
       where order_id = $1::uuid and kind = 'ticket' and registration_id is not null`,
      [orderId],
    );
    return rows.map((r) => r.registration_id).filter((v): v is string => Boolean(v));
  },
};

// ---------- transactions ----------

export const transactions = {
  async list(orgIds: string[], limit = 200): Promise<TransactionRow[]> {
    return query<TransactionRow>(
      `select * from public.transactions
       where org_id = ANY($1::uuid[])
       order by created_at desc
       limit $2`,
      [orgIds, limit],
    );
  },

  async insert(fields: {
    org_id: string;
    order_id?: string | null;
    registration_id?: string | null;
    provider?: string;
    provider_ref?: string | null;
    type?: string;
    amount_cents: number;
    currency?: string;
    status?: string;
    verified?: boolean;
    raw?: Record<string, unknown> | null;
  }): Promise<TransactionRow> {
    const rows = await query<TransactionRow>(
      `insert into public.transactions
        (org_id, order_id, provider, provider_ref, type, amount_cents, currency, status, verified, raw)
       values ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
       returning *`,
      [fields.org_id, fields.order_id ?? null, fields.provider ?? "paypal",
       fields.provider_ref ?? null, fields.type ?? "payment", fields.amount_cents,
       fields.currency ?? "MYR", fields.status ?? "pending", fields.verified ?? false,
       fields.raw ? JSON.stringify(fields.raw) : null],
    );
    return rows[0];
  },

  async findPaymentByRef(ref: string): Promise<TransactionRow[]> {
    return query<TransactionRow>(
      `select * from public.transactions where provider_ref = $1 and type = 'payment'`,
      [ref],
    );
  },

  async findRefundForOrder(orderId: string): Promise<TransactionRow | null> {
    const rows = await query<TransactionRow>(
      `select id from public.transactions where order_id = $1::uuid and type = 'refund' limit 1`,
      [orderId],
    );
    return rows[0] ?? null;
  },
};

// ---------- webhook_events ----------

export const webhookEvents = {
  /** Insert for dedupe; unique violation (23505) means already seen. */
  async insert(fields: {
    provider: string;
    event_type: string;
    provider_event_id: string;
    payload: unknown;
  }): Promise<{ duplicate: boolean }> {
    try {
      await query(
        `insert into public.webhook_events (provider, event_type, provider_event_id, payload, status)
         values ($1, $2, $3, $4::jsonb, 'received')`,
        [fields.provider, fields.event_type, fields.provider_event_id, JSON.stringify(fields.payload)],
      );
      return { duplicate: false };
    } catch (err) {
      if ((err as { code?: string }).code === "23505") return { duplicate: true };
      throw err;
    }
  },

  async markProcessed(providerEventId: string): Promise<void> {
    await query(
      `update public.webhook_events set status = 'processed', processed_at = now()
       where provider_event_id = $1`,
      [providerEventId],
    );
  },

  async markFailed(providerEventId: string): Promise<void> {
    await query(
      `update public.webhook_events set status = 'failed', processed_at = now()
       where provider_event_id = $1`,
      [providerEventId],
    );
  },
};

// ---------- notifications ----------

export const notifications = {
  async list(orgIds: string[], limit = 100): Promise<NotificationRow[]> {
    return query<NotificationRow>(
      `select id, type, title, body, link, read_at, created_at
       from public.notifications
       where org_id = ANY($1::uuid[])
       order by read_at asc nulls first, created_at desc
       limit $2`,
      [orgIds, limit],
    );
  },

  async countUnread(orgIds: string[]): Promise<number> {
    const rows = await query<{ c: string }>(
      `select count(*)::text as c from public.notifications
       where org_id = ANY($1::uuid[]) and read_at is null`,
      [orgIds],
    );
    return Number(rows[0]?.c ?? 0);
  },

  async markRead(id: string, orgIds: string[]): Promise<void> {
    await query(
      `update public.notifications set read_at = now()
       where id = $1::uuid and org_id = ANY($2::uuid[])`,
      [id, orgIds],
    );
  },

  async markAllRead(orgIds: string[]): Promise<void> {
    await query(
      `update public.notifications set read_at = now()
       where org_id = ANY($1::uuid[]) and read_at is null`,
      [orgIds],
    );
  },

  async insert(fields: {
    org_id: string;
    type: string;
    title: string;
    body?: string | null;
    link?: string | null;
  }): Promise<void> {
    await query(
      `insert into public.notifications (org_id, type, title, body, link)
       values ($1::uuid, $2, $3, $4, $5)`,
      [fields.org_id, fields.type, fields.title, fields.body ?? null, fields.link ?? null],
    );
  },
};

// ---------- ai_insights ----------

export const aiInsights = {
  async listRecent(orgIds: string[], limit = 5): Promise<AiInsightRow[]> {
    return query<AiInsightRow>(
      `select id, kind, prompt, response, model, created_at
       from public.ai_insights
       where org_id = ANY($1::uuid[])
       order by created_at desc
       limit $2`,
      [orgIds, limit],
    );
  },

  async insert(fields: {
    org_id: string;
    kind: string;
    prompt?: string | null;
    response?: string | null;
    model?: string | null;
    data_window?: Record<string, unknown> | null;
  }): Promise<void> {
    await query(
      `insert into public.ai_insights (org_id, kind, prompt, response, model, data_window)
       values ($1::uuid, $2, $3, $4, $5, $6::jsonb)`,
      [fields.org_id, fields.kind, fields.prompt ?? null, fields.response ?? null,
       fields.model ?? null, fields.data_window ? JSON.stringify(fields.data_window) : null],
    );
  },
};

// ---------- reports ----------

export const reports = {
  async list(orgIds: string[], limit = 25): Promise<ReportRow[]> {
    return query<ReportRow>(
      `select id, type, file_url, status, created_at from public.reports
       where org_id = ANY($1::uuid[])
       order by created_at desc
       limit $2`,
      [orgIds, limit],
    );
  },

  async insert(fields: {
    org_id: string;
    type: string;
    params: Record<string, unknown>;
    file_url: string | null;
    status: string;
  }): Promise<ReportRow> {
    const rows = await query<ReportRow>(
      `insert into public.reports (org_id, type, params, file_url, status)
       values ($1::uuid, $2, $3::jsonb, $4, $5)
       returning *`,
      [fields.org_id, fields.type, JSON.stringify(fields.params), fields.file_url, fields.status],
    );
    return rows[0];
  },
};

// ---------- files (storage replacement, Phase 4) ----------

export const files = {
  async insert(fields: {
    org_id: string;
    bucket: string;
    name: string;
    mime: string;
    bytes: Buffer;
    created_by: string | null;
  }): Promise<FileRow | null> {
    const rows = await query<FileRow>(
      `insert into public.files (org_id, bucket, name, mime, bytes, size, created_by)
       values ($1::uuid, $2, $3, $4, $5, $6, $7::uuid)
       returning id, org_id, bucket, name, mime, size, created_by, created_at`,
      [fields.org_id, fields.bucket, fields.name, fields.mime, fields.bytes,
       fields.bytes.length, fields.created_by],
    );
    return rows[0] ?? null;
  },

  async getWithBytes(id: string): Promise<FileRow | null> {
    const rows = await query<FileRow>(
      `select * from public.files where id = $1::uuid limit 1`,
      [id],
    );
    return rows[0] ?? null;
  },
};

export { withTransaction };
export type { QueryRow };
