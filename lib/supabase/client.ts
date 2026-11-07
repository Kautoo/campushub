// Supabase client factories
// - client()    → browser, anon key (RLS applies)
// - server()    → server components/actions, user cookies (RLS applies)
// - public()    → server-only, anon key, no cookie store — for cached public
//                 data paths (storefront, store-config, guest checkout RPC)
// - admin()     → service role, webhooks/AI/report jobs ONLY (bypasses RLS)

import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Row shapes for typed supabase-js clients.
export type TableRow = {

  profiles: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
  };

  organizations: {
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

  events: {
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

  ticket_tiers: {
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

  registrations: {
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

  products: {
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

  orders: {
          id: string;
          org_id: string;
          order_number: string;
          customer_name: string | null;
          customer_email: string;
          subtotal_cents: number;
          fee_cents: number;
          total_cents: number;
          currency: string;
          status:
            | "pending"
            | "paid"
            | "fulfilled"
            | "cancelled"
            | "refunded";
          paypal_order_id: string | null;
          paypal_capture_id: string | null;
          created_at: string;
          updated_at: string;
  };

  order_items: {
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

  transactions: {
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

  notifications: {
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

  org_members: {
          org_id: string;
          user_id: string;
          role: "owner" | "admin" | "staff";
          status: "active" | "invited" | "suspended";
          created_at: string;
  };

  ai_insights: {
          id: string;
          org_id: string;
          kind: "summary" | "anomaly" | "recommendation" | "chat";
          prompt: string | null;
          response: string | null;
          model: string | null;
          data_window: Record<string, unknown> | null;
          created_at: string;
  };

  inventory_movements: {
          id: string;
          product_id: string;
          org_id: string;
          delta: number;
          reason: string;
          ref_id: string | null;
          created_at: string;
  };

};

type TableDef<K extends keyof TableRow> = {
  Row: TableRow[K];
  Insert: Partial<TableRow[K]>;
  Update: Partial<TableRow[K]>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<"profiles">;
      organizations: TableDef<"organizations">;
      events: TableDef<"events">;
      ticket_tiers: TableDef<"ticket_tiers">;
      registrations: TableDef<"registrations">;
      products: TableDef<"products">;
      orders: TableDef<"orders">;
      order_items: TableDef<"order_items">;
      transactions: TableDef<"transactions">;
      notifications: TableDef<"notifications">;
      org_members: TableDef<"org_members">;
      ai_insights: TableDef<"ai_insights">;
      inventory_movements: TableDef<"inventory_movements">;
    };
    Views: Record<string, never>;
    Functions: {
      place_order: {
        Args: {
          p_org: string;
          p_customer_name: string;
          p_customer_email: string;
          p_items: unknown;
        };
        Returns: Record<string, unknown>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. See README setup.",
    );
  }
  return { url, anonKey };
}

/** Browser client (anon, RLS-scoped). */
export function supabaseBrowser() {
  const { url, anonKey } = supabaseConfig();
  return createBrowserClient<Database>(url, anonKey);
}

/** Server client bound to the request's cookies (RLS-scoped). */
export async function supabaseServer() {
  const { url, anonKey } = supabaseConfig();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component — middleware refreshes sessions
        }
      },
    },
  });
}

/**
 * Server-only public client: anon key, no cookie store, no session.
 * Same RLS as a guest visitor — safe for cached public-data reads
 * (published events, active products, org lookup) and the guest
 * place_order RPC. NEVER for anything auth-aware.
 */
export function supabasePublic() {
  const { url, anonKey } = supabaseConfig();
  return createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Service-role client. ONLY for webhooks, PayPal verification, AI jobs, report exports. */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (required for webhooks/AI/export jobs).",
    );
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
