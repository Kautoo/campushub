"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";

export type OrderActionState = { ok?: string; error?: string };

const inputSchema = z.object({
  orderId: z.string().uuid(),
  next: z.enum(["fulfilled", "cancelled"]),
});

/**
 * Status transitions: paid → fulfilled, pending → cancelled.
 * Any other current/target combination is rejected.
 */
export async function setOrderStatus(
  orderId: string,
  next: "fulfilled" | "cancelled",
): Promise<OrderActionState> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const parsed = inputSchema.safeParse({ orderId, next });
  if (!parsed.success) return { error: "Invalid order or target status." };

  const { data: rows } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", parsed.data.orderId)
    .limit(1);
  const order = rows?.[0];
  if (!order) return { error: "Order not found." };

  const allowed: Record<string, string[]> = {
    paid: ["fulfilled"],
    pending: ["cancelled"],
  };
  if (!allowed[order.status]?.includes(parsed.data.next)) {
    return { error: `Cannot move a ${order.status} order to ${parsed.data.next}.` };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data.next })
    .eq("id", parsed.data.orderId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  return {
    ok:
      parsed.data.next === "fulfilled"
        ? "Order marked fulfilled."
        : "Order cancelled.",
  };
}
