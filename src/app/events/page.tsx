"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  SpotlightCard,
  FastPassModal,
} from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";

export interface EventPlan {
  id: string;
  code: string;
  name: string;
  price: number;
  badge?: string;
  description: string;
  perks: string[];
}

export interface CampusEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category:
    | "Athletics & Fun Runs"
    | "Green & Community"
    | "Tech & Hackathons"
    | "Workshops & Design"
    | "E-Sports";
  date: string;
  month: string;
  dayNumber: number;
  dayOfWeek: string;
  fullDayName: string;
  time: string;
  location: string;
  venueHref: string;
  organizer: string;
  isFree: boolean;
  totalCapacity: number;
  registeredCount: number;
  image: string;
  plans: EventPlan[];
  hasTeeSize?: boolean;
}

const CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: "neon_fun_run_5k",
    title: "Neon 5K Campus Fun Run & Night Lights",
    subtitle: "Illuminated evening campus loop with live DJ pacers & glow kits",
    description:
      "Join 1,200+ students running the dusk loop through Main Quad, Memorial Arch, and Lake Lagunita. Select your entry plan below—choose Plan A for the race shirt only, Plan B for the full shirt + finisher medal + acai recovery bundle, or Plan C to volunteer.",
    category: "Athletics & Fun Runs",
    date: "Saturday, Nov 8, 2025",
    month: "NOV",
    dayNumber: 8,
    dayOfWeek: "SAT",
    fullDayName: "Saturday",
    time: "6:30 PM PST",
    location: "Main Quad Archway → Lake Lagunita Loop",
    venueHref: "/map",
    organizer: "Stanford Running Club & ASSU Wellness Guild",
    isFree: false,
    totalCapacity: 1200,
    registeredCount: 1016,
    image:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: true,
    plans: [
      {
        id: "plan_a",
        code: "PLAN A",
        name: "Runner Tech Tee Only",
        price: 12,
        description:
          "Official moisture-wicking neon tech shirt, custom race bib & timing chip.",
        perks: [
          "Collegiate Dry-Fit Neon Runner Tee",
          "Custom Name Race Bib & RFID Timing",
          "Course Hydration & Electrolyte Gels",
        ],
      },
      {
        id: "plan_b",
        code: "PLAN B",
        name: "Tech Tee + Finisher Medal + Acai Bowl",
        price: 22,
        badge: "Most Popular",
        description:
          "Full race kit with heavyweight die-cast finisher medal & post-run acai bowl.",
        perks: [
          "Collegiate Dry-Fit Neon Runner Tee",
          "Heavyweight Die-Cast 2025 Finisher Medal",
          "LED Pulse Glow Wristband & Headlamp",
          "Post-Run Organic Acai Bowl Voucher",
        ],
      },
      {
        id: "plan_c",
        code: "PLAN C",
        name: "Volunteer Course Marshall",
        price: 0,
        badge: "Free Crew",
        description:
          "Support runners at hydration stations, earn service hours & get crew gear.",
        perks: [
          "Free Hi-Vis Volunteer Crew Vest",
          "4 Certified Community Service Hours",
          "Post-Race Finish Line Dinner Access",
        ],
      },
    ],
  },
  {
    id: "sunday_plogging_cleanup",
    title: "Sunday Campus Plogging & Eco Trail Cleanup",
    subtitle: "Community morning jog & litter cleanup • Eco kits & fresh bagels included",
    description:
      "A zero-waste Swedish fitness tradition combining a relaxed 4K morning jog with trail restoration around Lake Lagunita. Completely free for all students with biodegradable gloves, reusable tote bags, and hot bagels at the finish.",
    category: "Green & Community",
    date: "Sunday, Nov 9, 2025",
    month: "NOV",
    dayNumber: 9,
    dayOfWeek: "SUN",
    fullDayName: "Sunday",
    time: "8:30 AM PST",
    location: "Lake Lagunita Trailhead • Boathouse Dock",
    venueHref: "/map",
    organizer: "Students for Sustainable Stanford (SSS)",
    isFree: true,
    totalCapacity: 350,
    registeredCount: 284,
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: false,
    plans: [
      {
        id: "plan_free_plog",
        code: "COMMUNITY PASS",
        name: "Free Community Plogger Registration",
        price: 0,
        badge: "100% Free",
        description:
          "All cleanup gear and breakfast refreshments sponsored by the Sustainability Fund.",
        perks: [
          "Biodegradable Gloves & Grabber Tool",
          "CampusHub Heavyweight Organic Canvas Tote",
          "Fresh Bagels & Cold Brew Coffee",
          "3 Certified Sustainability Service Hours",
        ],
      },
    ],
  },
  {
    id: "treehacks_autumn_2025",
    title: "TreeHacks Autumn Hackathon & AI Showcase",
    subtitle: "36 hours of engineering, $50,000 prize pool & hardware lab loaners",
    description:
      "California's flagship collegiate hackathon. Build frontier robotics agents, spatial interfaces, and climate hardware. Free admission for verified students with 6 catered meals, GPU compute credits, and hardware loaners.",
    category: "Tech & Hackathons",
    date: "Friday, Nov 14, 2025",
    month: "NOV",
    dayNumber: 14,
    dayOfWeek: "FRI",
    fullDayName: "Friday",
    time: "5:00 PM PST",
    location: "Huang Engineering Amphitheater & Atrium",
    venueHref: "/map",
    organizer: "Stanford ACM & IEEE Student Chapter",
    isFree: true,
    totalCapacity: 800,
    registeredCount: 742,
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: true,
    plans: [
      {
        id: "plan_hacker",
        code: "HACKER RSVP",
        name: "Verified Student Hacker Pass (Solo or Team)",
        price: 0,
        badge: "Free Admission",
        description:
          "Full 36-hour building access, GPU credits, hardware lab loaners, and meals.",
        perks: [
          "36-Hour Lab Access & $250 Cloud GPU Credits",
          "All 6 Catered Meals + Espresso Bar",
          "Exclusive TreeHacks Archival Hoodie",
          "Hardware Bench Loaners (Jetson, Quest 3, LiDAR)",
        ],
      },
    ],
  },
  {
    id: "figma_ai_masterclass",
    title: "Figma Design Systems & AI Prototyping Studio",
    subtitle: "Hands-on studio critique on multi-brand tokens & generative interfaces",
    description:
      "Led by visiting staff product designers from Linear and Apple. Bring your laptop for a deep dive into design token architecture, physics-based micro-interactions, and live portfolio reviews.",
    category: "Workshops & Design",
    date: "Wednesday, Nov 19, 2025",
    month: "NOV",
    dayNumber: 19,
    dayOfWeek: "WED",
    fullDayName: "Wednesday",
    time: "5:30 PM PST",
    location: "d.school Studio 2 • Building 550",
    venueHref: "/map",
    organizer: "Stanford UX & Design Association",
    isFree: true,
    totalCapacity: 120,
    registeredCount: 114,
    image:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: false,
    plans: [
      {
        id: "plan_workshop_free",
        code: "STUDIO SEAT",
        name: "Free Studio Seat & Figma Kit",
        price: 0,
        badge: "Free RSVP",
        description:
          "Includes starter design system file and 1-on-1 portfolio review session.",
        perks: [
          "Reserved Studio Desk & Figma Token Library",
          "1-on-1 Portfolio Critique with Industry Mentors",
          "Complimentary Matcha & Artisanal Pastries",
        ],
      },
    ],
  },
  {
    id: "esports_championship_2025",
    title: "Stanford Collegiate E-Sports LAN Invitational",
    subtitle: "Valorant & Rocket League grand finals with live stage & player jerseys",
    description:
      "Annual intercollegiate LAN arena battle inside Tresidder Grand Ballroom. Choose Plan A for general spectator seating with pizza & drinks, or Plan B for a competitor tournament slot with a custom gamertag jersey and medal.",
    category: "E-Sports",
    date: "Saturday, Nov 22, 2025",
    month: "NOV",
    dayNumber: 22,
    dayOfWeek: "SAT",
    fullDayName: "Saturday",
    time: "1:00 PM PST",
    location: "Tresidder Student Union Grand Ballroom",
    venueHref: "/map",
    organizer: "Stanford Gaming & E-Sports Guild",
    isFree: false,
    totalCapacity: 450,
    registeredCount: 388,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: true,
    plans: [
      {
        id: "plan_esports_a",
        code: "PLAN A",
        name: "Spectator Arena Pass + Pizza & Drinks",
        price: 8,
        description:
          "All-day mainstage viewing, 2 artisan pizza slices & energy drink voucher.",
        perks: [
          "Reserved Mainstage Spectator Seating",
          "2 Slices Artisan Pizza + Energy Drink",
          "Hardware Raffle Ticket (Keyboards & Mice)",
        ],
      },
      {
        id: "plan_esports_b",
        code: "PLAN B",
        name: "Competitor Slot + Custom Jersey + Medal",
        price: 18,
        badge: "Player Kit",
        description:
          "Tournament roster entry with custom sublimated jersey & commemorative medal.",
        perks: [
          "240Hz LAN Tournament Station Access",
          "Custom Sublimated Team Jersey",
          "Die-Cast Mechanical Keycap Finisher Medal",
          "$5,000 Prize Pool Eligibility",
        ],
      },
    ],
  },
];

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
  const [selectedCategory, setSelectedCategory] = useState<string>("All Events");
  const [pricingFilter, setPricingFilter] = useState<"all" | "paid" | "free">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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
    return CAMPUS_EVENTS.filter((ev) => {
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
  }, [selectedCategory, pricingFilter, selectedDay, searchQuery]);

  const handleOpenRegistration = (event: CampusEvent, explicitPlanId?: string) => {
    setActiveRegisterEvent(event);
    const initialPlan =
      explicitPlanId ||
      cardSelectedPlans[event.id] ||
      event.plans[0]?.id ||
      "";
    setSelectedPlanId(initialPlan);
  };

  const handleConfirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegisterEvent) return;

    const chosenPlan =
      activeRegisterEvent.plans.find((p) => p.id === selectedPlanId) ||
      activeRegisterEvent.plans[0];

    const passCode = `EVT-${activeRegisterEvent.month}${
      activeRegisterEvent.dayNumber
    }-${Math.floor(1000 + Math.random() * 9000)}`;

    setPassModalData({
      isOpen: true,
      title: activeRegisterEvent.title,
      subtitle: `${activeRegisterEvent.date} • ${activeRegisterEvent.time}`,
      passCode,
      location: activeRegisterEvent.location,
      tierName: `${chosenPlan.code}: ${chosenPlan.name}`,
    });

    setActiveRegisterEvent(null);
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

      {/* 3. CHRONOLOGICAL TIMELINE SCHEDULE FEED */}
      <section className="space-y-8">
        {filteredEvents.length === 0 ? (
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
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    qr_code_scanner
                  </span>
                  <span>Confirm &amp; Issue Dynamic QR Pass</span>
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
