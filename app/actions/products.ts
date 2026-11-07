"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { productSchema } from "@/lib/validation";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";

export type ProductActionState = { ok?: string; error?: string } | null;

const idSchema = z.string().uuid();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function rowFromParsed(parsed: z.infer<typeof productSchema>) {
  return {
    name: parsed.name,
    slug: parsed.slug,
    description: parsed.description ? parsed.description : null,
    category: parsed.category ? parsed.category : null,
    price_cents: parsed.price_cents,
    stock: parsed.stock,
    low_stock_threshold: parsed.low_stock_threshold,
    sku: parsed.sku ? parsed.sku : null,
    status: parsed.status,
  };
}

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const raw = Object.fromEntries(formData) as Record<string, string>;
  if (!raw.slug) raw.slug = slugify(raw.name ?? "");
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { data: orgs } = await supabase
    .from("organizations")
    .select("id")
    .limit(1);
  const org = orgs?.[0];
  if (!org) return { error: "No organization found for your account." };

  const { data: created, error } = await supabase
    .from("products")
    .insert({ org_id: org.id, ...rowFromParsed(parsed.data) })
    .select("id")
    .single();
  if (error) {
    return {
      error: error.code === "23505"
        ? "A product with this slug already exists."
        : error.message,
    };
  }

  if (parsed.data.stock > 0) {
    await supabase.from("inventory_movements").insert({
      product_id: created.id,
      org_id: org.id,
      delta: parsed.data.stock,
      reason: "initial stock",
    });
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  return { ok: `Product “${parsed.data.name}” created.` };
}

export async function updateProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Missing or invalid product id." };

  const raw = Object.fromEntries(formData) as Record<string, string>;
  if (!raw.slug) raw.slug = slugify(raw.name ?? "");
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { data: existing } = await supabase
    .from("products")
    .select("id, stock, org_id")
    .eq("id", id.data)
    .limit(1);
  const before = existing?.[0];
  if (!before) return { error: "Product not found." };

  const { error } = await supabase
    .from("products")
    .update(rowFromParsed(parsed.data))
    .eq("id", id.data);
  if (error) {
    return {
      error: error.code === "23505"
        ? "A product with this slug already exists."
        : error.message,
    };
  }

  const delta = parsed.data.stock - before.stock;
  if (delta !== 0) {
    await supabase.from("inventory_movements").insert({
      product_id: id.data,
      org_id: before.org_id,
      delta,
      reason: "manual adjustment",
    });
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  return { ok: `Product “${parsed.data.name}” saved.` };
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "archived"]),
});

/** Archive or reactivate a product (id + target status). */
export async function setProductStatus(
  id: string,
  status: "active" | "archived",
): Promise<{ ok?: string; error?: string }> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const parsed = statusSchema.safeParse({ id, status });
  if (!parsed.success) return { error: "Invalid product or status." };

  const { error } = await supabase
    .from("products")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  return {
    ok: parsed.data.status === "archived"
      ? "Product archived."
      : "Product activated.",
  };
}
