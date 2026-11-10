"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasDatabaseEnv } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/session";
import { orders, isMasterShowcaseOrg } from "@/lib/db/repo";

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
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const parsed = inputSchema.safeParse({ orderId, next });
  if (!parsed.success) return { error: "Invalid order or target status." };

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };

  const order = await orders.getById(parsed.data.orderId, session.orgIds);
  if (!order) return { error: "Order not found." };

  if (isMasterShowcaseOrg(order.org_id)) {
    return {
      error: "The master showcase workspace is read-only. Switch or launch your private sandbox to update orders.",
    };
  }
  const allowed: Record<string, string[]> = {
    paid: ["fulfilled"],
    pending: ["cancelled"],
  };
  if (!allowed[order.status]?.includes(parsed.data.next)) {
    return { error: `Cannot move a ${order.status} order to ${parsed.data.next}.` };
  }

  const updated = await orders.updateStatus(order.id, session.orgIds, {
    status: parsed.data.next,
  });
  if (!updated) return { error: "Could not update the order." };

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  return {
    ok:
      parsed.data.next === "fulfilled"
        ? "Order marked fulfilled."
        : "Order cancelled.",
  };
}
