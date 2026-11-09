"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { createEvent, updateEvent } from "@/app/actions/events";
import { Badge } from "@/components/ui/badge";
import type { EventInput } from "@/lib/validation";

export type EventRow = {
  id: string;
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
  total_sold: number;
};

const PHOTO_PRESETS = [
  {
    label: "Innovation & Conference Hall",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkGKgKw6VSLV0diILC4W0PfrGA6B9tq3jZvcSkvYE9S-VMbx9vHq9gLKNJFuehPV1U14V8WZ88g0iA-NYbFxes0na0xc1rWe48QTJbfLihpw0Uig8fud1sKPutN7SWTPsgSBON6fsK7fJPkVv8CHMssuaagJUbhC5WMd_qjetlBZ5sZACYCxY6gcvav64SCCvwYRwz5WwLtJZpezsCBAACb_vysbBhFVM8GQepBVJF",
  },
  {
    label: "Hackathon & Innovation Lab",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBX0_sC-dBDNzTjGeMvufMkk8Qg4WCPEPsmdaK5iRrCO-8z86fjhpzEVkuy7Gj7kT7qQ8-3WEfilcspSo_Uz3Zv7-Gfw6izdmC8wl86RyHShaaOH2_SrPzBq4msM5CtHppM38HmdR69cueX_91mXhTqcQr9gE7ELh1pXl4IRsMDYso5hu9xNIlmrqeoSiPrxLZKpiII6JXtdD2DmQ79_SZU2E83M-ka5ILxlIobnOwT",
  },
  {
    label: "AI & Machine Learning Lab",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIPnnJOUxuHtxBaAWqdc6D93UZ9eJ9rcbZK_lBiyj2jGcF92Zp2TtpviuATHuZwSkn6qFA5lNlKVNO79FwkV13w0VoN4siz_KgZZXQpt3BzQmZRpBIOoBnd3HfJB6TAcvBCd3w-F1ZoPIYz9RnbwQ7hERL4UnsXS_fnR58f25BGnNO2KLF2sWOIvsnEJRU_cMqevtsnz7WmPvF8RHBKgMj6f01uEH5Copxxsx97S__",
  },
  {
    label: "Startup Career Exhibition",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0B52QC0MXKLYsgDYceb5ZlJ3LwKx8vxRjsPNEyTqZywg54BlqLkIV66RMBjQ6Pyf0_pIwKirQjVQQI7akm96YiJsISqXiTT1ZlpS44QylONJFRaDPn6EGb_8dtxpKrjGzmAqj6v_rnL05ckQb-muRqQpE78oj4b89iuHLIZxSEh_0SyJYf0fRuBPp1DsHbc4X5c9TCLYzEePP-S5IhWPdbPeP0fJwvq_71mjlcBI6",
  },
  {
    label: "Cybersecurity & CTF Night",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfg4nSH4ImbNw_beLGvmzVsh5puf-o_2gDfLVVimRL3fzDc2tLc_kX1Fyoe8LeqYN0ySRi8PCcIotw5FhDHtNUt3sFGBG1oVAiJ17xr2jzPwsDnJlBHTup78L3WeO6czQ92PGk-HNWvfD2M0G29DJW6W7Eq0lC3cvvbPkj9wEPO1A2eSZGH7xFW3m32d7dPvRxZ_evOWAuJ4obMJPmVwhsisEumYwJu0f_Rf8Q5UPO",
  },
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

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
  "focus-aura mt-1 h-11 w-full rounded-xl border border-outline-variant/70 bg-surface-low px-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest transition-colors";

export function EventModal({
  open,
  onClose,
  event,
}: {
  open: boolean;
  onClose: () => void;
  event?: EventRow;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live state for Wix-style real-time storefront preview
  const [title, setTitle] = useState(event?.title ?? "");
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [category, setCategory] = useState(event?.category ?? "conference");
  const [coverUrl, setCoverUrl] = useState(
    event?.cover_url ?? PHOTO_PRESETS[0].url,
  );
  const [status, setStatus] = useState(event?.status ?? "draft");
  const [startDate, setStartDate] = useState(toLocalInput(event?.start_at ?? null));
  const [capacity, setCapacity] = useState(event?.capacity ?? 150);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");

  if (!open) return null;

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const formTitle = String(formData.get("title") ?? "").trim();
    const input: EventInput = {
      title: formTitle,
      slug:
        String(formData.get("slug") ?? "").trim() || slugify(formTitle),
      description: String(formData.get("description") ?? "").trim(),
      cover_url: coverUrl.trim() || undefined,
      venue: String(formData.get("venue") ?? "").trim(),
      category: String(formData.get("category") ?? "").trim(),
      start_at: toIso(String(formData.get("start_at") ?? "")),
      end_at: toIso(String(formData.get("end_at") ?? "")),
      capacity: Number(formData.get("capacity") ?? 0),
      status: (String(formData.get("status") ?? "draft") ||
        "draft") as EventInput["status"],
    };

    const result = event?.id
      ? await updateEvent(event.id, input)
      : await createEvent(input);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  const startFormatted = startDate
    ? new Date(startDate).toLocaleDateString("en-MY", {
        month: "short",
        day: "numeric",
      })
    : "Date TBA";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={event?.id ? "Edit event" : "New event"}
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-outline-variant/70 bg-surface-lowest p-6 sm:p-8 shadow-2xl opacity-100 space-y-6">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Badge tone="teal" icon="confirmation_number">
                Event Initiative Studio
              </Badge>
              {event?.id ? (
                <Link
                  href={`/demo/events/${event.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:underline"
                >
                  <span>View live on storefront</span>
                  <span className="material-symbols-outlined text-[13px]">
                    open_in_new
                  </span>
                </Link>
              ) : null}
            </div>
            <h2 className="text-headline-md font-bold text-on-surface">
              {event?.id ? "Edit Campus Event" : "Create New Campus Event"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Wix-style Edit vs Storefront Preview Tab Switcher */}
            <div className="inline-flex rounded-xl border border-outline-variant/60 bg-surface-low p-0.5">
              <button
                type="button"
                onClick={() => setPreviewMode("edit")}
                className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all ${
                  previewMode === "edit"
                    ? "bg-primary text-on-primary shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Form Editor
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("preview")}
                className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all flex items-center gap-1 ${
                  previewMode === "preview"
                    ? "bg-primary text-on-primary shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  visibility
                </span>
                <span>Live Store Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Wix-Style Live Storefront Card Preview */}
        {previewMode === "preview" ? (
          <div className="space-y-4 rounded-2xl border border-outline-variant/50 bg-surface-low/70 p-6">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                Wix Live Storefront Card Preview
              </span>
              <span className="text-xs text-on-surface-variant">
                Updates in real time as you edit
              </span>
            </div>

            <div className="max-w-md mx-auto rounded-2xl bg-surface-lowest border border-outline-variant/60 shadow-lg overflow-hidden">
              <div className="relative h-48 w-full bg-surface-low overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${coverUrl}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00162e]/95 via-[#00162e]/45 to-transparent" />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <Badge tone="teal">{category || "Event"}</Badge>
                  <span className="rounded-full bg-[#00162e]/90 text-white border border-white/15 px-3 py-0.5 text-label-sm font-bold tabular-nums">
                    {startFormatted}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-label-sm text-[#5eead4] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      location_on
                    </span>
                    {venue || "Campus Quad"}
                  </p>
                  <h3 className="text-headline-sm font-bold text-white leading-tight">
                    {title || "Untitled Event"}
                  </h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-label-sm">
                  <span className="text-on-surface-variant">
                    Capacity: {capacity} seats
                  </span>
                  <Badge tone={status === "published" ? "success" : "warning"}>
                    {status}
                  </Badge>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full rounded-full bg-secondary w-1/4" />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Main Form */}
        <form
          action={handleSubmit}
          className="grid gap-space-md sm:grid-cols-2"
        >
          <label className="block sm:col-span-2">
            <span className="text-label-md font-semibold text-on-surface">
              Event Title
            </span>
            <input
              name="title"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Innovation Week 2026"
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="text-label-md font-semibold text-on-surface">
              URL Slug
            </span>
            <input
              name="slug"
              placeholder="auto-generated from title"
              maxLength={120}
              defaultValue={event?.slug ?? ""}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="text-label-md font-semibold text-on-surface">
              Program Track / Category
            </span>
            <input
              name="category"
              maxLength={60}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="conference, hackathon, workshop"
              className={inputCls}
            />
          </label>

          {/* Photo Customizer Section */}
          <div className="sm:col-span-2 space-y-3 rounded-2xl border border-outline-variant/50 bg-surface-low/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-label-md font-bold text-on-surface">
                Cover Photo Customizer (Displayed on Storefront &amp; Passes)
              </span>
              <span className="text-xs text-secondary font-semibold">
                High-Res Campus Imagery
              </span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PHOTO_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCoverUrl(preset.url)}
                  className={`relative h-20 rounded-xl overflow-hidden border transition-all text-left group ${
                    coverUrl === preset.url
                      ? "ring-2 ring-secondary border-secondary scale-102"
                      : "border-outline-variant/60 hover:border-secondary/60 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${preset.url}')` }}
                  />
                  <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors" />
                  <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-bold text-white leading-tight drop-shadow truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Image URL Input */}
            <label className="block pt-1">
              <span className="text-label-sm font-semibold text-on-surface-variant">
                Or paste custom Image URL
              </span>
              <input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-label-md font-semibold text-on-surface">
              Campus Venue / Hall
            </span>
            <input
              name="venue"
              maxLength={200}
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Main Hall, Block C"
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="text-label-md font-semibold text-on-surface">
              Seat / Ticket Capacity
            </span>
            <input
              name="capacity"
              type="number"
              min={0}
              max={100000}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="text-label-md font-semibold text-on-surface">
              Starts At
            </span>
            <input
              name="start_at"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="text-label-md font-semibold text-on-surface">
              Ends At
            </span>
            <input
              name="end_at"
              type="datetime-local"
              defaultValue={toLocalInput(event?.end_at ?? null)}
              className={inputCls}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-label-md font-semibold text-on-surface">
              Publication Status
            </span>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="draft">Draft (Visible on Bryntum Timeline only)</option>
              <option value="published">Published (Live on Public Storefront)</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-label-md font-semibold text-on-surface">
              Event Description &amp; Schedule Notes
            </span>
            <textarea
              name="description"
              rows={3}
              maxLength={4000}
              defaultValue={event?.description ?? ""}
              placeholder="Highlight keynote speakers, hackathon perks, and check-in times..."
              className="focus-aura mt-1.5 w-full rounded-xl border border-outline-variant/70 bg-surface-low px-4 py-3 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest transition-colors"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 pt-2 border-t border-outline-variant/40">
            {error ? (
              <p className="text-body-sm text-error font-medium">{error}</p>
            ) : (
              <p className="text-xs text-on-surface-variant">
                Changes update the storefront &amp; Bryntum scheduler immediately.
              </p>
            )}

            <div className="flex items-center gap-3 ml-auto">
              <Button
                type="button"
                variant="ghost"
                onPress={onClose}
                className="h-11 rounded-full px-6 text-label-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isDisabled={pending}
                className="h-11 rounded-full px-7 text-label-lg font-semibold shadow-xs"
              >
                {pending
                  ? "Saving…"
                  : event?.id
                    ? "Save Changes"
                    : "Create & Publish Event"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
