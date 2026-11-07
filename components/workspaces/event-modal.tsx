"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { createEvent, updateEvent } from "@/app/actions/events";
import type { EventInput } from "@/lib/validation";

export type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  venue: string | null;
  category: string | null;
  start_at: string | null;
  end_at: string | null;
  capacity: number;
  status: string;
  total_sold: number;
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** ISO timestamp → value usable in <input type="datetime-local"> */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(local: string): string {
  if (!local) return "";
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

const inputCls =
  "focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-low px-4 text-body-md text-ink outline-none";

export function EventModal({
  open,
  onClose,
  event,
}: {
  open: boolean;
  onClose: () => void;
  /** Present → edit mode; absent → create mode. */
  event?: EventRow;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const input: EventInput = {
      title: String(formData.get("title") ?? "").trim(),
      slug:
        String(formData.get("slug") ?? "").trim() ||
        slugify(String(formData.get("title") ?? "")),
      description: String(formData.get("description") ?? "").trim(),
      venue: String(formData.get("venue") ?? "").trim(),
      category: String(formData.get("category") ?? "").trim(),
      start_at: toIso(String(formData.get("start_at") ?? "")),
      end_at: toIso(String(formData.get("end_at") ?? "")),
      capacity: Number(formData.get("capacity") ?? 0),
      status: (String(formData.get("status") ?? "draft") || "draft") as EventInput["status"],
    };

    const result = event
      ? await updateEvent(event.id, input)
      : await createEvent(input);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={event ? "Edit event" : "New event"}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-md text-ink">
            {event ? "Edit event" : "New event"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="material-symbols-outlined rounded-full p-1 text-muted hover:bg-surface-container"
          >
            close
          </button>
        </div>

        <form
          action={handleSubmit}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <label className="block md:col-span-2">
            <span className="text-label-md text-ink">Title</span>
            <input
              name="title"
              required
              maxLength={200}
              defaultValue={event?.title ?? ""}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-label-md text-ink">Slug</span>
            <input
              name="slug"
              placeholder="auto from title"
              maxLength={120}
              defaultValue={event?.slug ?? ""}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-label-md text-ink">Category</span>
            <input
              name="category"
              maxLength={60}
              defaultValue={event?.category ?? ""}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-label-md text-ink">Venue</span>
            <input
              name="venue"
              maxLength={200}
              defaultValue={event?.venue ?? ""}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-label-md text-ink">Capacity</span>
            <input
              name="capacity"
              type="number"
              min={0}
              max={100000}
              defaultValue={event?.capacity ?? 0}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-label-md text-ink">Starts</span>
            <input
              name="start_at"
              type="datetime-local"
              defaultValue={toLocalInput(event?.start_at ?? null)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-label-md text-ink">Ends</span>
            <input
              name="end_at"
              type="datetime-local"
              defaultValue={toLocalInput(event?.end_at ?? null)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-label-md text-ink">Status</span>
            <select
              name="status"
              defaultValue={event?.status ?? "draft"}
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-label-md text-ink">Description</span>
            <textarea
              name="description"
              rows={3}
              maxLength={4000}
              defaultValue={event?.description ?? ""}
              className="focus-aura mt-1 w-full rounded-lg border border-outline-variant bg-surface-low px-4 py-3 text-body-md text-ink outline-none"
            />
          </label>

          <div className="flex items-center gap-3 md:col-span-2">
            <Button
              type="submit"
              variant="primary"
              isDisabled={pending}
              className="h-11 rounded-full px-6 text-label-lg"
            >
              {pending ? "Saving…" : event ? "Save changes" : "Create event"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onPress={onClose}
              className="h-11 rounded-full px-6 text-label-lg"
            >
              Cancel
            </Button>
            {error ? <p className="text-body-sm text-error">{error}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
