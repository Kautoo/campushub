"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SpotlightCard,
  CountUp,
  FastPassModal,
  AnimatedContent,
} from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";

interface CampusVenue {
  id: string;
  name: string;
  shortLabel: string;
  category:
    | "Smart Lockers"
    | "Event Venues"
    | "Study Jams"
    | "Makerspaces"
    | "Dining & Cafés";
  badge: string;
  statusMetric: string;
  description: string;
  walkTime: string;
  buildingCode: string;
  coords: { x: string; y: string };
  ctaLabel: string;
  icon: string;
}

const VENUES: CampusVenue[] = [
  {
    id: "tresidder_union",
    name: "Tresidder Student Union — Hub A",
    shortLabel: "Union Lockers #B",
    category: "Smart Lockers",
    badge: "14 / 48 Lockers Free",
    statusMetric: "Locker #B-04 Ready (PIN 8492)",
    description:
      "24/7 automated Smart Locker bank on Ground Concourse West. Your Archival Hoodie order is ready in Compartment #B-04.",
    walkTime: "3 min walk (240m)",
    buildingCode: "BLDG 04-550",
    coords: { x: "32%", y: "54%" },
    ctaLabel: "Unlock Locker #B-04",
    icon: "lock_clock",
  },
  {
    id: "huang_engineering",
    name: "Huang Engineering Amphitheater",
    shortLabel: "Robotics '25",
    category: "Event Venues",
    badge: "Live Now • 142 Attending",
    statusMetric: "AI & Robotics Symposium '25",
    description:
      "Octagonal subterranean engineering forum hosting live quadruped robot demonstrations, keynote panels, and IEEE recruiting.",
    walkTime: "5 min walk (410m)",
    buildingCode: "SEQ-475",
    coords: { x: "58%", y: "34%" },
    ctaLabel: "Open Event Fast-Pass",
    icon: "precision_manufacturing",
  },
  {
    id: "green_library",
    name: "Green Library — 4F Quiet Commons",
    shortLabel: "Green Lib 4F",
    category: "Study Jams",
    badge: "38 dB Whisper Quiet",
    statusMetric: "68% Seating Available • 6 CS Peers",
    description:
      "High-ceiling reading room with dual USB-C desk power, acoustic dampening panels, and live CS 229 problem set study tables.",
    walkTime: "4 min walk (310m)",
    buildingCode: "LIB-557",
    coords: { x: "46%", y: "48%" },
    ctaLabel: "Reserve Study Seat",
    icon: "menu_book",
  },
  {
    id: "packard_makerspace",
    name: "Packard Prototyping & Robotics Bay",
    shortLabel: "Maker Lab Bay 3",
    category: "Makerspaces",
    badge: "8 Prusa / Bambu Bays Free",
    statusMetric: "Soldering & Laser Cutters Online",
    description:
      "Student-run hardware fabrication lab stocked with Bambu X1C printers, oscilloscope benches, and carbon-fiber curing ovens.",
    walkTime: "6 min walk (490m)",
    buildingCode: "PACK-104",
    coords: { x: "72%", y: "28%" },
    ctaLabel: "Check Lab Telemetry",
    icon: "memory",
  },
  {
    id: "coupa_cafe",
    name: "Coupa Café — Green Library Kiosk",
    shortLabel: "Coupa Café",
    category: "Dining & Cafés",
    badge: "3 Min Mobile Wait",
    statusMetric: "10% Student ID Discount Active",
    description:
      "Outdoor patio espresso bar serving Venezuelan iced matcha, Venezuelan Empanadas, and late-night cold brew during midterms.",
    walkTime: "4 min walk (290m)",
    buildingCode: "CAFE-02",
    coords: { x: "41%", y: "66%" },
    ctaLabel: "Claim 10% Coffee Pass",
    icon: "local_cafe",
  },
];

const CATEGORIES = [
  "All Venues",
  "Smart Lockers",
  "Event Venues",
  "Study Jams",
  "Makerspaces",
  "Dining & Cafés",
] as const;

export default function CampusMapPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Venues");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenueId, setSelectedVenueId] =
    useState<string>("tresidder_union");
  const [showShuttle, setShowShuttle] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fastPassModalOpen, setFastPassModalOpen] = useState(false);

  const filteredVenues = VENUES.filter((v) => {
    if (selectedCategory !== "All Venues" && v.category !== selectedCategory) {
      return false;
    }
    if (
      searchQuery.trim() &&
      !v.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !v.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const activeVenue =
    VENUES.find((v) => v.id === selectedVenueId) || VENUES[0];

  return (
    <main className="relative pt-28 pb-20 max-w-7xl mx-auto px-6">
      {/* 1. UNIFIED TOP TELEMETRY & HERO BAR */}
      <PageHero
        badge="Live Spatial Telemetry • Marguerite Shuttle GPS"
        badgeSubtext="Shuttle Line X • 2m"
        titleLead="Interactive Campus"
        titleHighlight="Grounds & Venues"
        titleTrail="in real time."
        description="Locate 24/7 Smart Locker banks, whisper-quiet library study commons, makerspaces, and flagship event amphitheaters across campus."
        stats={[
          {
            label: "Campus Occupancy",
            value: (
              <>
                <CountUp to={14820} /> Active
              </>
            ),
            sublabel: "Live Wi-Fi & Gate Telemetry",
            icon: "groups",
          },
          {
            label: "Smart Lockers",
            value: "94% Available",
            sublabel: "Union Hub A (#B-04 Ready)",
            icon: "lock_clock",
            accent: true,
          },
        ]}
      />

      {/* 2. FILTER & SEARCH BAR */}
      <section className="mb-6">
        <div className="glass-pill rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={
                    active
                      ? "px-3.5 py-2 rounded-xl text-xs font-bold bg-on-surface text-surface shadow-xs shrink-0 cursor-pointer"
                      : "px-3.5 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all shrink-0 cursor-pointer"
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find building, locker, or study room..."
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low/80 rounded-xl text-xs text-on-surface placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </section>

      {/* 3. SPLIT WORKSPACE: VENUE FEED (4 COLS) + INTERACTIVE SVG MAP (8 COLS) */}
      <AnimatedContent
        distance={60}
        direction="vertical"
        duration={0.8}
        ease="power3.out"
        stagger={0.08}
        threshold={0.1}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Left 4 Cols: Venue Feed */}
        <div className="lg:col-span-4 space-y-3.5 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredVenues.map((venue) => {
            const active = venue.id === selectedVenueId;
            return (
              <SpotlightCard
                key={venue.id}
                onClick={() => setSelectedVenueId(venue.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                  active
                    ? "bg-surface-container-lowest border-primary ring-2 ring-primary/20 shadow-md"
                    : "bg-surface-container-lowest/80 border-outline-variant/40 hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-extrabold uppercase tracking-wider">
                    {venue.category}
                  </span>
                  <span className="text-[11px] font-mono text-outline">
                    {venue.buildingCode}
                  </span>
                </div>
                <h3 className="text-base font-extrabold font-headline text-on-surface mb-1">
                  {venue.name}
                </h3>
                <p className="text-xs font-semibold text-primary mb-2">
                  {venue.statusMetric}
                </p>
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">
                  {venue.description}
                </p>
                <div className="pt-2.5 border-t border-outline-variant/25 flex items-center justify-between text-[11px]">
                  <span className="text-outline flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      directions_walk
                    </span>
                    {venue.walkTime}
                  </span>
                  <span className="font-bold text-primary">
                    {venue.badge} →
                  </span>
                </div>
              </SpotlightCard>
            );
          })}
        </div>

        {/* Right 8 Cols: Interactive SVG Campus Map Canvas */}
        <div className="lg:col-span-8 relative h-[640px] rounded-[2.25rem] bg-[#eef1e6] border border-outline-variant/50 shadow-xl overflow-hidden select-none">
          {/* Map Vector Roads, Quad Lawns & Buildings */}
          <div
            className="w-full h-full transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg
              viewBox="0 0 1000 700"
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Campus Grounds & Botanical Quads */}
              <rect width="1000" height="700" fill="#eef2e6" />
              <circle cx="480" cy="340" r="240" fill="#dfe8ce" opacity="0.7" />
              <rect
                x="140"
                y="120"
                width="260"
                height="180"
                rx="28"
                fill="#d4e0be"
              />
              <rect
                x="560"
                y="140"
                width="300"
                height="220"
                rx="32"
                fill="#d4e0be"
              />
              <rect
                x="240"
                y="420"
                width="420"
                height="190"
                rx="30"
                fill="#dbe6c6"
              />

              {/* Pedestrian & Bike Boulevards */}
              <path
                d="M 80 350 Q 480 350 920 350"
                stroke="#ffffff"
                strokeWidth="18"
                fill="none"
              />
              <path
                d="M 480 60 L 480 650"
                stroke="#ffffff"
                strokeWidth="18"
                fill="none"
              />
              <path
                d="M 220 140 Q 480 340 780 540"
                stroke="#ffffff"
                strokeWidth="12"
                fill="none"
              />

              {/* Live Marguerite Shuttle Route Dashed Line */}
              {showShuttle && (
                <path
                  d="M 140 520 C 320 520, 400 220, 680 220 C 820 220, 860 440, 880 540"
                  stroke="#4b671b"
                  strokeWidth="4"
                  strokeDasharray="10 8"
                  fill="none"
                />
              )}

              {/* Crowd Heatmap Circles */}
              {showHeatmap && (
                <>
                  <circle
                    cx="580"
                    cy="240"
                    r="85"
                    fill="#c1ee78"
                    opacity="0.45"
                  />
                  <circle
                    cx="320"
                    cy="380"
                    r="70"
                    fill="#c1ee78"
                    opacity="0.35"
                  />
                  <circle
                    cx="460"
                    cy="340"
                    r="60"
                    fill="#83a350"
                    opacity="0.25"
                  />
                </>
              )}

              {/* Architectural Building Footprints */}
              <rect
                x="270"
                y="340"
                width="110"
                height="75"
                rx="14"
                fill="#c7cdb8"
                stroke="#75796a"
                strokeWidth="2"
              />
              <rect
                x="530"
                y="190"
                width="120"
                height="85"
                rx="16"
                fill="#c7cdb8"
                stroke="#75796a"
                strokeWidth="2"
              />
              <rect
                x="415"
                y="300"
                width="95"
                height="70"
                rx="12"
                fill="#c7cdb8"
                stroke="#75796a"
                strokeWidth="2"
              />
              <rect
                x="675"
                y="155"
                width="110"
                height="75"
                rx="14"
                fill="#c7cdb8"
                stroke="#75796a"
                strokeWidth="2"
              />
              <rect
                x="365"
                y="435"
                width="85"
                height="60"
                rx="12"
                fill="#c7cdb8"
                stroke="#75796a"
                strokeWidth="2"
              />
            </svg>

            {/* Interactive Pin Markers */}
            {VENUES.map((venue) => {
              const isSelected = venue.id === selectedVenueId;
              return (
                <button
                  key={venue.id}
                  type="button"
                  onClick={() => setSelectedVenueId(venue.id)}
                  style={{ left: venue.coords.x, top: venue.coords.y }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer z-20 ${
                    isSelected ? "scale-110 z-30" : "hover:scale-105"
                  }`}
                >
                  <div
                    className={`px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border ${
                      isSelected
                        ? "bg-on-surface text-secondary-container border-secondary-container ring-4 ring-secondary-container/40"
                        : "bg-surface-container-lowest text-on-surface border-outline-variant/60"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {venue.icon}
                    </span>
                    <span className="text-xs font-extrabold font-headline whitespace-nowrap">
                      {venue.shortLabel}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Live Shuttle Pill */}
            {showShuttle && (
              <div
                style={{ left: "51%", top: "21%" }}
                className="absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-mono font-bold shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[13px]">
                  directions_bus
                </span>
                Shuttle Line X • 2m
              </div>
            )}
          </div>

          {/* Top-Right Layer & Zoom Controls */}
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
            <div className="glass-pill rounded-2xl p-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowHeatmap((v) => !v)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  showHeatmap
                    ? "bg-primary text-white"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                Crowd Heatmap
              </button>
              <button
                type="button"
                onClick={() => setShowShuttle((v) => !v)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  showShuttle
                    ? "bg-primary text-white"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                Shuttle GPS
              </button>
            </div>

            <div className="self-end glass-pill rounded-2xl p-1.5 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
                className="w-8 h-8 rounded-xl hover:bg-surface-container-low flex items-center justify-center font-bold text-on-surface cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
                className="w-8 h-8 rounded-xl hover:bg-surface-container-low flex items-center justify-center font-bold text-on-surface cursor-pointer"
                title="Zoom Out"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="w-8 h-8 rounded-xl hover:bg-surface-container-low flex items-center justify-center text-on-surface cursor-pointer"
                title="Reset View"
              >
                <span className="material-symbols-outlined text-[16px]">
                  my_location
                </span>
              </button>
            </div>
          </div>

          {/* Bottom-Left Selected Venue Detail Overlay Card */}
          <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:w-[430px] z-30 glass-pill rounded-3xl p-5 shadow-2xl border border-outline-variant/50">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block">
                  {activeVenue.category} • {activeVenue.buildingCode}
                </span>
                <h3 className="text-lg font-extrabold font-headline text-on-surface">
                  {activeVenue.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-extrabold shrink-0">
                {activeVenue.walkTime}
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              {activeVenue.description}
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setFastPassModalOpen(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  qr_code_2
                </span>
                <span>{activeVenue.ctaLabel}</span>
              </button>
              <Link
                href="/copilot"
                className="py-2.5 px-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs transition-colors"
              >
                Sync Route
              </Link>
            </div>
          </div>
        </div>
      </AnimatedContent>

      <FastPassModal
        isOpen={fastPassModalOpen}
        onClose={() => setFastPassModalOpen(false)}
        title={activeVenue.name}
        subtitle={`${activeVenue.buildingCode} • ${activeVenue.statusMetric}`}
        passCode="CAMPUS-NFC-882194"
        location={activeVenue.walkTime}
        badgeLabel="SPATIAL ACCESS FAST-PASS"
      />
    </main>
  );
}

