"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_PRODUCTS } from "@/data/mockData";
import { useBag } from "@/context/BagContext";
import {
  SpotlightCard,
  TiltedCard,
  CountUp,
  Magnet,
  FastPassModal,
  AnimatedContent,
} from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";
import { useIntro } from "@/context/IntroContext";
import { TypewriterHero } from "@/components/ui/TypewriterHero";
import { cn } from "@/lib/utils";

const EXPLORE_CATEGORIES = [
  { id: "All Campus", label: "All Campus", icon: "local_fire_department" },
  { id: "Tech & AI", label: "Tech & AI" },
  { id: "Design & Culture", label: "Design & Culture" },
  { id: "Sports & Wellness", label: "Sports & Wellness" },
  { id: "Official Merch", label: "Official Merch" },
  { id: "Study Jams", label: "Study Jams" },
];

export default function ExplorePage() {
  const router = useRouter();
  const { addItem } = useBag();
  const { stage } = useIntro();
  const isStageComplete = stage === "complete";
  const [selectedFilter, setSelectedFilter] = useState("All Campus");
  const [aiQuery, setAiQuery] = useState("");
  const [rsvpSet, setRsvpSet] = useState<Record<string, boolean>>({});
  const [addedProdId, setAddedProdId] = useState<string | null>(null);
  const [activePassEvent, setActivePassEvent] = useState<{
    title: string;
    subtitle: string;
    location: string;
  } | null>(null);

  const toggleRsvp = (
    id: string,
    title: string,
    subtitle: string,
    location: string
  ) => {
    setRsvpSet((prev) => ({ ...prev, [id]: !prev[id] }));
    setActivePassEvent({ title, subtitle, location });
  };

  const handleQuickAddMerch = (productId: string) => {
    const prod =
      MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];
    addItem(prod, 1, prod.sizes?.[1] || prod.sizes?.[0]);
    setAddedProdId(productId);
    setTimeout(() => setAddedProdId(null), 1800);
  };

  const handleAiSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiQuery.trim()) {
      router.push(`/copilot?q=${encodeURIComponent(aiQuery.trim())}`);
    } else {
      router.push("/copilot");
    }
  };

  const storeItems = [
    MOCK_PRODUCTS.find((p) => p.id === "prod_archival_hoodie") ||
      MOCK_PRODUCTS[0],
    MOCK_PRODUCTS.find((p) => p.id === "prod_hydro_flask") || MOCK_PRODUCTS[1],
    MOCK_PRODUCTS.find((p) => p.id === "prod_field_notebooks") ||
      MOCK_PRODUCTS[4],
  ];

  const showEvents =
    selectedFilter === "All Campus" || selectedFilter !== "Official Merch";

  return (
    <main className="relative pt-28 pb-20">
      {/* Ambient Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-tr from-secondary-container/25 via-primary-fixed/15 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[600px] -right-40 w-[500px] h-[500px] bg-surface-container-high/40 rounded-full blur-[100px]" />
      </div>

      {/* 1. UNIFIED HERO SECTION: LUMA "ART OF HOSTING" + REACT BITS */}
      <div className="max-w-7xl mx-auto px-6">
        <PageHero
          align="center"
          badge="Academic Year 2025/26 • Sync Active"
          badgeSubtext={isStageComplete ? "14 Events Today" : undefined}
          badgeHref="/events"
          customTitle={<TypewriterHero />}
          description="Discover student-led symposiums, late-night hackathons, curated club socials, and official collegiate gear—all synced with your academic schedule."
        >
          {/* React Bits Interactive AI Search Capsule & Filters (revealed after typewriter & navbar) */}
          <div
            className={cn(
              "w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isStageComplete
                ? "opacity-100 translate-y-0 filter-none pointer-events-auto"
                : "opacity-0 translate-y-8 filter blur-xs pointer-events-none"
            )}
          >
            <form
              onSubmit={handleAiSearchSubmit}
              className="max-w-2xl mx-auto mb-7"
            >
              <div className="react-bits-input bg-surface-container-lowest p-2 rounded-2xl border border-outline-variant/50 shadow-[0_12px_36px_-8px_rgba(19,27,46,0.07)] flex items-center gap-3">
                <div className="pl-3 flex items-center justify-center text-primary">
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask AI Copilot: 'Find design workshops free after my 2 PM lab'..."
                  className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-on-surface placeholder:text-outline font-medium py-2"
                />
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container-low text-[11px] font-mono text-outline border border-outline-variant/30">
                  <span>⌘</span>
                  <span>K</span>
                </div>
                <Magnet strength={0.15}>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-headline font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Discover</span>
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </button>
                </Magnet>
              </div>
            </form>

            {/* Quick Filter Pills */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {EXPLORE_CATEGORIES.map((cat) => {
                const active = selectedFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedFilter(cat.id)}
                    className={
                      active
                        ? "px-4 py-2 rounded-full text-xs font-bold bg-on-surface text-surface shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                        : "px-4 py-2 rounded-full text-xs font-semibold bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant border border-outline-variant/40 transition-all cursor-pointer"
                    }
                  >
                    {cat.icon && (
                      <span className="material-symbols-outlined text-[15px] text-secondary-container">
                        {cat.icon}
                      </span>
                    )}
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </PageHero>
      </div>

      {/* LOWER STAGE: Bento grid, shop, and calendar (blooms after navbar arrives) */}
      <div
        className={cn(
          "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isStageComplete
            ? "opacity-100 translate-y-0 filter-none pointer-events-auto"
            : "opacity-0 translate-y-12 filter blur-xs pointer-events-none"
        )}
      >

      {/* 2. LUMA "ART OF HOSTING" FEATURED EVENTS BENTO GRID */}
      {showEvents && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 mb-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-1.5 font-label">
                <span className="material-symbols-outlined text-[16px]">
                  temp_preferences_custom
                </span>
                Curated For Your Week
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                Featured Campus{" "}
                <span className="font-editorial italic font-normal text-on-surface-variant">
                  Experiences
                </span>
              </h2>
            </div>
            <Link
              href="/events"
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-on-surface transition-colors py-2 px-4 rounded-full bg-surface-container-low hover:bg-secondary-container/50"
            >
              View Full Calendar
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Luma-Style Poster Grid */}
          <AnimatedContent
            distance={60}
            direction="vertical"
            duration={0.8}
            ease="power3.out"
            stagger={0.08}
            threshold={0.1}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* CARD 1: Large Flagship Poster Card (Spans 7 cols) */}
            {(selectedFilter === "All Campus" ||
              selectedFilter === "Tech & AI") && (
              <TiltedCard
                maxTilt={2.5}
                className="lg:col-span-7 luma-card group relative rounded-[2rem] overflow-hidden bg-on-surface min-h-[460px] flex flex-col justify-between p-8 text-white shadow-xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85"
                  alt="AI & Robotics Symposium"
                  className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1322] via-[#0d1322]/45 to-transparent" />

                {/* Top Floating Badges */}
                <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-secondary-container text-on-secondary-fixed shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-secondary-fixed animate-ping" />
                      Flagship Symposium
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-black/40 backdrop-blur-md text-white border border-white/15">
                      98% Schedule Match
                    </span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-secondary-container">
                      OCT
                    </span>
                    <span className="block text-lg font-extrabold leading-none font-headline">
                      24
                    </span>
                  </div>
                </div>

                {/* Bottom Overlay Display Typography */}
                <div className="relative z-10 mt-auto pt-16">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary-container mb-2">
                    Hosted by IEEE & Robotics Club
                  </p>
                  <h3 className="font-host-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[0.98] mb-4 uppercase">
                    ROBOTICS &apos;25
                  </h3>
                  <p className="text-sm sm:text-base text-white/85 max-w-xl mb-6 font-normal leading-relaxed">
                    Annual Autonomous Systems & Neural Architecture Showcase.
                    Live quadruped demos, keynote panels, and recruiting mixer.
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
                    <div className="flex items-center gap-4 text-xs text-white/80 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-secondary-container">
                          location_on
                        </span>
                        Huang Engineering Center
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-secondary-container">
                          schedule
                        </span>
                        4:00 PM – 8:30 PM
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-white/80">
                        +142 Attending
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          toggleRsvp(
                            "robotics_25",
                            "AI & Robotics Symposium '25",
                            "OCT 24, 2025 • 4:00 PM",
                            "Huang Engineering Center • Amphitheater"
                          )
                        }
                        className="bg-white text-on-surface hover:bg-secondary-container hover:text-on-secondary-fixed font-headline font-bold text-xs px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <span>
                          {rsvpSet["robotics_25"]
                            ? "Pass Issued ✓"
                            : "1-Click RSVP"}
                        </span>
                        <span className="material-symbols-outlined text-[15px]">
                          confirmation_number
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </TiltedCard>
            )}

            {/* CARD 2: Tall Vertical Editorial Poster Card (Spans 5 cols) */}
            {(selectedFilter === "All Campus" ||
              selectedFilter === "Design & Culture") && (
              <TiltedCard
                maxTilt={2.5}
                className="lg:col-span-5 luma-card group relative rounded-[2rem] overflow-hidden bg-[#1b2414] min-h-[460px] flex flex-col justify-between p-8 text-white shadow-xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80"
                  alt="Design & Sound Salon"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141f0a] via-[#141f0a]/40 to-transparent" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
                    Design & Sound
                  </span>
                  <span className="text-xs font-mono font-bold text-secondary-container bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                    OCT 28 • 6:30 PM
                  </span>
                </div>

                <div className="relative z-10 my-auto py-8 text-center">
                  <span className="block text-[11px] uppercase tracking-[0.25em] text-secondary-container/90 mb-2 font-bold">
                    Spotify Design Guest Lecture
                  </span>
                  <h3 className="font-editorial italic text-5xl sm:text-6xl font-normal text-white leading-none tracking-tight mb-3">
                    The Craft of Sound
                  </h3>
                  <p className="text-xs text-white/80 max-w-xs mx-auto leading-relaxed">
                    Interactive audio interfaces, spatial haptics, and vinyl
                    listening session at the d.school atrium.
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/15">
                  <div className="flex items-center gap-2 text-xs text-white/85">
                    <span className="material-symbols-outlined text-[16px] text-secondary-container">
                      local_cafe
                    </span>
                    <span>d.school Atrium • 18 Spots Left</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleRsvp(
                        "craft_of_sound",
                        "The Craft of Sound — Spotify Design Salon",
                        "OCT 28, 2025 • 6:30 PM",
                        "d.school Atrium • Studio 2"
                      )
                    }
                    className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center group-hover:scale-110 transition-transform shadow-md cursor-pointer"
                    title="Reserve Spot & Open Pass"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_outward
                    </span>
                  </button>
                </div>
              </TiltedCard>
            )}

            {/* CARD 3: Wide Horizontal Banner Card (Spans 12 cols) */}
            {(selectedFilter === "All Campus" ||
              selectedFilter === "Sports & Wellness" ||
              selectedFilter === "Design & Culture") && (
              <div className="lg:col-span-12 luma-card group relative rounded-[2rem] overflow-hidden bg-on-surface min-h-[280px] flex flex-col md:flex-row items-stretch justify-between shadow-lg border border-outline-variant/20">
                <div className="relative w-full md:w-7/12 min-h-[240px] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80"
                    alt="Campus Food Truck & Night Market"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent md:to-[#131b2e]" />
                  <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-amber-950">
                        Campus Festival
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/50 backdrop-blur-md text-white">
                        12 Local Vendors
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="font-host-display text-4xl sm:text-5xl font-black tracking-tighter text-white uppercase leading-none drop-shadow-sm">
                        CAMPUS LIVE
                      </h3>
                      <p className="font-editorial italic text-2xl text-secondary-container mt-1">
                        Autumn Night Market & Indie Soundstage
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-5/12 bg-[#131b2e] p-8 flex flex-col justify-between text-white">
                  <div>
                    <div className="flex items-center justify-between text-xs text-secondary-container font-mono mb-3">
                      <span>FRIDAY, NOV 02 • 5:00 PM</span>
                      <span className="px-2 py-0.5 rounded bg-secondary-container/15 text-secondary-container text-[10px]">
                        FREE ENTRY
                      </span>
                    </div>
                    <h4 className="text-xl font-bold font-headline mb-2">
                      Food Truck Fest & Student Bands on Main Quad
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed mb-6">
                      Featuring artisanal ramen, Korean street toast, boba
                      flights, and 4 student indie bands under the festival
                      lights. Use your CampusHub Fast-Pass for 15% off vendor
                      combos.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-xs text-white/80">
                      <span className="font-bold text-white">420+</span>{" "}
                      students going
                    </div>
                    <Link
                      href="/events"
                      className="bg-secondary-container hover:bg-primary-fixed text-on-secondary-fixed font-headline font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <span>Claim Food Pass</span>
                      <span className="material-symbols-outlined text-[16px]">
                        qr_code_2
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* CARD 4 & 5: Two Compact Split Poster Cards (6 cols each) */}
            {(selectedFilter === "All Campus" ||
              selectedFilter === "Tech & AI") && (
              <SpotlightCard className="lg:col-span-6 luma-card group relative rounded-[1.75rem] overflow-hidden bg-surface-container-lowest border border-outline-variant/40 p-6 flex flex-col sm:flex-row gap-6 items-center shadow-xs">
                <div className="relative w-full sm:w-48 h-48 rounded-2xl overflow-hidden shrink-0 bg-on-surface">
                  <img
                    src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80"
                    alt="Startup Pitch Night"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-container">
                      Seed Grant
                    </span>
                    <span className="font-host-display text-xl font-black text-white leading-tight uppercase">
                      50K VC PITCH NIGHT
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between h-full w-full">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                        Entrepreneurship Society
                      </span>
                      <span className="text-[11px] font-mono text-outline">
                        NOV 06
                      </span>
                    </div>
                    <h4 className="text-lg font-extrabold font-headline text-on-surface mb-1.5 group-hover:text-primary transition-colors">
                      Founder Demo Day & Micro-Grant Finals
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                      8 student startups pitch Sequoia & Pear VC partners for
                      equity-free prototype grants.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/25">
                    <span className="text-[11px] font-medium text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        location_on
                      </span>
                      GSB Knight Center
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        toggleRsvp(
                          "vc_pitch",
                          "50K VC Pitch Night & Founder Demo Day",
                          "NOV 06, 2025 • 7:00 PM",
                          "GSB Knight Management Center"
                        )
                      }
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {rsvpSet["vc_pitch"] ? "Registered ✓" : "Register"}{" "}
                      <span className="material-symbols-outlined text-[14px]">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            )}

            {(selectedFilter === "All Campus" ||
              selectedFilter === "Study Jams" ||
              selectedFilter === "Tech & AI") && (
              <SpotlightCard className="lg:col-span-6 luma-card group relative rounded-[1.75rem] overflow-hidden bg-surface-container-lowest border border-outline-variant/40 p-6 flex flex-col sm:flex-row gap-6 items-center shadow-xs">
                <div className="relative w-full sm:w-48 h-48 rounded-2xl overflow-hidden shrink-0 bg-on-surface">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80"
                    alt="Late Night Study Jam"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-container">
                      Flash Study Room
                    </span>
                    <span className="font-editorial italic text-2xl text-white leading-tight">
                      CS 229 Final Prep
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between h-full w-full">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">
                          bolt
                        </span>
                        AI Copilot Suggested
                      </span>
                      <span className="text-[11px] font-mono text-outline">
                        TONIGHT • 8 PM
                      </span>
                    </div>
                    <h4 className="text-lg font-extrabold font-headline text-on-surface mb-1.5 group-hover:text-primary transition-colors">
                      Machine Learning Problem Set & Matcha Jam
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                      Matches your 8:00 PM free block. 6 peers from your CS
                      section are already checked in.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/25">
                    <span className="text-[11px] font-medium text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        meeting_room
                      </span>
                      Green Library • Room 402
                    </span>
                    <Link
                      href="/copilot"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Join Table{" "}
                      <span className="material-symbols-outlined text-[14px]">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>
              </SpotlightCard>
            )}
          </AnimatedContent>
        </section>
      )}

      {/* 3. SIMPLIFIED CAMPUS STOREFRONT SHOWCASE (3-CARD GRID) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-1.5 font-label">
              <span className="material-symbols-outlined text-[16px]">
                shopping_bag
              </span>
              Campus Store • Smart Locker Pickup
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
              Official University{" "}
              <span className="font-editorial italic font-normal text-on-surface-variant">
                Gear
              </span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-on-surface transition-colors py-2 px-4 rounded-full bg-surface-container-low hover:bg-secondary-container/50"
          >
            Browse All 48 Items
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>

        <AnimatedContent
          distance={60}
          direction="vertical"
          duration={0.8}
          ease="power3.out"
          stagger={0.08}
          threshold={0.1}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {storeItems.map((item) => {
            const isAdded = addedProdId === item.id;
            return (
              <SpotlightCard
                key={item.id}
                className="group bg-surface-container-lowest rounded-[1.75rem] border border-outline-variant/40 p-4 flex flex-col justify-between hover:shadow-xl transition-all"
              >
                <Link
                  href={`/shop/${item.id}`}
                  className="relative h-64 rounded-2xl bg-surface-container-low overflow-hidden mb-4 flex items-center justify-center block"
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-lowest/90 backdrop-blur-md text-on-surface shadow-2xs">
                    {item.organization.badge}
                  </span>
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-secondary-container text-on-secondary-fixed">
                    {item.dispatchNote || "Locker #B-12 Ready"}
                  </span>
                </Link>
                <div className="px-2 pb-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link
                      href={`/shop/${item.id}`}
                      className="text-base font-extrabold font-headline text-on-surface group-hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                    <span className="text-base font-extrabold text-primary font-money">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-4 line-clamp-1">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/25">
                    <span className="text-[11px] text-outline font-medium">
                      {item.sizes
                        ? `Sizes: ${item.sizes.join(" • ")}`
                        : item.batchDrop}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickAddMerch(item.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                        isAdded
                          ? "bg-secondary-container text-on-secondary-fixed"
                          : "bg-on-surface text-surface hover:bg-primary"
                      }`}
                      title="Quick Add to Bag"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isAdded ? "check" : "add_shopping_cart"}
                      </span>
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </AnimatedContent>
      </section>

      {/* 4. INTELLIGENT CAMPUS SYNC BANNER (COMPACT BENTO) */}
      <AnimatedContent
        distance={60}
        direction="vertical"
        duration={0.8}
        ease="power3.out"
        threshold={0.1}
        className="relative z-10 max-w-7xl mx-auto px-6"
      >
        <SpotlightCard
          spotlightColor="rgba(193, 238, 120, 0.16)"
          className="rounded-[2.25rem] bg-gradient-to-br from-[#131b2e] via-[#1c263d] to-[#233115] p-8 sm:p-12 text-white shadow-2xl overflow-hidden relative flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          <div className="max-w-xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-secondary-container text-[11px] font-bold uppercase tracking-widest mb-4">
              <span className="material-symbols-outlined text-[14px]">
                auto_awesome
              </span>
              React Bits + AI Schedule Sync
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight leading-tight mb-3">
              Never miss a club drop or{" "}
              <span className="font-editorial italic font-normal text-secondary-container">
                free hour
              </span>{" "}
              again.
            </h3>
            <p className="text-sm text-white/75 leading-relaxed mb-6">
              Connect your university Registrar & Canvas calendar. CampusHub
              automatically surfaces events, study rooms, and smart locker
              pickups that fit cleanly between your lectures.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/copilot"
                className="bg-secondary-container hover:bg-primary-fixed text-on-secondary-fixed font-headline font-bold text-xs px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg"
              >
                <span>Launch AI Copilot</span>
                <span className="material-symbols-outlined text-[16px]">
                  bolt
                </span>
              </Link>
              <Link
                href="/organizer"
                className="bg-white/10 hover:bg-white/15 text-white border border-white/20 font-headline font-semibold text-xs px-5 py-3.5 rounded-xl transition-all"
              >
                Host an Event in Studio
              </Link>
            </div>
          </div>

          {/* Live Telemetry Mini Bento with React Bits CountUp */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto min-w-[300px] relative z-10">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-container block mb-1">
                Active Orgs
              </span>
              <span className="text-2xl font-extrabold font-headline">
                <CountUp to={184} suffix="+" />
              </span>
              <span className="text-[11px] text-white/60 block mt-0.5">
                Verified student clubs
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-container block mb-1">
                Smart Lockers
              </span>
              <span className="text-2xl font-extrabold font-headline">
                24/7
              </span>
              <span className="text-[11px] text-white/60 block mt-0.5">
                Union & Quad hubs
              </span>
            </div>
            <div className="col-span-2 p-4 rounded-2xl bg-secondary-container/15 backdrop-blur-md border border-secondary-container/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-container block">
                  Your Next Free Window
                </span>
                <span className="text-sm font-bold text-white">
                  Today, 2:30 PM – 4:30 PM
                </span>
              </div>
              <Link
                href="/copilot"
                className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-extrabold hover:scale-105 transition-transform"
              >
                3 Matches
              </Link>
            </div>
          </div>
        </SpotlightCard>
      </AnimatedContent>
      </div>

      <FastPassModal
        isOpen={Boolean(activePassEvent)}
        onClose={() => setActivePassEvent(null)}
        title={activePassEvent?.title}
        subtitle={activePassEvent?.subtitle}
        location={activePassEvent?.location}
      />
    </main>
  );
}
