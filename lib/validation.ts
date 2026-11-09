import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email();

export const checkoutItemSchema = z
  .object({
    product_id: z.string().uuid().optional(),
    tier_id: z.string().uuid().optional(),
    qty: z.number().int().min(1).max(20),
  })
  .refine((v) => Boolean(v.product_id) !== Boolean(v.tier_id), {
    message: "Exactly one of product_id or tier_id is required",
  });

export const checkoutSchema = z.object({
  org_id: z.string().uuid(),
  items: z.array(checkoutItemSchema).min(1).max(20),
  customer_email: emailSchema,
  customer_name: z.string().trim().min(1).max(120),
});

export const eventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, dashes only"),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  cover_url: z.string().trim().max(1000).optional().or(z.literal("")),
  venue: z.string().trim().max(200).optional().or(z.literal("")),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  start_at: z.string().optional().or(z.literal("")),
  end_at: z.string().optional().or(z.literal("")),
  capacity: z.coerce.number().int().min(0).max(100000),
  status: z.enum(["draft", "published", "cancelled", "completed"]),
});
export const productSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, dashes only"),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  image_url: z.string().trim().max(1000).optional().or(z.literal("")),
  images: z.array(z.string().trim().max(1000)).optional(),
  price_cents: z.coerce.number().int().min(0).max(100_000_00),
  stock: z.coerce.number().int().min(0).max(1_000_000),
  low_stock_threshold: z.coerce.number().int().min(0).max(10000),
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  status: z.enum(["active", "draft", "archived"]),
});
export const tierSchema = z.object({
  event_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  price_cents: z.coerce.number().int().min(0).max(100_000_00),
  quantity: z.coerce.number().int().min(0).max(100000),
  perks: z.array(z.string().trim().max(120)).max(10).optional(),
  max_per_order: z.coerce.number().int().min(1).max(20).default(5),
});

export const inviteSchema = z.object({
  email: emailSchema,
  role: z.enum(["owner", "admin", "staff"]),
});

export const orgSettingsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  currency: z.enum(["MYR", "USD", "SGD", "EUR", "GBP"]),
  gateways: z
    .object({ paypal: z.boolean() })
    .partial()
    .optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type ProductInput = z.infer<typeof productSchema>;
