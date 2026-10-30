"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  SpotlightCard,
  FastPassModal,
} from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";
import { CampusCalendarWrapper } from "@/components/calendar/CampusCalendarWrapper";

import {
  type EventPlan,
  type CampusEvent,
  CAMPUS_EVENTS,
} from "@/data/mockEvents";
export type { EventPlan, CampusEvent };
export { CAMPUS_EVENTS };

interface CalendarDayCell {
  dayNumber: number;
  dayOfWeek: string;
  month: string;
  event?: CampusEvent;
}

const NOVEMBER_CALENDAR_STRIP: CalendarDayCell[] = [
  { dayNumber: 6, dayOfWeek: "THU", month: "NOV" },
  { dayNumber: 7, dayOfWeek: "FRI", month: "NOV" },
  {
    dayNumber: 8,
    dayOfWeek: "SAT",
    month: "NOV",
    event: CAMPUS_EVENTS.find((e) => e.dayNumber === 8),
  },
  {
    dayNumber: 9,
    dayOfWeek: "SUN",
    month: "NOV",
    event: CAMPUS_EVENTS.find((e) => e.dayNumber === 9),
  },
  { dayNumber: 11, dayOfWeek: "TUE", month: "NOV" },
  { dayNumber: 13, dayOfWeek: "THU", month: "NOV" },
  {
    dayNumber: 14,
    dayOfWeek: "FRI",
    month: "NOV",
    event: CAMPUS_EVENTS.find((e) => e.dayNumber === 14),
  },
  { dayNumber: 15, dayOfWeek: "SAT", month: "NOV" },
  { dayNumber: 17, dayOfWeek: "MON", month: "NOV" },
  {
    dayNumber: 19,
    dayOfWeek: "WED",
    month: "NOV",
    event: CAMPUS_EVENTS.find((e) => e.dayNumber === 19),
  },
  { dayNumber: 21, dayOfWeek: "FRI", month: "NOV" },
  {
    dayNumber: 22,
    dayOfWeek: "SAT",
    month: "NOV",
    event: CAMPUS_EVENTS.find((e) => e.dayNumber === 22),
  },
  { dayNumber: 24, dayOfWeek: "MON", month: "NOV" },
];

const CATEGORY_TABS = [
  "All Events",
  "Athletics & Fun Runs",
  "Green & Community",
  "Tech & Hackathons",
  "Workshops & Design",
  "E-Sports",
] as const;

const TEE_SIZES = ["XS", "S", "M", "L", "XL", "2XL"] as const;

export default function CampusEventsCalendarPage() {
  const [events, setEvents] = useState<CampusEvent[]>(CAMPUS_EVENTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Events");
  const [pricingFilter, setPricingFilter] = useState<"all" | "paid" | "free">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewLayout, setViewLayout] = useState<"cards" | "calendar">("cards");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch("/api/events?status=PUBLISHED")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load events");
        return res.json();
      })
      .then((json) => {
        if (!cancelled && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setEvents(json.data);
        }
      })
      .catch(() => {
        // Keeps verified initial data on offline/network error
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Per-card preselected plan state so users can click Plan A / Plan B inline
  const [cardSelectedPlans, setCardSelectedPlans] = useState<Record<string, string>>({
    neon_fun_run_5k: "plan_b",
    sunday_plogging_cleanup: "plan_free_plog",
    treehacks_autumn_2025: "plan_hacker",
    figma_ai_masterclass: "plan_workshop_free",
    esports_championship_2025: "plan_esports_b",
  });

  // Registration Drawer / Modal State
  const [activeRegisterEvent, setActiveRegisterEvent] = useState<CampusEvent | null>(
    null
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [teeSize, setTeeSize] = useState<string>("M");
  const [bibName, setBibName] = useState<string>("ALEX RIVERA");
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [pickupHub, setPickupHub] = useState<string>(
    "Student Union Hub A (Lockers #B-01 to #B-48)"
  );
  const [passModalData, setPassModalData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    passCode: string;
    location: string;
    tierName: string;
  }>({
    isOpen: false,
    title: "",
    subtitle: "",
    passCode: "",
    location: "",
    tierName: "",
  });

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedCategory !== "All Events" && ev.category !== selectedCategory) {
        return false;
      }
      if (pricingFilter === "paid" && ev.isFree) return false;
      if (pricingFilter === "free" && !ev.isFree) return false;
      if (selectedDay !== null && ev.dayNumber !== selectedDay) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDesc = ev.description.toLowerCase().includes(q);
        const matchesLocation = ev.location.toLowerCase().includes(q);
        const matchesOrganizer = ev.organizer.toLowerCase().includes(q);
        if (
          !matchesTitle &&
          !matchesDesc &&
          !matchesLocation &&
          !matchesOrganizer
        ) {
          return false;
        }
      }
      return true;
    });
  }, [events, selectedCategory, pricingFilter, selectedDay, searchQuery]);

  const handleOpenRegistration = (event: CampusEvent, explicitPlanId?: string) => {
    setActiveRegisterEvent(event);
    setRegistrationError(null);
    const initialPlan =
      explicitPlanId ||
      cardSelectedPlans[event.id] ||
      event.plans[0]?.id ||
      "";
    setSelectedPlanId(initialPlan);
  };

  const handleConfirmRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegisterEvent) return;

    setRegistrationError(null);
    setIsRegistering(true);

    const chosenPlan =
      activeRegisterEvent.plans.find((p) => p.id === selectedPlanId) ||
      activeRegisterEvent.plans[0];

    try {
      let passCode = "";

      if (chosenPlan.price > 0) {
        // Step 1: Create server-authoritative PayPal Sandbox order for paid ticket tier
        const createRes = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-campushub-token": "token_student_alex",
          },
          body: JSON.stringify({
            type: "event",
            eventId: activeRegisterEvent.id,
            planId: chosenPlan.id,
            teeSize,
            description: `${activeRegisterEvent.title} - ${chosenPlan.name}`,
          }),
        });

        const createJson = await createRes.json().catch(() => null);
        if (!createRes.ok || !createJson?.success) {
          throw new Error(
            createJson?.error || "Failed to initialize PayPal order for paid event registration."
          );
        }

        // Step 2: Capture and verify payment through backend
        const captureRes = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-campushub-token": "token_student_alex",
          },
          body: JSON.stringify({
            orderId: createJson.orderId,
            orderID: createJson.orderId,
            internalOrderId: createJson.internalOrderId,
          }),
        });

        const captureJson = await captureRes.json().catch(() => null);

        if (captureRes.status === 504 || captureJson?.code === "PAYPAL_GATEWAY_TIMEOUT" || captureJson?.code === "DATABASE_RECONCILIATION_PENDING") {
          throw new Error(
            "Payment verification is pending automated reconciliation with PayPal Sandbox. Please check your registrations in your Account dashboard shortly."
          );
        }

        if (!captureRes.ok || !captureJson?.success) {
          // Attempt cancellation of pending order to release registration hold
          await fetch("/api/paypal/cancel-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-campushub-token": "token_student_alex",
            },
            body: JSON.stringify({
              orderId: createJson.orderId,
              internalOrderId: createJson.internalOrderId,
            }),
          }).catch(() => {});

          throw new Error(
            captureJson?.error || "PayPal payment capture failed. Event registration was not confirmed."
          );
        }

        passCode =
          captureJson.registration?.passCode ||
          captureJson.order?.pickupPassCode ||
          `FASTPASS-${activeRegisterEvent.id.toUpperCase().substring(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`;
      } else {
        // Free event ($0.00): direct registration
        const res = await fetch("/api/registrations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-campushub-token": "token_student_alex",
          },
          body: JSON.stringify({
            eventId: activeRegisterEvent.id,
            planId: chosenPlan.id,
            teeSize: teeSize,
          }),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          const errorMsg =
            json?.error?.message ||
            json?.message ||
            "Registration failed. Please check event availability or your registration status.";
          throw new Error(errorMsg);
        }

        passCode =
          json.data?.passCode ||
          `FASTPASS-${activeRegisterEvent.id.toUpperCase().substring(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`;
      }

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === activeRegisterEvent.id
            ? { ...ev, registeredCount: ev.registeredCount + 1 }
            : ev
        )
      );

      setPassModalData({
        isOpen: true,
        title: activeRegisterEvent.title,
        subtitle: `${activeRegisterEvent.date} • ${activeRegisterEvent.time}`,
        passCode,
        location: activeRegisterEvent.location,
        tierName: `${chosenPlan.code}: ${chosenPlan.name}`,
      });

      setActiveRegisterEvent(null);
    } catch (regError) {
      const msg = regError instanceof Error ? regError.message : "Could not connect to event registration server. Please try again.";
      setRegistrationError(msg);
    } finally {
      setIsRegistering(false);
    }
  };

  const activeChosenPlan = useMemo(() => {
    if (!activeRegisterEvent) return null;
    return (
      activeRegisterEvent.plans.find((p) => p.id === selectedPlanId) ||
      activeRegisterEvent.plans[0]
    );
  }, [activeRegisterEvent, selectedPlanId]);

  const selectedDayEvent = useMemo(() => {
    if (selectedDay === null) return null;
    return CAMPUS_EVENTS.find((e) => e.dayNumber === selectedDay) || null;
  }, [selectedDay]);

  return (
    <main className="relative pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. CLEAN EDITORIAL PAGE HERO (No promo badge, no highlight/USP cards) */}
      <PageHero
        titleLead="Official Campus"
        titleHighlight="Events & Registration"
        titleTrail="calendar."
        description="Discover athletic fun runs with tiered runner packages, free community plogging cleanups, 36-hour hackathons, and design masterclasses. Claim your verified CampusHub Dynamic QR Pass."
      />

      {/* 2. ARCHITECTURAL INTERACTIVE CALENDAR & FILTER CONSOLE */}
      <section className="mb-12 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/35 shadow-2xs overflow-hidden">
        {/* Top Calendar Bar: Month Title, Legend & Search */}
        <div className="px-5 sm:px-7 py-4 border-b border-outline-variant/25 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low/40">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-on-surface text-surface flex items-center justify-center shadow-2xs">
                <span className="material-symbols-outlined text-[18px]">
                  calendar_month
                </span>
              </div>
              <div>
                <h2 className="font-headline font-extrabold text-sm sm:text-base text-on-surface leading-tight">
                  November 2025
                </h2>
                <p className="text-[11px] font-mono text-on-surface-variant">
                  Autumn Quarter • {CAMPUS_EVENTS.length} Scheduled Events
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-outline-variant/30 text-[11px] font-mono text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Tiered Kit Plans
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Free Community ($0)
              </span>
            </div>
          </div>

          {/* Right Controls: Pricing Segmented Control + Search Input */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center p-1 rounded-xl bg-surface-container-lowest border border-outline-variant/35 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPricingFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  pricingFilter === "all"
                    ? "bg-on-surface text-surface font-bold shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                All ({CAMPUS_EVENTS.length})
              </button>
              <button
                type="button"
                onClick={() => setPricingFilter("paid")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  pricingFilter === "paid"
                    ? "bg-on-surface text-surface font-bold shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Paid Plans
              </button>
              <button
                type="button"
                onClick={() => setPricingFilter("free")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  pricingFilter === "free"
                    ? "bg-on-surface text-surface font-bold shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Free ($0)
              </button>
            </div>

            <div className="relative flex-1 sm:flex-none sm:w-56">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Filter by title or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/35 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Horizontal Interactive Date Strip */}
        <div className="px-5 sm:px-7 py-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {/* "All Dates" Master Tile */}
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className={`shrink-0 h-20 px-4 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedDay === null
                  ? "bg-on-surface text-surface border-on-surface shadow-sm"
                  : "bg-surface-container-low/60 hover:bg-surface-container border-outline-variant/30 text-on-surface"
              }`}
            >
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  selectedDay === null ? "text-secondary-container" : "text-outline"
                }`}
              >
                FULL MONTH
              </span>
              <span className="font-headline font-extrabold text-sm">
                All Dates
              </span>
              <span
                className={`text-[10px] font-mono ${
                  selectedDay === null ? "text-white/75" : "text-primary font-bold"
                }`}
              >
                5 Events
              </span>
            </button>

            <div className="h-12 w-px bg-outline-variant/30 shrink-0 mx-1" />

            {/* Individual Calendar Date Cells */}
            {NOVEMBER_CALENDAR_STRIP.map((cell) => {
              const hasEvent = Boolean(cell.event);
              const isSelected = selectedDay === cell.dayNumber;

              return (
                <button
                  key={cell.dayNumber}
                  type="button"
                  onClick={() =>
                    setSelectedDay(isSelected ? null : cell.dayNumber)
                  }
                  className={`shrink-0 w-16 sm:w-[4.5rem] h-20 rounded-2xl border flex flex-col items-center justify-between py-2.5 px-1.5 transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-primary text-on-primary border-primary shadow-md -translate-y-0.5"
                      : hasEvent
                      ? "bg-surface-container-lowest hover:border-primary/60 border-outline-variant/45 text-on-surface shadow-2xs"
                      : "bg-surface-container-low/35 hover:bg-surface-container-low/70 border-transparent text-on-surface-variant opacity-65 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isSelected
                        ? "text-on-primary/85"
                        : hasEvent
                        ? "text-primary"
                        : "text-outline"
                    }`}
                  >
                    {cell.dayOfWeek}
                  </span>

                  <span className="font-headline font-extrabold text-xl leading-none">
                    {String(cell.dayNumber).padStart(2, "0")}
                  </span>

                  {hasEvent ? (
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold leading-none ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : cell.event?.isFree
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-secondary-container text-on-secondary-fixed"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected
                            ? "bg-white"
                            : cell.event?.isFree
                            ? "bg-emerald-500"
                            : "bg-primary"
                        }`}
                      />
                      {cell.event?.isFree ? "FREE" : "PLAN"}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-outline/50">
                      —
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Selected Day Context Bar */}
          {selectedDay !== null && (
            <div className="mt-4 pt-3.5 border-t border-outline-variant/25 flex flex-wrap items-center justify-between gap-3 text-xs">
              {selectedDayEvent ? (
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono font-bold text-[11px]">
                    NOV {String(selectedDay).padStart(2, "0")} SCHEDULED
                  </span>
                  <span className="font-headline font-bold text-on-surface">
                    {selectedDayEvent.title}
                  </span>
                  <span className="text-on-surface-variant font-mono">
                    • {selectedDayEvent.time} • {selectedDayEvent.location}
                  </span>
                </div>
              ) : (
                <span className="text-on-surface-variant">
                  No flagship events scheduled on{" "}
                  <strong className="text-on-surface">
                    Nov {selectedDay}, 2025
                  </strong>
                  . Showing open calendar slot.
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="text-xs font-mono font-bold text-primary hover:underline cursor-pointer"
              >
                Show All November Dates →
              </button>
            </div>
          )}
        </div>

        {/* Bottom Category Pill Strip */}
        <div className="px-5 sm:px-7 py-3 bg-surface-container-low/50 border-t border-outline-variant/25 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-bold mr-1.5 shrink-0">
            Category:
          </span>
          {CATEGORY_TABS.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-primary text-on-primary font-bold shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. CHRONOLOGICAL TIMELINE SCHEDULE FEED / CALENDAR VIEW */}
      <section className="space-y-6">
        {/* Layout Switcher: Feed Cards vs Bryntum Calendar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
          <div>
            <h2 className="text-xl font-headline font-extrabold text-on-surface">
              {viewLayout === "calendar" ? "Campus Calendar Schedule" : "Upcoming Events & Hackathons"}
            </h2>
            <p className="text-xs text-on-surface-variant">
              {viewLayout === "calendar"
                ? "Interactive university calendar in Asia/Kuala_Lumpur (MYT UTC+8) with Month, Week, Day, and Agenda views."
                : "Explore upcoming events, select your ticket plan, and secure instant FastPass dynamic entry."}
            </p>
          </div>

          <div className="flex items-center bg-surface-container-low border border-outline-variant/40 rounded-xl p-1 shadow-2xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewLayout("cards")}
              className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewLayout === "cards"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_agenda</span>
              <span>Card Feed</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout("calendar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewLayout === "calendar"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              <span>Calendar View</span>
            </button>
          </div>
        </div>

        {viewLayout === "calendar" ? (
          <CampusCalendarWrapper
            events={filteredEvents}
            readOnly={true}
            onEventClick={(ev) => handleOpenRegistration(ev)}
          />
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-[2rem] bg-surface-container-lowest border border-outline-variant/35">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">
              event_busy
            </span>
            <h3 className="font-headline font-bold text-base text-on-surface">
              No campus events match this date or filter
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 mb-5">
              Reset your date or category filter to view all upcoming November events.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All Events");
                setPricingFilter("all");
                setSelectedDay(null);
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-xs cursor-pointer"
            >
              Show All Events
            </button>
          </div>
        ) : (
          filteredEvents.map((ev, index) => {
            const pctCapacity = Math.round(
              (ev.registeredCount / ev.totalCapacity) * 100
            );
            const activeCardPlanId =
              cardSelectedPlans[ev.id] || ev.plans[0]?.id;
            const activeCardPlan =
              ev.plans.find((p) => p.id === activeCardPlanId) || ev.plans[0];

            return (
              <div
                key={ev.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start relative"
              >
                {/* Left 2 Cols: Sticky Chronological Date Spine */}
                <div className="lg:col-span-2 lg:sticky lg:top-28 flex lg:flex-col items-baseline lg:items-start justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        ev.isFree ? "bg-emerald-500" : "bg-primary"
                      } ring-4 ${
                        ev.isFree
                          ? "ring-emerald-500/15"
                          : "ring-primary/15"
                      }`}
                    />
                    <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-primary">
                      {ev.month} {String(ev.dayNumber).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="lg:pl-5">
                    <p className="font-headline font-extrabold text-base text-on-surface leading-tight">
                      {ev.fullDayName}
                    </p>
                    <p className="font-mono text-xs text-on-surface-variant mt-0.5">
                      {ev.time}
                    </p>
                  </div>
                  {index < filteredEvents.length - 1 && (
                    <div className="hidden lg:block w-px h-24 bg-gradient-to-b from-outline-variant/50 to-transparent ml-1 mt-3" />
                  )}
                </div>

                {/* Right 10 Cols: Architectural Event Card */}
                <div className="lg:col-span-10">
                  <SpotlightCard className="p-6 sm:p-7 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/35 shadow-2xs hover:border-primary/40 transition-all">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                      {/* Event Visual Column (4 Cols on xl) */}
                      <div className="xl:col-span-4 space-y-3">
                        <div className="relative rounded-2xl overflow-hidden aspect-[16/10] xl:aspect-[4/3] bg-surface-container">
                          <img
                            src={ev.image}
                            alt={ev.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                              {ev.category}
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                            <span className="text-[11px] font-mono font-bold">
                              {ev.totalCapacity - ev.registeredCount} spots left
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-[10px] font-mono font-bold">
                              {pctCapacity}% Full
                            </span>
                          </div>
                        </div>

                        {/* Capacity Bar */}
                        <div className="px-1 space-y-1.5">
                          <div className="w-full h-1.5 rounded-full bg-surface-container-low overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(100, pctCapacity)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
                            <span>{ev.registeredCount} registered</span>
                            <Link
                              href={ev.venueHref}
                              className="text-primary font-bold hover:underline"
                            >
                              Campus Map ↗
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Event Copy & Interactive Plan Picker (8 Cols on xl) */}
                      <div className="xl:col-span-8 flex flex-col justify-between space-y-5">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-secondary">
                              {ev.organizer}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                              <span className="material-symbols-outlined text-[15px] text-primary">
                                location_on
                              </span>
                              {ev.location}
                            </span>
                          </div>

                          <h3 className="font-headline font-extrabold text-xl sm:text-2xl text-on-surface tracking-tight leading-snug">
                            {ev.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mt-1.5">
                            {ev.description}
                          </p>
                        </div>

                        {/* Interactive Entry Plans Selector */}
                        <div className="space-y-2.5 pt-3 border-t border-outline-variant/25">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-outline font-bold">
                              {ev.plans.length > 1
                                ? `Select Entry Package (${ev.plans.length} Plans Available)`
                                : "Entry Package Included"}
                            </span>
                            <span className="text-[11px] font-mono text-primary font-semibold">
                              Instant Dynamic QR Pass
                            </span>
                          </div>

                          <div
                            className={`grid grid-cols-1 ${
                              ev.plans.length === 3
                                ? "md:grid-cols-3"
                                : ev.plans.length === 2
                                ? "md:grid-cols-2"
                                : "md:grid-cols-1"
                            } gap-2.5`}
                          >
                            {ev.plans.map((plan) => {
                              const isSelected = activeCardPlan.id === plan.id;
                              return (
                                <button
                                  key={plan.id}
                                  type="button"
                                  onClick={() =>
                                    setCardSelectedPlans((prev) => ({
                                      ...prev,
                                      [ev.id]: plan.id,
                                    }))
                                  }
                                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                      ? "bg-primary/[0.06] border-primary ring-1 ring-primary/30 shadow-2xs"
                                      : "bg-surface-container-low/60 hover:bg-surface-container-low border-outline-variant/30"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1.5 mb-1">
                                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-primary">
                                        {plan.code}
                                      </span>
                                      <span className="font-mono text-sm font-extrabold text-on-surface">
                                        {plan.price === 0
                                          ? "FREE"
                                          : `$${plan.price.toFixed(2)}`}
                                      </span>
                                    </div>
                                    <p className="font-headline font-bold text-xs text-on-surface leading-snug">
                                      {plan.name}
                                    </p>
                                    <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                                      {plan.description}
                                    </p>
                                  </div>

                                  <div className="mt-2.5 pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-on-surface-variant">
                                      {plan.perks.length} perks included
                                    </span>
                                    {plan.badge && (
                                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-fixed">
                                        {plan.badge}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Card Footer Action Row */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {activeCardPlan.perks.slice(0, 3).map((perk, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant"
                              >
                                ✓ {perk}
                              </span>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenRegistration(ev, activeCardPlan.id)
                            }
                            className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs shrink-0 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              confirmation_number
                            </span>
                            <span>
                              {activeCardPlan.price === 0
                                ? `Claim ${activeCardPlan.code} (Free)`
                                : `Register ${activeCardPlan.code} ($${activeCardPlan.price.toFixed(
                                    2
                                  )})`}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* 4. INTERACTIVE REGISTRATION & TIER SELECTION MODAL */}
      {activeRegisterEvent && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-on-surface/60 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveRegisterEvent(null)}
        >
          <div
            className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-surface-container-low/70 border-b border-outline-variant/30 flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
                  {activeRegisterEvent.category} • {activeRegisterEvent.date}
                </span>
                <h3 className="font-headline font-extrabold text-xl text-on-surface mt-1.5">
                  {activeRegisterEvent.title}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {activeRegisterEvent.location} • {activeRegisterEvent.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveRegisterEvent(null)}
                className="w-8 h-8 rounded-full bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form
              onSubmit={handleConfirmRegistration}
              className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1"
            >
              {registrationError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  <span>{registrationError}</span>
                </div>
              )}

              {/* Plan Tier Selection */}
              <div>
                <label className="text-xs font-bold font-mono text-outline uppercase tracking-wider block mb-2.5">
                  1. Confirm Entry Plan &amp; Participant Kit
                </label>
                <div className="space-y-2.5">
                  {activeRegisterEvent.plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-2xs ring-1 ring-primary/40"
                            : "bg-surface-container-low/60 hover:bg-surface-container-low border-outline-variant/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-outline-variant"
                              }`}
                            >
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </span>
                            <span className="font-mono text-xs font-extrabold text-primary">
                              {plan.code}
                            </span>
                            <span className="font-headline font-bold text-sm text-on-surface">
                              {plan.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {plan.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed">
                                {plan.badge}
                              </span>
                            )}
                            <span className="font-mono font-extrabold text-sm text-primary">
                              {plan.price === 0
                                ? "FREE"
                                : `$${plan.price.toFixed(2)}`}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-on-surface-variant pl-6 mb-2">
                          {plan.description}
                        </p>

                        <div className="pl-6 flex flex-wrap gap-1.5">
                          {plan.perks.map((perk, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-container text-on-surface"
                            >
                              ✓ {perk}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* T-Shirt Size (If event has tee sizes) */}
              {activeRegisterEvent.hasTeeSize && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-outline-variant/25">
                  <div>
                    <label className="text-xs font-bold font-mono text-outline uppercase tracking-wider block mb-1.5">
                      2. Apparel / Runner Shirt Size
                    </label>
                    <div className="flex items-center gap-1.5">
                      {TEE_SIZES.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setTeeSize(sz)}
                          className={`w-9 h-9 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                            teeSize === sz
                              ? "bg-primary text-on-primary shadow-2xs"
                              : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold font-mono text-outline uppercase tracking-wider block mb-1.5">
                      Participant Bib / Badge Name
                    </label>
                    <input
                      type="text"
                      value={bibName}
                      onChange={(e) => setBibName(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-mono font-bold text-on-surface focus:outline-none focus:border-primary uppercase"
                      placeholder="YOUR NAME"
                    />
                  </div>
                </div>
              )}

              {/* Pickup Hub */}
              <div className="pt-3 border-t border-outline-variant/25">
                <label className="text-xs font-bold font-mono text-outline uppercase tracking-wider block mb-1.5">
                  Kit Fulfillment &amp; Smart Locker Pickup
                </label>
                <select
                  value={pickupHub}
                  onChange={(e) => setPickupHub(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Student Union Hub A (Lockers #B-01 to #B-48)">
                    Student Union Hub A (Lockers #B-01 to #B-48) • 24/7 QR Unlock
                  </option>
                  <option value="Tresidder North Express Lockers (#C-10 to #C-30)">
                    Tresidder North Express Lockers (#C-10 to #C-30)
                  </option>
                  <option value="Event Check-In Desk (Gate B)">
                    Event Check-In Desk (Gate B)
                  </option>
                </select>
              </div>

              {/* Total & Confirmation Button */}
              <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-outline uppercase block">
                    Total Settlement (0% Platform Fee)
                  </span>
                  <span className="text-xl font-extrabold font-money text-primary">
                    {activeChosenPlan?.price === 0
                      ? "FREE ($0.00)"
                      : `$${activeChosenPlan?.price.toFixed(2)}`}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed text-on-primary font-headline font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    {isRegistering ? "progress_activity" : "qr_code_scanner"}
                  </span>
                  <span>
                    {isRegistering
                      ? activeChosenPlan && activeChosenPlan.price > 0
                        ? "Verifying PayPal Settlement..."
                        : "Confirming RSVP..."
                      : activeChosenPlan && activeChosenPlan.price > 0
                      ? `Pay $${activeChosenPlan.price.toFixed(2)} with PayPal & Issue Pass`
                      : "Confirm & Issue Dynamic QR Pass"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DUAL-MODE FAST-PASS MODAL */}
      <FastPassModal
        isOpen={passModalData.isOpen}
        onClose={() => setPassModalData((prev) => ({ ...prev, isOpen: false }))}
        title={passModalData.title}
        subtitle={passModalData.subtitle}
        passCode={passModalData.passCode}
        location={passModalData.location}
        badgeLabel={`CONFIRMED • ${passModalData.tierName.toUpperCase()}`}
      />
    </main>
  );
}
