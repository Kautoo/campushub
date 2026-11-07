"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eventSchema, type EventInput } from "@/lib/validation";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";

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
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid event data" };
  }

  const { data: orgs } = await supabase
    .from("organizations")
    .select("id")
    .limit(1);
  const org = orgs?.[0];
  if (!org) return { error: "No organization found for your account." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("events").insert({
    org_id: org.id,
    created_by: user?.id ?? null,
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: nullable(parsed.data.description),
    venue: nullable(parsed.data.venue),
    category: nullable(parsed.data.category),
    start_at: nullable(parsed.data.start_at),
    end_at: nullable(parsed.data.end_at),
    capacity: parsed.data.capacity,
    status: parsed.data.status,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard");
  return { ok: `Event “${parsed.data.title}” created.` };
}

export async function updateEvent(
  id: string,
  input: EventInput,
): Promise<EventActionResult> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid event id" };

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid event data" };
  }

  const { error } = await supabase
    .from("events")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: nullable(parsed.data.description),
      venue: nullable(parsed.data.venue),
      category: nullable(parsed.data.category),
      start_at: nullable(parsed.data.start_at),
      end_at: nullable(parsed.data.end_at),
      capacity: parsed.data.capacity,
      status: parsed.data.status,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard");
  return { ok: `Event “${parsed.data.title}” saved.` };
}

/** Publish/unpublish toggle: draft ↔ published. */
export async function setEventStatus(
  id: string,
  status: "draft" | "published",
): Promise<EventActionResult> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid event id" };

  const parsed = statusToggleSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  const { error } = await supabase
    .from("events")
    .update({ status: parsed.data })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard");
  return { ok: parsed.data === "published" ? "Event published." : "Event unpublished." };
}
