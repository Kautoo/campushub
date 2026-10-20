"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SpotlightCard,
  TiltedCard,
  FastPassModal,
  AnimatedContent,
  GlideSelect,
} from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";

const CATEGORIES = [
  {
    id: "5k_timed",
    title: "5K Neon Timed Run",
    subtitle: "RFID timing chip, LED glow kit & finisher tech tee",
    priceLabel: "FREE",
    priceSub: "Student Union Sponsored",
    price: 0,
    corralDefault: "Wave A — Competitive (<22m)",
  },
  {
    id: "3k_walk",
    title: "3K Casual Social Walk",
    subtitle: "Untimed scenic campus loop + post-run matcha lounge",
    priceLabel: "FREE",
    priceSub: "Open to All Cohorts",
    price: 0,
    corralDefault: "Wave C — Social & Friends",
  },
  {
    id: "vip_charity",
    title: "VIP Charity Pacer Pack",
    subtitle: "Front-corral start, exclusive hoodie & $15 club grant",
    priceLabel: "$15.00",
    priceSub: "100% to Student Wellness Fund",
    price: 15,
    corralDefault: "VIP Corral 01 — Front Line",
  },
] as const;

const TEE_SIZES = ["XS", "S", "M", "L", "XL", "2XL"] as const;

export default function EventRegistrationPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("5k_timed");
  const [bibName, setBibName] = useState("ALEX RIVERA");
  const [selectedWave, setSelectedWave] = useState(
    "Wave B — Intermediate (22–30 min)"
  );
  const [teeSize, setTeeSize] = useState<string>("M");
  const [pickupHub, setPickupHub] = useState(
    "Student Union Hub A (Lockers #B-01 to #B-48)"
  );
  const [emergencyName, setEmergencyName] = useState("Elena Rivera");
  const [emergencyPhone, setEmergencyPhone] = useState("(650) 555-0194");
  const [waiverAccepted, setWaiverAccepted] = useState(true);
  const [passIssued, setPassIssued] = useState(false);

  const activeCat =
    CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];

  const handleConfirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setPassIssued(true);
  };

  return (
    <main className="relative pt-28 pb-24 max-w-7xl mx-auto px-6">
      {/* 1. UNIFIED EVENT HERO HEADER */}
      <PageHero
        badge="Athletics & Wellness Fest • Nov 8, 2025"
        badgeSubtext="184 Spots Remaining"
        badgeHref="/map"
        titleLead="Register for Campus"
        titleHighlight="Neon Fun Run 5K"
        titleTrail="& Wellness Fest."
        description="Saturday, Nov 8 • 6:30 PM Start at Main Quad Archway → Lake Lagunita Loop. Customize your runner bib, select your start wave, and claim your instant NFC/QR participant pass."
        stats={[
          {
            label: "Step 1 • Identity",
            value: "SSO Verified ✓",
            sublabel: "Alex Rivera (#STU-882194)",
            icon: "verified_user",
          },
          {
            label: "Step 2 • Race Kit",
            value: `Bib & Size ${teeSize}`,
            sublabel: "2h Union Locker Pickup",
            icon: "confirmation_number",
            accent: true,
          },
        ]}
      />

      <form
        onSubmit={handleConfirmRegistration}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* LEFT COLUMN (7 Cols): Registration Steps */}
        <AnimatedContent
          distance={60}
          direction="vertical"
          duration={0.8}
          ease="power3.out"
          stagger={0.08}
          threshold={0.1}
          className="lg:col-span-7 space-y-6"
        >
          {/* STEP 1: Verified Student Profile & Participation Category */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold font-headline text-on-surface flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-mono font-bold flex items-center justify-center">
                  1
                </span>
                Student Identity & Entry Tier
              </h2>
              <span className="px-2.5 py-1 rounded-full bg-secondary-container/60 text-on-secondary-fixed text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">
                  verified
                </span>
                Stanford SSO Active
              </span>
            </div>

            {/* Auto-Filled Student Card */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-on-surface text-secondary-container font-headline font-extrabold text-sm flex items-center justify-center">
                  AR
                </div>
                <div>
                  <p className="text-sm font-extrabold text-on-surface">
                    Alex Rivera{" "}
                    <span className="font-mono text-xs font-normal text-outline">
                      (#STU-882194)
                    </span>
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    B.S. Computer Science • Class of 2027 •
                    arivera27@stanford.edu
                  </p>
                </div>
              </div>
              <Link
                href="/account"
                className="text-xs font-bold text-primary hover:underline"
              >
                View Profile
              </Link>
            </div>

            {/* Participation Tier Radio Cards */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-outline block">
                Select Participation Category
              </label>
              <div className="grid grid-cols-1 gap-3">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        active
                          ? "border-primary bg-secondary-container/20"
                          : "border-outline-variant/40 hover:border-primary/40 bg-surface-container-lowest"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                            active ? "border-primary" : "border-outline"
                          }`}
                        >
                          {active && (
                            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold font-headline text-on-surface">
                            {cat.title}
                          </h3>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {cat.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-mono font-extrabold text-primary block">
                          {cat.priceLabel}
                        </span>
                        <span className="text-[10px] text-outline">
                          {cat.priceSub}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 2: Race Pack & Apparel Customization */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg font-extrabold font-headline text-on-surface flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-mono font-bold flex items-center justify-center">
                2
              </span>
              Race Pack & Apparel Customization
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Custom Bib Nickname (Max 14 Chars)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={bibName}
                  onChange={(e) => setBibName(e.target.value.toUpperCase())}
                  placeholder="ALEX RIVERA"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono font-bold text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Start Corral Wave
                </label>
                <GlideSelect
                  className="w-full"
                  options={[
                    {
                      value: "Wave A — Competitive (<22 min)",
                      label: "Wave A — Competitive",
                      tag: "<22m",
                    },
                    {
                      value: "Wave B — Intermediate (22–30 min)",
                      label: "Wave B — Intermediate",
                      tag: "22–30m",
                    },
                    {
                      value: "Wave C — Social & Friends",
                      label: "Wave C — Social & Friends",
                      tag: "Casual",
                    },
                  ]}
                  value={selectedWave}
                  onChange={(val) => setSelectedWave(val)}
                  ariaLabel="Start Corral Wave"
                  menuWidth={260}
                  size="lg"
                />
              </div>
            </div>

            {/* Finisher Tech Tee Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline">
                  Finisher Reflective Tech Tee Size:{" "}
                  <span className="text-primary font-mono">{teeSize}</span>
                </label>
                <span className="text-[11px] text-primary font-semibold">
                  Unisex Athletic Cut
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {TEE_SIZES.map((sz) => {
                  const active = teeSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setTeeSize(sz)}
                      className={`py-2.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        active
                          ? "bg-on-surface text-surface border-on-surface shadow-xs"
                          : "bg-surface-container-low text-on-surface border-outline-variant/30 hover:border-primary"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Locker Race-Pack Pickup */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                Pre-Race Smart Locker Kit Pickup
              </label>
              <GlideSelect
                className="w-full"
                options={[
                  {
                    value: "Student Union Hub A (Lockers #B-01 to #B-48)",
                    label: "Student Union Hub A (Lockers #B-01 to #B-48)",
                    tag: "Recommended",
                  },
                  {
                    value: "Arrillaga Athletics Pavilion Lockers (#A-01 to #A-24)",
                    label: "Arrillaga Athletics Pavilion Lockers (#A-01 to #A-24)",
                    tag: "Gym",
                  },
                  {
                    value: "Science Quad Breezeway Lockers (#S-01 to #S-24)",
                    label: "Science Quad Breezeway Lockers (#S-01 to #S-24)",
                    tag: "Quad",
                  },
                ]}
                value={pickupHub}
                onChange={(val) => setPickupHub(val)}
                ariaLabel="Pre-Race Smart Locker Kit Pickup"
                menuWidth={360}
                size="lg"
              />
            </div>
          </div>

          {/* STEP 3: Emergency Contact & Waiver */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-lg font-extrabold font-headline text-on-surface flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-mono font-bold flex items-center justify-center">
                3
              </span>
              Safety Contact & Athletics Waiver
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Emergency Phone Number
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 cursor-pointer">
              <input
                type="checkbox"
                checked={waiverAccepted}
                onChange={(e) => setWaiverAccepted(e.target.checked)}
                required
                className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="text-xs text-on-surface-variant leading-relaxed">
                I acknowledge the{" "}
                <strong className="text-on-surface">
                  University Recreation & Wellness Liability Waiver
                </strong>{" "}
                and authorize Campus Medical Response to access my verified
                student health profile in the event of an emergency.
              </span>
            </label>
          </div>
        </AnimatedContent>

        {/* RIGHT COLUMN (5 Cols): Sticky Live NFC & QR Participant Ticket Pass Preview */}
        <AnimatedContent
          distance={60}
          direction="vertical"
          duration={0.8}
          delay={0.12}
          ease="power3.out"
          className="lg:col-span-5 lg:sticky lg:top-24 space-y-6"
        >
          <TiltedCard maxTilt={3}>
            <SpotlightCard
              spotlightColor="rgba(193, 238, 120, 0.25)"
              className="rounded-[2.25rem] bg-[#131b2e] text-white p-6 sm:p-8 shadow-2xl border border-white/15 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-container block">
                    Live NFC + QR Participant Pass
                  </span>
                  <h3 className="text-xl font-extrabold font-headline tracking-tight">
                    NEON FUN RUN 5K &apos;25
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-mono text-xs font-extrabold">
                  BIB #1042
                </span>
              </div>

              {/* Bib Preview Banner */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 mb-6 text-center space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-container">
                  Official Runner Bib
                </span>
                <p className="font-host-display text-3xl font-black tracking-tight text-white uppercase">
                  {bibName || "ALEX RIVERA"}
                </p>
                <p className="text-xs font-mono text-white/75">
                  {activeCat.title} • {selectedWave.split("—")[0]}
                </p>
              </div>

              {/* Pass Telemetry Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs mb-6">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">
                    Tech Tee Size
                  </span>
                  <span className="font-mono font-bold text-secondary-container">
                    Size {teeSize} (Reserved)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">
                    Check-In Gate
                  </span>
                  <span className="font-bold text-white">
                    Main Quad Arch • 6:00 PM
                  </span>
                </div>
                <div className="col-span-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">
                    Race Kit Locker Pickup
                  </span>
                  <span className="font-semibold text-white text-[11px]">
                    {pickupHub}
                  </span>
                </div>
              </div>

              {/* Scannable QR Preview */}
              <div className="p-4 rounded-2xl bg-white text-on-surface flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-4xl text-on-surface"
                    style={{ fontVariationSettings: "'wght' 300" }}
                  >
                    qr_code_2
                  </span>
                  <div>
                    <p className="text-xs font-extrabold font-headline text-on-surface">
                      Fast-Pass Ready
                    </p>
                    <p className="text-[10px] font-mono text-outline">
                      ID: #STU-882194 • NFC Tap
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-extrabold uppercase">
                  Verified
                </span>
              </div>
            </SpotlightCard>
          </TiltedCard>

          {/* Summary & Confirm Button Card */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">
                Entry Fee ({activeCat.title})
              </span>
              <span className="font-money font-bold text-on-surface">
                {activeCat.price === 0
                  ? "$0.00 (Student Covered)"
                  : `$${activeCat.price.toFixed(2)}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">
                Reflective Finisher Tee ({teeSize}) + Glow Kit
              </span>
              <span className="font-mono font-bold text-primary">INCLUDED</span>
            </div>
            <div className="pt-3 border-t border-outline-variant/30 flex items-baseline justify-between">
              <span className="text-sm font-extrabold font-headline text-on-surface">
                Total Due
              </span>
              <span className="text-2xl font-extrabold font-money text-primary">
                ${activeCat.price.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                confirmation_number
              </span>
              <span>Confirm Registration & Issue NFC Pass</span>
            </button>
          </div>
        </AnimatedContent>
      </form>

      <FastPassModal
        isOpen={passIssued}
        onClose={() => setPassIssued(false)}
        title={`Neon 5K • Bib #1042 (${bibName || "ALEX RIVERA"})`}
        subtitle={`NOV 8, 2025 • 6:30 PM • ${selectedWave.split("—")[0]}`}
        passCode="NEON5K-BIB1042-STU882194"
        location={`${pickupHub} • Tee Size ${teeSize}`}
        badgeLabel="CONFIRMED RUNNER NFC PASS"
      />
    </main>
  );
}

