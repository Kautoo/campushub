"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { productSchema } from "@/lib/validation";
import { hasDatabaseEnv } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/session";
import { orgs, products, inventoryMovements, isMasterShowcaseOrg } from "@/lib/db/repo";

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
  const imageList: string[] = [];
  if (parsed.image_url) {
    imageList.push(parsed.image_url);
  } else if (parsed.images && parsed.images.length > 0) {
    imageList.push(...parsed.images);
  }
  return {
    name: parsed.name,
    slug: parsed.slug,
    description: parsed.description ? parsed.description : null,
    images: imageList,
    category: parsed.category ? parsed.category : null,
    price_cents: parsed.price_cents,
    stock: parsed.stock,
    low_stock_threshold: parsed.low_stock_threshold,
    sku: parsed.sku ? parsed.sku : null,
    status: parsed.status,
    channel3_ref: null as string | null,
  };
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; message?: string };
  return e?.code === "23505" || /duplicate key|unique constraint/i.test(e?.message ?? "");
}

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const raw = Object.fromEntries(formData) as Record<string, string>;
  if (!raw.slug) raw.slug = slugify(raw.name ?? "");
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };

  const org = await orgs.firstForUser(session.user.id);
  if (!org) return { error: "No organization found for your account." };

  if (isMasterShowcaseOrg(org.id)) {
    return {
      error: "The master showcase workspace is read-only. Switch or launch your private sandbox to add merchandise.",
    };
  }

  let created: { id: string } | null = null;
  try {
    created = await products.insert(rowFromParsed(parsed.data), org.id);
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "A product with this slug already exists." };
    }
    return { error: (err as Error).message };
  }
  if (!created) return { error: "Could not create the product." };

  if (parsed.data.stock > 0) {
    await inventoryMovements.insert({
      product_id: created.id,
      org_id: org.id,
      delta: parsed.data.stock,
      reason: "initial stock",
    });
  }

  revalidatePath("/demo", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: `Product “${parsed.data.name}” created.` };
}

export async function updateProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Missing or invalid product id." };

  const raw = Object.fromEntries(formData) as Record<string, string>;
  if (!raw.slug) raw.slug = slugify(raw.name ?? "");
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };

  const before = await products.getById(id.data, session.orgIds);
  if (!before) return { error: "Product not found." };

  if (isMasterShowcaseOrg(before.org_id)) {
    return {
      error: "The master showcase workspace is read-only. Switch or launch your private sandbox to edit merchandise.",
    };
  }
  try {
    const updated = await products.update(id.data, session.orgIds, rowFromParsed(parsed.data));
    if (!updated) return { error: "Product not found." };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "A product with this slug already exists." };
    }
    return { error: (err as Error).message };
  }

  const delta = parsed.data.stock - before.stock;
  if (delta !== 0) {
    await inventoryMovements.insert({
      product_id: id.data,
      org_id: before.org_id,
      delta,
      reason: "manual adjustment",
    });
  }

  revalidatePath("/demo", "layout");
  revalidatePath("/dashboard", "layout");
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
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const parsed = statusSchema.safeParse({ id, status });
  if (!parsed.success) return { error: "Invalid product or status." };

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };
  const before = await products.getById(parsed.data.id, session.orgIds);
  if (before && isMasterShowcaseOrg(before.org_id)) {
    return {
      error: "The master showcase workspace is read-only. Switch or launch your private sandbox to change status.",
    };
  }
  const updated = await products.updateStatus(parsed.data.id, session.orgIds, parsed.data.status);
  if (!updated) return { error: "Product not found." };

  revalidatePath("/demo", "layout");
  revalidatePath("/dashboard", "layout");
  return {
    ok: parsed.data.status === "archived"
      ? "Product archived."
      : "Product activated.",
  };
}
