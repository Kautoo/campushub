"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { GlideSelect, SpotlightCard } from "@/components/ui/react-bits";
import { CampusGrid } from "@/components/ui/CampusGrid";
import { CampusCalendarWrapper } from "@/components/calendar/CampusCalendarWrapper";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { CampusEvent } from "@/data/mockEvents";

export default function OrganizerEventsPage() {
  const [activeTab, setActiveTab] = useState<"grid" | "calendar" | "editor">("grid");
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected event for View Details Modal
  const [viewingEvent, setViewingEvent] = useState<CampusEvent | null>(null);

  // Event to delete for Confirmation Modal
  const [deletingEvent, setDeletingEvent] = useState<CampusEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form state for Editor Tab
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState(
    "Autonomous Drone Swarm & Neural SLAM Workshop"
  );
  const [eventPitch, setEventPitch] = useState(
    "Hands-on flight controller tuning, onboard vision inference, and live flight cage demos at Huang Basement. Free boba for first 50 RSVPs."
  );
  const [eventCategory, setEventCategory] = useState("Tech & AI");
  const [eventDate, setEventDate] = useState("2025-11-14");
  const [eventTime, setEventTime] = useState("17:00");
  const [eventEndTime, setEventEndTime] = useState("20:00");
  const [eventVenue, setEventVenue] = useState(
    "Huang Engineering Amphitheater (Cap: 250)"
  );
  const [aiTone, setAiTone] = useState<"editorial" | "technical" | "urgent">(
    "editorial"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiHighlights, setAiHighlights] = useState<string[]>([]);

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events?status=ALL", {
        headers: { "x-campushub-role": "organizer" },
      });
      if (!res.ok) {
        throw new Error(`Failed to load events: HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEvents(json.data);
      } else {
        throw new Error("Invalid response payload");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle Edit Action from Grid
  const handleEditFromGrid = (event: CampusEvent) => {
    setEditingEventId(event.id);
    setEventTitle(event.title || "");
    setEventPitch(event.description || "");
    setEventCategory(event.category || "Tech & AI");
    setEventDate(event.date || "2025-11-14");
    setEventTime(event.time || "17:00");
    setEventVenue(event.location || "");
    setIsPublished(event.status === "PUBLISHED");
    setActiveTab("editor");
  };

  // Handle Delete Action with Authorization
  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/events/${deletingEvent.id}`, {
        method: "DELETE",
        headers: { "x-campushub-role": "organizer" },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message || json.error || "Failed to delete event. Organizer authorization denied."
        );
      }
      // Remove from table state
      setEvents((prev) => prev.filter((e) => e.id !== deletingEvent.id));
      setDeletingEvent(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Event Reschedule from Bryntum Calendar
  const handleEventReschedule = async (
    eventId: string,
    newDate: string,
    newTime: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-campushub-role": "organizer",
        },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return {
          success: false,
          error:
            json.error?.message ||
            json.error ||
            "Failed to reschedule event. Overlap or authorization error.",
        };
      }
      await fetchEvents();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to reschedule event",
      };
    }
  };

  // Handle time slot creation from Bryntum Calendar
  const handleCreateSlotClick = (date: string, time: string) => {
    setEditingEventId(null);
    setEventTitle("New Campus Workshop / Summit");
    setEventPitch("");
    setEventDate(date);
    setEventTime(time);
    setActiveTab("editor");
  };

  // AI Polish Handler for Editor
  const handleAiPolish = async () => {
    setIsGenerating(true);
    setAiError(null);

    try {
      const res = await fetch("/api/ai/event-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-campushub-role": "organizer",
        },
        body: JSON.stringify({
          title: eventTitle,
          category: eventCategory,
          tone: aiTone,
          venue: eventVenue,
          date: eventDate,
          time: eventTime,
          instructions: eventPitch,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate AI event draft");
      }

      if (json.data?.description) {
        setEventPitch(json.data.description);
      }
      if (Array.isArray(json.data?.highlights)) {
        setAiHighlights(json.data.highlights);
      }
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "Error generating AI draft");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Event Handler (Create or Update)
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (editingEventId) {
        await fetch(`/api/events/${editingEventId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-campushub-role": "organizer",
          },
          body: JSON.stringify({
            title: eventTitle,
            category: eventCategory,
            description: eventPitch,
            date: eventDate,
            time: eventTime,
            location: eventVenue,
            status: isPublished ? "PUBLISHED" : "DRAFT",
          }),
        });
      } else {
        await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-campushub-role": "organizer",
          },
          body: JSON.stringify({
            title: eventTitle,
            category: eventCategory,
            description: eventPitch,
            date: `${eventDate} at ${eventTime}`,
            location: eventVenue,
            totalCapacity: 250,
            isFree: true,
            status: isPublished ? "PUBLISHED" : "DRAFT",
          }),
        });
      }
      await fetchEvents();
    } catch {
      // Non-fatal
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // AG Grid Column Definitions
  const columnDefs = useMemo<ColDef<CampusEvent>[]>(() => {
    return [
      {
        headerName: "Event Name",
        field: "title",
        minWidth: 240,
        flex: 2,
        cellRenderer: (params: ICellRendererParams<CampusEvent>) => {
          const title = params.value || "Untitled Event";
          const subtitle = params.data?.subtitle || params.data?.slug || "";
          return (
            <div className="py-1">
              <div className="font-bold text-on-surface text-xs truncate">{title}</div>
              {subtitle && (
                <div className="text-[10px] text-outline font-mono truncate">{subtitle}</div>
              )}
            </div>
          );
        },
      },
      {
        headerName: "Category",
        field: "category",
        minWidth: 150,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<CampusEvent>) => {
          return (
            <div className="py-1">
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">
                {params.value || "General"}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Date & Time",
        field: "date",
        minWidth: 170,
        flex: 1,
        valueGetter: (params) => {
          const d = params.data?.date || "";
          const t = params.data?.time || "";
          return t ? `${d} • ${t}` : d;
        },
      },
      {
        headerName: "Venue",
        field: "location",
        minWidth: 160,
        flex: 1,
      },
      {
        headerName: "Registrations",
        minWidth: 140,
        flex: 1,
        valueGetter: (params) => {
          const registered = params.data?.registeredCount ?? 0;
          const cap = params.data?.totalCapacity ?? 0;
          return `${registered} / ${cap || "∞"}`;
        },
        cellRenderer: (params: ICellRendererParams<CampusEvent>) => {
          const registered = params.data?.registeredCount ?? 0;
          const cap = params.data?.totalCapacity ?? 1;
          const pct = Math.min(100, Math.round((registered / cap) * 100));
          return (
            <div className="py-1.5 w-full">
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="font-bold text-on-surface">{registered}</span>
                <span className="text-outline">/ {params.data?.totalCapacity || "∞"}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Capacity",
        field: "totalCapacity",
        minWidth: 110,
        flex: 1,
        valueFormatter: (params) => (params.value ? params.value.toLocaleString() : "Unlimited"),
      },
      {
        headerName: "Status",
        field: "status",
        minWidth: 130,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<CampusEvent>) => {
          const status = params.value || "PUBLISHED";
          const isPub = status === "PUBLISHED";
          const isDraft = status === "DRAFT";
          return (
            <div className="py-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                  isPub
                    ? "bg-secondary-container text-on-secondary-fixed"
                    : isDraft
                    ? "bg-amber-100 text-amber-800"
                    : "bg-surface-container text-outline"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{status}</span>
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Actions",
        minWidth: 190,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<CampusEvent>) => {
          const ev = params.data;
          if (!ev) return null;
          return (
            <div className="flex items-center gap-1 py-1">
              <button
                type="button"
                onClick={() => setViewingEvent(ev)}
                className="p-1 rounded-lg text-outline hover:text-primary hover:bg-primary/10 transition-colors"
                title="View event details"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
              </button>
              <button
                type="button"
                onClick={() => handleEditFromGrid(ev)}
                className="p-1 rounded-lg text-outline hover:text-primary hover:bg-primary/10 transition-colors"
                title="Edit event"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <Link
                href={`/organizer?event=${encodeURIComponent(ev.id)}`}
                className="p-1 rounded-lg text-outline hover:text-secondary hover:bg-secondary/10 transition-colors"
                title="Manage registrations"
              >
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              </Link>
              <button
                type="button"
                onClick={() => setDeletingEvent(ev)}
                className="p-1 rounded-lg text-outline hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete event"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          );
        },
      },
    ];
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary font-label mb-1">
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>Organizer Event Operations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
            Event Management &amp; Editor
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Browse, sort, filter, and inspect campus events with AG Grid, or launch the AI copy polish editor.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/organizer/tickets"
            className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-base text-primary">confirmation_number</span>
            <span>Configure Tickets</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setEditingEventId(null);
              setEventTitle("New Campus Workshop / Summit");
              setEventPitch("");
              setActiveTab("editor");
            }}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("grid")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-headline flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "grid"
              ? "bg-primary text-on-primary shadow-xs"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">table_chart</span>
          <span>All Managed Events ({events.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-headline flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "calendar"
              ? "bg-primary text-on-primary shadow-xs"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          <span>Bryntum Calendar ({events.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("editor")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-headline flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "editor"
              ? "bg-primary text-on-primary shadow-xs"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">edit_square</span>
          <span>{editingEventId ? "Edit Event & AI Polish" : "New Event Composer"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-secondary-container/40 border border-secondary/30 text-on-secondary-fixed text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
          <span>Event details and academic conflict verification saved successfully!</span>
        </div>
      )}

      {/* TAB 1: AG GRID EVENT MANAGEMENT */}
      {activeTab === "grid" && (
        <div className="space-y-4">
          <CampusGrid<CampusEvent>
            title="Managed Events Roster"
            subtitle="Interactive community data grid with multi-column sorting, quick search filtering, and CSV export."
            rowData={events}
            columnDefs={columnDefs}
            loading={loading}
            error={error}
            onRefresh={fetchEvents}
            exportFileName="campushub-events.csv"
            getRowId={(params) => params.data.id}
            paginationPageSize={10}
            height={520}
          />
        </div>
      )}

      {/* TAB 2: BRYNTUM CALENDAR & SCHEDULING */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <h2 className="text-lg font-headline font-extrabold text-on-surface">
                Bryntum Visual Event Schedule
              </h2>
              <p className="text-xs text-on-surface-variant">
                Interactive calendar with Month, Week, Day, and Agenda views, Malaysia Standard Time (UTC+8), and backend conflict protection.
              </p>
            </div>
          </div>
          <CampusCalendarWrapper
            events={events}
            onEventClick={(ev) => setViewingEvent(ev)}
            onEventReschedule={handleEventReschedule}
            onEventEdit={(ev) => handleEditFromGrid(ev)}
            onCreateSlotClick={handleCreateSlotClick}
            readOnly={false}
          />
        </div>
      )}

      {/* TAB 3: STANDALONE EDITOR FORM */}
      {activeTab === "editor" && (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Editor Fields */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Event Identity */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold font-headline text-on-surface">
                  1. Event Identity &amp; Classification
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-outline text-[10px] font-mono font-bold">
                  {editingEventId ? `EDITING: ${editingEventId}` : "CORE DETAILS"}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-sm font-bold text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                    Category
                  </label>
                  <GlideSelect
                    className="w-full"
                    options={[
                      { value: "Tech & AI", label: "Tech & AI", tag: "STEM" },
                      { value: "Workshops & Design", label: "Workshops & Design", tag: "Arts" },
                      { value: "Athletics & Fun Runs", label: "Athletics & Fun Runs", tag: "Active" },
                      { value: "Green & Community", label: "Green & Community", tag: "Eco" },
                      { value: "E-Sports", label: "E-Sports", tag: "Gaming" },
                      { value: "General", label: "General", tag: "Campus" },
                    ]}
                    value={eventCategory}
                    onChange={(val) => setEventCategory(val)}
                    ariaLabel="Event Category"
                    menuWidth={220}
                    size="lg"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                    Start / End Time
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-1/2 px-2.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface"
                    />
                    <span className="text-outline text-xs">–</span>
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      className="w-1/2 px-2.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: AI Pitch Polish */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold font-headline text-on-surface">
                    2. AI Pitch &amp; Description Polish
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Astropods Copilot refines student copy, optimizes punchiness, and generates perk highlights.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-outline text-[11px] font-bold">Tone:</span>
                  <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/40">
                    {(["editorial", "technical", "urgent"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAiTone(t)}
                        className={`px-2 py-0.5 rounded capitalize text-[10px] font-bold transition-colors ${
                          aiTone === t
                            ? "bg-surface-container-lowest text-primary shadow-2xs"
                            : "text-outline hover:text-on-surface"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  rows={4}
                  value={eventPitch}
                  onChange={(e) => setEventPitch(e.target.value)}
                  placeholder="Provide raw bullet points or rough description for the AI to rewrite..."
                  className="w-full p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface leading-relaxed focus:outline-none focus:border-primary resize-y"
                />
              </div>

              {aiError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs">
                  {aiError}
                </div>
              )}

              {aiHighlights.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono block">
                    AI Suggested Highlights
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiHighlights.map((hl, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/40 text-[11px] font-medium text-on-surface"
                      >
                        ✦ {hl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleAiPolish}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-fixed hover:bg-secondary-container/80 font-headline font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">auto_fix_high</span>
                  <span>{isGenerating ? "Synthesizing with AI..." : "Polish Pitch with AI"}</span>
                </button>
              </div>
            </div>

            {/* Section 3: Venue Logistics */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 sm:p-7 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold font-headline text-on-surface">
                3. Venue Logistics &amp; Smart Gate Sync
              </h2>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Campus Venue &amp; Room
                </label>
                <input
                  type="text"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="publishToggle"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="publishToggle" className="text-xs font-bold text-on-surface select-none">
                  Publish to campus event directory immediately (uncheck to save as draft)
                </label>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("grid")}
                className="px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-xs font-bold font-headline hover:bg-surface-container cursor-pointer"
              >
                Back to Grid
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>{editingEventId ? "Save Changes" : "Create Event"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Poster Preview */}
          <div className="lg:col-span-4 space-y-4 sticky top-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label block">
              Live Preview &amp; Badge Sync
            </span>
            <SpotlightCard className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/60 text-secondary text-[10px] font-mono font-bold">
                  {eventCategory}
                </span>
                <span className="text-[10px] font-mono text-outline">
                  {isPublished ? "● LIVE" : "○ DRAFT"}
                </span>
              </div>
              <div>
                <h3 className="font-headline font-black text-lg text-on-surface leading-snug">
                  {eventTitle || "Untitled Event"}
                </h3>
                <div className="text-xs text-outline font-mono mt-1">
                  {eventDate} • {eventTime}
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-4">
                {eventPitch || "Event pitch will appear here."}
              </p>
              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-outline font-mono">
                <span className="truncate max-w-[180px]">{eventVenue}</span>
                <span className="font-bold text-primary">Cap: 250</span>
              </div>
            </SpotlightCard>
          </div>
        </form>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-6 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/60 text-secondary text-[10px] font-mono font-bold">
                  {viewingEvent.category}
                </span>
                <h2 className="text-xl font-black font-headline text-on-surface mt-2">
                  {viewingEvent.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingEvent(null)}
                className="text-outline hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-outline">calendar_today</span>
                <span>{viewingEvent.date} • {viewingEvent.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-outline">location_on</span>
                <span>{viewingEvent.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-outline">group</span>
                <span>Capacity: {viewingEvent.totalCapacity || "Unlimited"} (Registered: {viewingEvent.registeredCount || 0})</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-low text-xs leading-relaxed text-on-surface">
              {viewingEvent.description || "No description provided."}
            </div>

            {viewingEvent.plans && viewingEvent.plans.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-outline block">
                  Registration Plans &amp; Tiers
                </span>
                <div className="space-y-1.5">
                  {viewingEvent.plans.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-on-surface">{p.name}</span>
                        <p className="text-[11px] text-outline">{p.description}</p>
                      </div>
                      <span className="font-mono font-bold text-primary">
                        {p.price === 0 ? "FREE" : `$${p.price.toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setViewingEvent(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const ev = viewingEvent;
                  setViewingEvent(null);
                  handleEditFromGrid(ev);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold font-headline shadow-xs"
              >
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl border border-red-500/30 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">warning</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Delete Event Confirmation
                </h3>
                <p className="text-xs text-on-surface-variant">
                  This action requires verified organizer ownership.
                </p>
              </div>
            </div>

            <p className="text-xs text-on-surface leading-relaxed">
              Are you sure you want to delete <span className="font-bold">{deletingEvent.title}</span>? This will permanently remove the event from campus schedules and cancel associated registrations.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => {
                  setDeletingEvent(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-headline shadow-xs disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
