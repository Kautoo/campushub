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
  category: "Athletics & Fun Runs" | "Green & Community" | "Tech & Hackathons" | "Workshops & Design" | "E-Sports";
  date: string;
  month: string;
  dayNumber: number;
  dayOfWeek: string;
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
      "Join 1,200+ students running the dusk loop through Main Quad, Memorial Arch, and Lake Lagunita. Choose between runner gear packages with dry-fit performance shirts and die-cast finisher medals.",
    category: "Athletics & Fun Runs",
    date: "Saturday, Nov 8, 2025",
    month: "NOV",
    dayNumber: 8,
    dayOfWeek: "SAT",
    time: "6:30 PM PST",
    location: "Main Quad Archway → Lake Lagunita Loop",
    venueHref: "/map",
    organizer: "Stanford Running Club & ASSU Wellness Guild",
    isFree: false,
    totalCapacity: 1200,
    registeredCount: 1016,
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: true,
    plans: [
      {
        id: "plan_a",
        name: "Plan A • Runner Tech Tee Only",
        price: 12,
        description: "Official moisture-wicking neon tech shirt, bib number & timing chip.",
        perks: [
          "Collegiate Dry-Fit Neon Runner Tee",
          "Custom Name Race Bib & RFID Chip",
          "Hydration Station Access & Energy Gels",
        ],
      },
      {
        id: "plan_b",
        name: "Plan B • Tech Tee + Finisher Medal + Acai Bowl",
        price: 22,
        badge: "Most Popular",
        description: "Full race package with heavyweight die-cast metal medal & post-run acai voucher.",
        perks: [
          "Collegiate Dry-Fit Neon Runner Tee",
          "Heavyweight Die-Cast 2025 Finisher Medal",
          "LED Pulse Glow Wristband & Night Headlamp",
          "Post-Run Organic Acai Bowl Voucher (Tresidder)",
          "Priority Wave A / B Starting Corral",
        ],
      },
      {
        id: "plan_c",
        name: "Plan C • Volunteer Marshall & Station Crew",
        price: 0,
        badge: "Free RSVP",
        description: "Support runners along the course, earn service hours & receive free volunteer gear.",
        perks: [
          "Free Hi-Vis Neon Volunteer Windbreaker",
          "4 Certified Community Service Hours",
          "Post-Race VIP Dinner & Glow Lounge Access",
        ],
      },
    ],
  },
  {
    id: "sunday_plogging_cleanup",
    title: "Sunday Campus Plogging & Eco Canal Cleanup",
    subtitle: "Community jogging while picking up litter • Eco bags & fresh bagels provided",
    description:
      "A zero-waste Swedish-inspired fitness initiative. Jog or walk a brisk 4K loop cleaning up campus perimeter trails. Free eco-friendly gloves, reusable burlap CampusHub tote bag, and fresh hot bagels at the finish line.",
    category: "Green & Community",
    date: "Sunday, Nov 9, 2025",
    month: "NOV",
    dayNumber: 9,
    dayOfWeek: "SUN",
    time: "8:30 AM PST",
    location: "Lake Lagunita Trailhead • Station 4",
    venueHref: "/map",
    organizer: "Students for Sustainable Stanford (SSS)",
    isFree: true,
    totalCapacity: 350,
    registeredCount: 284,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: false,
    plans: [
      {
        id: "plan_free_plog",
        name: "Free Community Entry",
        price: 0,
        badge: "100% Free",
        description: "All equipment supplied by the Student Environmental Fund.",
        perks: [
          "Biodegradable Trash Pickers & Heavy Duty Gloves",
          "CampusHub Heavyweight Eco Tote Bag",
          "Post-Plog Hot Brew & Organic Bagels",
          "Registrar Sustainability Certificate (3 Hours)",
        ],
      },
    ],
  },
  {
    id: "treehacks_autumn_2025",
    title: "TreeHacks Autumn Hackathon & AI Showcase",
    subtitle: "36 hours of engineering, $50,000 prize pool & hardware lab loaners",
    description:
      "California's premier undergraduate hackathon. Build frontier robotics agents, spatial interfaces, and climate software. Completely free for all verified students with all gourmet catering provided.",
    category: "Tech & Hackathons",
    date: "Friday, Nov 14 – 16, 2025",
    month: "NOV",
    dayNumber: 14,
    dayOfWeek: "FRI",
    time: "5:00 PM PST",
    location: "Huang Engineering Amphitheater & Labs",
    venueHref: "/map",
    organizer: "Stanford ACM & Engineering Guild",
    isFree: true,
    totalCapacity: 800,
    registeredCount: 742,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: true,
    plans: [
      {
        id: "plan_hacker",
        name: "Free Hacker Pass • Solo or Team",
        price: 0,
        badge: "Free RSVP",
        description: "Full 36-hour weekend pass including hardware parts & catering.",
        perks: [
          "36-Hour Lab & GPU Cluster Compute Credits",
          "All 6 Catered Meals + 24/7 Red Bull / Coffee",
          "Exclusive Embroidered TreeHacks Heavyweight Hoodie",
          "Hardware Lab Loaning (Jetson, Oculus, Sensors)",
        ],
      },
    ],
  },
  {
    id: "figma_ai_masterclass",
    title: "Figma Design Systems & AI Prototyping Masterclass",
    subtitle: "Hands-on studio workshop on component tokens & LLM generative UI",
    description:
      "Taught by senior product designers from Apple and Linear. Bring your laptop to learn scalable multi-brand design tokens, micro-interactions with GSAP, and wiring automated AI design prompts.",
    category: "Workshops & Design",
    date: "Wednesday, Nov 19, 2025",
    month: "NOV",
    dayNumber: 19,
    dayOfWeek: "WED",
    time: "5:30 PM – 8:00 PM",
    location: "d.school Studio 2 • Building 550",
    venueHref: "/map",
    organizer: "Stanford UX & Design Association",
    isFree: true,
    totalCapacity: 120,
    registeredCount: 114,
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: false,
    plans: [
      {
        id: "plan_workshop_free",
        name: "General Student Workshop Seat",
        price: 0,
        badge: "100% Free",
        description: "Workshop materials & Figma Professional team license included.",
        perks: [
          "Hands-on Studio Seat & Figma Design Kit",
          "1-on-1 Portfolio Critique Slot",
          "Complimentary Blue Bottle Iced Coffee & Pastries",
        ],
      },
    ],
  },
  {
    id: "esports_championship_2025",
    title: "Stanford E-Sports LAN Finals & Tournament",
    subtitle: "Collegiate Valorant & Rocket League finals with live spectator lounge",
    description:
      "Annual collegiate LAN battle. Watch the top university squads battle on stage or register your 5-man roster. Spectators get pizza and energy drinks; competitors receive custom jerseys and custom keycap trophies.",
    category: "E-Sports",
    date: "Saturday, Nov 22, 2025",
    month: "NOV",
    dayNumber: 22,
    dayOfWeek: "SAT",
    time: "1:00 PM – 9:00 PM",
    location: "Tresidder Student Union Grand Ballroom",
    venueHref: "/map",
    organizer: "Stanford Gaming Guild",
    isFree: false,
    totalCapacity: 450,
    registeredCount: 388,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    hasTeeSize: true,
    plans: [
      {
        id: "plan_esports_a",
        name: "Plan A • Spectator Pass + Pizza & Drinks",
        price: 8,
        description: "Mainstage viewing, energy drink & 2 slices of fresh artisan pizza.",
        perks: [
          "All-Day Grand Ballroom Spectator Seat",
          "2 Slices of Pizza + Monster Energy Voucher",
          "Raffle Entry for RTX 5080 GPU Giveaway",
        ],
      },
      {
        id: "plan_esports_b",
        name: "Plan B • Competitor Slot + Custom Jersey & Medal",
        price: 18,
        badge: "Tournament Entry",
        description: "Stage tournament tournament slot with personalized gamertag jersey.",
        perks: [
          "Official LAN Station 240Hz Rig Allocation",
          "Custom Sublimated Team Jersey with Gamertag",
          "Die-Cast Mechanical Keycap Finisher Medal",
          "$5,000 Tournament Cash Prize Pool Eligibility",
        ],
      },
    ],
  },
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

  // Registration Drawer / Modal State
  const [activeRegisterEvent, setActiveRegisterEvent] = useState<CampusEvent | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [teeSize, setTeeSize] = useState<string>("M");
  const [bibName, setBibName] = useState<string>("ALEX RIVERA");
  const [pickupHub, setPickupHub] = useState<string>("Student Union Hub A (Lockers #B-01 to #B-48)");
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
        if (!matchesTitle && !matchesDesc && !matchesLocation && !matchesOrganizer) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, pricingFilter, selectedDay, searchQuery]);

  const handleOpenRegistration = (event: CampusEvent) => {
    setActiveRegisterEvent(event);
    setSelectedPlanId(event.plans[0]?.id || "");
  };

  const handleConfirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegisterEvent) return;

    const chosenPlan =
      activeRegisterEvent.plans.find((p) => p.id === selectedPlanId) ||
      activeRegisterEvent.plans[0];

    const passCode = `EVT-${activeRegisterEvent.month}${activeRegisterEvent.dayNumber}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    setPassModalData({
      isOpen: true,
      title: activeRegisterEvent.title,
      subtitle: `${activeRegisterEvent.date} • ${activeRegisterEvent.time}`,
      passCode,
      location: activeRegisterEvent.location,
      tierName: chosenPlan.name,
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

  return (
    <main className="relative pt-28 pb-24 max-w-7xl mx-auto px-6">
      {/* 1. HERO HEADER WITHOUT PROMO BADGE (Request 2 compliant) */}
      <PageHero
        titleLead="Official Campus"
        titleHighlight="Events & Registration"
        titleTrail="calendar."
        description="Discover athletic fun runs with tiered runner packages, free community plogging cleanups, 36-hour hackathons, and design masterclasses. Claim your verified CampusHub Dynamic QR Pass."
        stats={[
          {
            label: "Upcoming Schedule",
            value: "5 Flagship Events",
            sublabel: "November 2025 Calendar",
            icon: "calendar_month",
          },
          {
            label: "Registration Roster",
            value: "2,544 Students RSVP'd",
            sublabel: "Zero Platform Fee",
            icon: "how_to_reg",
            accent: true,
          },
        ]}
      />

      {/* 2. NOVEMBER 2025 INTERACTIVE CALENDAR STRIP */}
      <div className="mb-8 p-4 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">event</span>
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono">
              November 2025 • Interactive Event Dates
            </span>
          </div>
          {selectedDay !== null && (
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-[11px] font-bold text-primary hover:underline font-mono"
            >
              Clear Date Filter (Show All)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {CAMPUS_EVENTS.map((ev) => {
            const isSelected = selectedDay === ev.dayNumber;
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : ev.dayNumber)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-on-primary border-primary shadow-sm scale-[1.02]"
                    : "bg-surface-container-low/70 hover:bg-surface-container border-outline-variant/30 text-on-surface"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono font-extrabold uppercase ${
                      isSelected ? "text-on-primary/80" : "text-primary"
                    }`}
                  >
                    {ev.dayOfWeek} • {ev.month} {ev.dayNumber}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : ev.isFree
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                        : "bg-secondary-container text-on-secondary-fixed"
                    }`}
                  >
                    {ev.isFree ? "FREE" : "TIERED"}
                  </span>
                </div>
                <p className="font-headline font-bold text-xs truncate leading-tight">
                  {ev.title}
                </p>
                <p
                  className={`text-[10px] truncate mt-0.5 ${
                    isSelected ? "text-white/80" : "text-on-surface-variant font-mono"
                  }`}
                >
                  {ev.time}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CONTROLS: CATEGORIES & PRICING FILTERS */}
      <div className="sticky top-20 z-30 mb-8 space-y-3">
        <div className="glass-pill rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {CATEGORY_TABS.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-on-surface text-surface font-bold shadow-2xs"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Pricing Mode Filter + Search */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-0.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPricingFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  pricingFilter === "all"
                    ? "bg-surface-container-lowest text-primary shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setPricingFilter("paid")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  pricingFilter === "paid"
                    ? "bg-surface-container-lowest text-primary shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Paid (Tiered)
              </button>
              <button
                type="button"
                onClick={() => setPricingFilter("free")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  pricingFilter === "free"
                    ? "bg-surface-container-lowest text-primary shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Free ($0)
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search events, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 sm:w-48 pl-8 pr-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-outline pointer-events-none">
                search
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. EVENTS CALENDAR FEED */}
      <div className="space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface-container-lowest border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">
              event_busy
            </span>
            <h3 className="font-headline font-bold text-base text-on-surface">
              No events found matching your filter criteria
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">
              Try adjusting your category or pricing filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All Events");
                setPricingFilter("all");
                setSelectedDay(null);
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const pctCapacity = Math.round((ev.registeredCount / ev.totalCapacity) * 100);
            const minPrice = Math.min(...ev.plans.map((p) => p.price));
            const maxPrice = Math.max(...ev.plans.map((p) => p.price));

            return (
              <SpotlightCard
                key={ev.id}
                className="p-6 sm:p-8 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/30 shadow-xs hover:border-primary/40 transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Event Visual & Date Box */}
                  <div className="lg:col-span-4 relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] bg-surface-container">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Date Tag */}
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase text-secondary-container">
                        {ev.month}
                      </span>
                      <span className="text-base font-extrabold font-headline leading-none">
                        {ev.dayNumber}
                      </span>
                    </div>

                    {/* Pricing Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md text-[11px] font-bold font-mono text-on-surface">
                        {ev.isFree ? (
                          <span className="text-emerald-600 font-extrabold">FREE RSVP</span>
                        ) : (
                          <span>
                            From <strong className="text-primary">${minPrice.toFixed(2)}</strong>
                            {maxPrice > minPrice && ` – $${maxPrice.toFixed(2)}`}
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-white/90 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {ev.time}
                      </span>
                    </div>
                  </div>

                  {/* Middle Column: Details & Tier Plans Preview */}
                  <div className="lg:col-span-8 flex flex-col justify-between h-full space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider font-mono">
                          {ev.category}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          Organized by {ev.organizer}
                        </span>
                      </div>

                      <h3 className="font-headline font-extrabold text-xl sm:text-2xl text-on-surface leading-tight">
                        {ev.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mt-1.5">
                        {ev.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-on-surface font-semibold mt-3">
                        <span className="material-symbols-outlined text-base text-primary">
                          location_on
                        </span>
                        <span>{ev.location}</span>
                        <Link
                          href={ev.venueHref}
                          className="text-primary hover:underline text-[11px] font-mono font-bold ml-1"
                        >
                          View Map ↗
                        </Link>
                      </div>
                    </div>

                    {/* Plans Preview Chips */}
                    <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                      <span className="text-[10px] font-bold text-outline uppercase tracking-wider block font-mono">
                        Available Entry Options &amp; Plans:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {ev.plans.map((p) => (
                          <div
                            key={p.id}
                            className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-xs text-on-surface truncate">
                                {p.name.split("•")[0]}
                              </span>
                              {p.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/15 text-primary shrink-0">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs font-extrabold text-primary">
                              {p.price === 0 ? "FREE" : `$${p.price.toFixed(2)}`}
                            </span>
                            <p className="text-[10px] text-on-surface-variant truncate mt-0.5">
                              {p.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="pt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <div className="w-24 h-2 rounded-full bg-surface-container-low overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(100, pctCapacity)}%` }}
                          />
                        </div>
                        <span className="text-on-surface-variant font-bold">
                          {ev.registeredCount} / {ev.totalCapacity} RSVP&apos;d ({pctCapacity}%)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenRegistration(ev)}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          confirmation_number
                        </span>
                        <span>
                          {ev.isFree ? "1-Click Free RSVP" : "Select Plan & Register"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            );
          })
        )}
      </div>

      {/* 5. INTERACTIVE REGISTRATION & TIER SELECTION MODAL */}
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
            <div className="p-6 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border-b border-outline-variant/30 flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
                  {activeRegisterEvent.category} • {activeRegisterEvent.date}
                </span>
                <h3 className="font-headline font-extrabold text-xl text-on-surface mt-1">
                  {activeRegisterEvent.title}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {activeRegisterEvent.location} • {activeRegisterEvent.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveRegisterEvent(null)}
                className="w-8 h-8 rounded-full bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleConfirmRegistration} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {/* Plan Tier Selection */}
              <div>
                <label className="text-xs font-bold font-mono text-outline uppercase tracking-wider block mb-2">
                  1. Choose Your Entry Plan &amp; Kit Tier
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
                            ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/40"
                            : "bg-surface-container-low/60 hover:bg-surface-container-low border-outline-variant/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-outline-variant"
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
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
                              {plan.price === 0 ? "FREE" : `$${plan.price.toFixed(2)}`}
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

              {/* T-Shirt Size (If event has tee sizes & paid) */}
              {activeRegisterEvent.hasTeeSize && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
                  <div>
                    <label className="text-xs font-bold font-mono text-outline uppercase tracking-wider block mb-1.5">
                      2. Dry-Fit Runner Tee Size
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
                      Runner Bib Name (Custom Printed)
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
              <div className="pt-2 border-t border-outline-variant/20">
                <label className="text-xs font-bold font-mono text-outline uppercase tracking-wider block mb-1.5">
                  Locker Pickup &amp; Kit Collection Point
                </label>
                <select
                  value={pickupHub}
                  onChange={(e) => setPickupHub(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Student Union Hub A (Lockers #B-01 to #B-48)">
                    Student Union Hub A (Lockers #B-01 to #B-48) • 24/7 QR Access
                  </option>
                  <option value="Tresidder North Express Lockers (#C-10 to #C-30)">
                    Tresidder North Express Lockers (#C-10 to #C-30)
                  </option>
                  <option value="Race Day Main Quad Check-In Tent (Gate B)">
                    Race Day Main Quad Check-In Tent (Gate B)
                  </option>
                </select>
              </div>

              {/* Total & Confirmation Button */}
              <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-outline uppercase block">
                    Settlement Total (0% Rake)
                  </span>
                  <span className="text-xl font-extrabold font-money text-primary">
                    {activeChosenPlan?.price === 0
                      ? "FREE ($0.00)"
                      : `$${activeChosenPlan?.price.toFixed(2)}`}
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary font-headline font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    qr_code_scanner
                  </span>
                  <span>Confirm RSVP &amp; Issue Dynamic QR Pass</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DUAL-MODE FAST-PASS MODAL (Request 6) */}
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
