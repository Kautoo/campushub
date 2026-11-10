"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eventSchema, type EventInput } from "@/lib/validation";
import { hasDatabaseEnv } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/session";
import { orgs, events, isMasterShowcaseOrg } from "@/lib/db/repo";

export type EventActionResult = { ok?: string; error?: string } | null;

const statusToggleSchema = z.enum(["draft", "published"]);
const idSchema = z.string().uuid();

/** "" or undefined → null so empty form fields clear timestamptz/text columns. */
function nullable(value: string | undefined | null): string | null {
  return value ? value : null;
}

export async function createEvent(
  input: EventInput,
): Promise<EventActionResult> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid event data" };
  }

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };

  const org = await orgs.firstForUser(session.user.id, session.activeOrgId);
  if (!org) return { error: "No organization found for your account." };

  if (isMasterShowcaseOrg(org.id)) {
    return {
      error: "The master showcase workspace is read-only. Switch or launch your private sandbox to create new events.",
    };
  }
  try {
    await events.insert({
      org_id: org.id,
      created_by: session.user.id,
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: nullable(parsed.data.description),
      cover_url: nullable(parsed.data.cover_url),
      venue: nullable(parsed.data.venue),
      category: nullable(parsed.data.category),
      start_at: nullable(parsed.data.start_at),
      end_at: nullable(parsed.data.end_at),
      capacity: parsed.data.capacity,
      status: parsed.data.status,
    });
  } catch (err) {
    return { error: (err as Error).message };
  }
  revalidatePath("/demo", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: `Event “${parsed.data.title}” created.` };
}

export async function updateEvent(
  id: string,
  input: EventInput,
): Promise<EventActionResult> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid event id" };

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid event data" };
  }

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };

  try {
    const existing = await events.getById(id, session.orgIds);
    if (existing && isMasterShowcaseOrg(existing.org_id)) {
      return {
        error: "The master showcase workspace is read-only. Switch or launch your private sandbox to edit events.",
      };
    }
    const updated = await events.update(id, session.orgIds, {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: nullable(parsed.data.description),
      cover_url: nullable(parsed.data.cover_url),
      venue: nullable(parsed.data.venue),
      category: nullable(parsed.data.category),
      start_at: nullable(parsed.data.start_at),
      end_at: nullable(parsed.data.end_at),
      capacity: parsed.data.capacity,
      status: parsed.data.status,
    });
    if (!updated) return { error: "Event not found." };
  } catch (err) {
    return { error: (err as Error).message };
  }
  revalidatePath("/demo", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: `Event “${parsed.data.title}” saved.` };
}

/** Publish/unpublish toggle: draft ↔ published. */
export async function setEventStatus(
  id: string,
  status: "draft" | "published",
): Promise<EventActionResult> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid event id" };

  const parsed = statusToggleSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };

  const existing = await events.getById(id, session.orgIds);
  if (existing && isMasterShowcaseOrg(existing.org_id)) {
    return {
      error: "The master showcase workspace is read-only. Switch or launch your private sandbox to change status.",
    };
  }
  const updated = await events.updateStatus(id, session.orgIds, parsed.data);
  if (!updated) return { error: "Event not found." };
  revalidatePath("/demo", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: parsed.data === "published" ? "Event published to storefront." : "Event moved to draft." };
}
