"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useBag } from "@/context/BagContext";
import { MOCK_STUDENT_ORDERS } from "@/data/mockData";
import {
  SpotlightCard,
  CountUp,
  FastPassModal,
  AnimatedContent,
  Lanyard,
  GlideSelect,
} from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";

const VERIFIED_BADGES = [
  {
    id: "badge_ieee",
    title: "IEEE Autonomous Systems & Robotics Fellow",
    issuer: "Stanford Department of Electrical Engineering",
    date: "Oct 2025",
    hash: "0x88F4...29A1",
    icon: "precision_manufacturing",
  },
  {
    id: "badge_treehacks",
    title: "TreeHacks '25 1st Place — Best Edge AI Agent",
    issuer: "Stanford ACM & Venture Partners",
    date: "Feb 2025",
    hash: "0x41C9...77B0",
    icon: "emoji_events",
  },
  {
    id: "badge_dschool",
    title: "Design Systems & Spatial Haptics Lead",
    issuer: "Hasso Plattner Institute of Design (d.school)",
    date: "May 2025",
    hash: "0x92E1...10D4",
    icon: "palette",
  },
];

const REGISTERED_EVENTS = [
  {
    id: "evt_robotics",
    title: "AI & Robotics Symposium '25",
    date: "FRI, OCT 24 • 4:00 PM",
    location: "Huang Engineering Amphitheater • Gate B",
    passCode: "SYM25-STU882194",
    role: "VIP Keynote + Demo Presenter",
  },
  {
    id: "evt_neon5k",
    title: "Campus Neon Fun Run 5K & Wellness Fest",
    date: "SAT, NOV 08 • 6:30 PM",
    location: "Main Quad Archway • Wave B (Bib #1042)",
    passCode: "NEON5K-BIB1042",
    role: "Plan B: Tech Tee + Medal + Acai Bowl",
  },
];

function createSvgDataUri(svgString: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export default function StudentProfilePage() {
  const { orders } = useBag();
  const displayOrders = orders.length > 0 ? orders : MOCK_STUDENT_ORDERS;

  const [lockerUnlocked, setLockerUnlocked] = useState(false);
  const [cardFinish, setCardFinish] = useState<
    "holographic" | "glossy" | "metallic" | "matte"
  >("holographic");
  const [activePassModal, setActivePassModal] = useState<{
    title: string;
    subtitle: string;
    passCode: string;
    location: string;
  } | null>(null);

  const lanyardTextures = useMemo(() => {
    const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="900" viewBox="0 0 640 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#131b2e"/>
          <stop offset="55%" stop-color="#1c2740"/>
          <stop offset="100%" stop-color="#283814"/>
        </linearGradient>
        <linearGradient id="lime" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#c1ee78"/>
          <stop offset="100%" stop-color="#a5d15f"/>
        </linearGradient>
      </defs>
      <rect width="640" height="900" fill="url(#bg)"/>
      <circle cx="540" cy="140" r="180" fill="#c1ee78" opacity="0.1"/>
      <circle cx="90" cy="780" r="210" fill="#4b671b" opacity="0.22"/>
      <!-- Header Band -->
      <rect x="44" y="100" width="552" height="54" rx="27" fill="#ffffff" fill-opacity="0.08" stroke="#c1ee78" stroke-opacity="0.35"/>
      <circle cx="80" cy="127" r="9" fill="#c1ee78"/>
      <text x="104" y="134" fill="#c1ee78" font-family="sans-serif" font-size="20" font-weight="800" letter-spacing="3">STANFORD • CAMPUSHUB ID</text>
      <text x="564" y="134" fill="#ffffff" font-family="monospace" font-size="18" font-weight="700" text-anchor="end">25/26</text>

      <!-- Avatar Medallion -->
      <rect x="48" y="195" width="168" height="168" rx="36" fill="url(#lime)"/>
      <rect x="56" y="203" width="152" height="152" rx="30" fill="#131b2e"/>
      <text x="132" y="298" fill="#c1ee78" font-family="sans-serif" font-size="64" font-weight="900" text-anchor="middle">AR</text>

      <!-- Verified Pill -->
      <rect x="242" y="205" width="240" height="38" rx="19" fill="#c1ee78"/>
      <text x="362" y="230" fill="#121f00" font-family="sans-serif" font-size="17" font-weight="900" letter-spacing="2" text-anchor="middle">VERIFIED SCHOLAR</text>

      <text x="242" y="292" fill="#ffffff" font-family="sans-serif" font-size="44" font-weight="900">Alex Rivera</text>
      <text x="242" y="330" fill="#c1ee78" font-family="monospace" font-size="24" font-weight="700">#STU-882194</text>
      <text x="242" y="362" fill="#cbd5e1" font-family="sans-serif" font-size="19" font-weight="600">Class of 2027 • Dean's Honors</text>

      <!-- Divider -->
      <line x1="48" y1="406" x2="592" y2="406" stroke="#ffffff" stroke-opacity="0.16" stroke-width="2"/>

      <!-- Academic Metadata Grid -->
      <rect x="48" y="434" width="544" height="110" rx="24" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.14"/>
      <text x="76" y="472" fill="#94a3b8" font-family="monospace" font-size="16" font-weight="700" letter-spacing="2">FACULTY &amp; MAJOR</text>
      <text x="76" y="512" fill="#ffffff" font-family="sans-serif" font-size="25" font-weight="800">B.S. Computer Science &amp; Design</text>

      <rect x="48" y="566" width="260" height="115" rx="24" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.14"/>
      <text x="76" y="606" fill="#94a3b8" font-family="monospace" font-size="15" font-weight="700" letter-spacing="2">CUMULATIVE GPA</text>
      <text x="76" y="654" fill="#c1ee78" font-family="sans-serif" font-size="38" font-weight="900">3.92 / 4.0</text>

      <rect x="332" y="566" width="260" height="115" rx="24" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.14"/>
      <text x="360" y="606" fill="#94a3b8" font-family="monospace" font-size="15" font-weight="700" letter-spacing="2">SMART LOCKER</text>
      <text x="360" y="654" fill="#ffffff" font-family="monospace" font-size="34" font-weight="900">HUB #B-04</text>

      <!-- Bottom Dynamic QR Pass Strip -->
      <rect x="48" y="714" width="544" height="134" rx="28" fill="#c1ee78"/>
      <text x="82" y="766" fill="#121f00" font-family="sans-serif" font-size="24" font-weight="900" letter-spacing="1">CAMPUSHUB DYNAMIC QR PASS</text>
      <text x="82" y="802" fill="#283c00" font-family="monospace" font-size="18" font-weight="700">IEEE LAB BAY 3 • UNION LOCKER • EVENTS</text>
      <text x="82" y="828" fill="#121f00" font-family="monospace" font-size="15" font-weight="700">CLICK CARD TO FLIP FOR ATTENDANT QR →</text>
      <circle cx="532" cy="781" r="36" fill="#131b2e"/>
      <text x="532" y="790" fill="#c1ee78" font-family="monospace" font-size="22" font-weight="900" text-anchor="middle">QR</text>
    </svg>`;

    const backSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="900" viewBox="0 0 640 900">
      <rect width="640" height="900" fill="#faf8ff"/>
      <rect x="0" y="0" width="640" height="150" fill="#131b2e"/>
      <text x="320" y="112" fill="#c1ee78" font-family="sans-serif" font-size="24" font-weight="900" letter-spacing="3" text-anchor="middle">OPTICAL GATE &amp; ATTENDANT PASS</text>

      <!-- QR Code Frame -->
      <rect x="140" y="195" width="360" height="360" rx="36" fill="#ffffff" stroke="#4b671b" stroke-width="6"/>
      <rect x="180" y="235" width="84" height="84" rx="12" fill="none" stroke="#131b2e" stroke-width="14"/>
      <rect x="204" y="259" width="36" height="36" rx="4" fill="#4b671b"/>
      <rect x="376" y="235" width="84" height="84" rx="12" fill="none" stroke="#131b2e" stroke-width="14"/>
      <rect x="400" y="259" width="36" height="36" rx="4" fill="#4b671b"/>
      <rect x="180" y="431" width="84" height="84" rx="12" fill="none" stroke="#131b2e" stroke-width="14"/>
      <rect x="204" y="455" width="36" height="36" rx="4" fill="#4b671b"/>
      <!-- Center Matrix Dots -->
      <rect x="292" y="245" width="24" height="24" fill="#131b2e"/>
      <rect x="328" y="245" width="24" height="56" fill="#131b2e"/>
      <rect x="292" y="295" width="58" height="24" fill="#4b671b"/>
      <rect x="190" y="345" width="56" height="24" fill="#131b2e"/>
      <rect x="268" y="345" width="96" height="44" rx="8" fill="#131b2e"/>
      <rect x="386" y="345" width="66" height="28" fill="#4b671b"/>
      <rect x="292" y="412" width="36" height="68" fill="#131b2e"/>
      <rect x="348" y="432" width="104" height="28" fill="#131b2e"/>
      <rect x="358" y="478" width="64" height="34" fill="#4b671b"/>

      <text x="320" y="608" fill="#131b2e" font-family="monospace" font-size="28" font-weight="900" letter-spacing="4" text-anchor="middle">CH-8821-94A-QR</text>
      <text x="320" y="644" fill="#4b671b" font-family="sans-serif" font-size="20" font-weight="800" text-anchor="middle">CAMPUSHUB DUAL-MODE PROTOCOL: 0x88F4...29A1</text>

      <rect x="56" y="688" width="528" height="156" rx="28" fill="#131b2e"/>
      <text x="320" y="738" fill="#c1ee78" font-family="monospace" font-size="20" font-weight="800" text-anchor="middle">TRESIDDER UNION LOCKER #B-04 • PIN 8492</text>
      <text x="320" y="776" fill="#ffffff" font-family="sans-serif" font-size="18" text-anchor="middle">Property of Stanford University Registrar &amp; ASSU.</text>
      <text x="320" y="810" fill="#94a3b8" font-family="monospace" font-size="16" text-anchor="middle">24/7 Campus Security Dispatch: (650) 723-9633</text>
    </svg>`;

    const strapSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="160" viewBox="0 0 800 160">
      <rect width="800" height="160" fill="#131b2e"/>
      <rect x="0" y="10" width="800" height="10" fill="#c1ee78"/>
      <rect x="0" y="140" width="800" height="10" fill="#c1ee78"/>
      <text x="400" y="94" fill="#ffffff" font-family="sans-serif" font-size="40" font-weight="900" letter-spacing="10" text-anchor="middle">CAMPUSHUB • STANFORD</text>
    </svg>`;

    return {
      front: createSvgDataUri(frontSvg),
      back: createSvgDataUri(backSvg),
      strap: createSvgDataUri(strapSvg),
    };
  }, []);

  return (
    <main className="relative pt-24 pb-24 max-w-7xl mx-auto px-6 space-y-10">
      {/* 1. STUDENT PROFILE HERO (Request 2 compliant: promo badge removed) */}
      <PageHero
        titleLead="Alex Rivera —"
        titleHighlight="Verified Scholar"
        titleTrail="& Credentials."
        description="Stanford University • B.S. Computer Science & Interaction Design • Class of 2027. Your 3D Student ID is suspended directly from the top ceiling below with live physics, instant Smart Locker access, and on-chain verified credentials."
        stats={[
          {
            label: "Autumn Load",
            value: (
              <>
                <CountUp to={18} /> Units •{" "}
                <CountUp to={3.92} decimals={2} /> GPA
              </>
            ),
            sublabel: "Dean's Honors Standing",
            icon: "workspace_premium",
          },
          {
            label: "Smart Locker #B-04",
            value: "PIN: 8492 Ready",
            sublabel: "Tresidder Union Hub A",
            icon: "lock_clock",
            accent: true,
          },
        ]}
      />

      {/* 2. CENTERPIECE: 3D UNBOXED LANYARD HERO (Request 4 compliant) */}
      <section className="relative w-full -mt-2 mb-8 flex flex-col items-center">
        {/* Physical Top Ceiling Mount & Lanyard Connector Clamp */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="w-24 h-3.5 bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800 rounded-b-lg border-x border-b border-neutral-500/60 shadow-lg flex items-center justify-center">
            <div className="w-10 h-1 bg-primary/80 rounded-full" />
          </div>
          <div className="w-8 h-2.5 bg-neutral-700 rounded-b-sm border-x border-b border-neutral-600 flex items-center justify-center">
            <div className="w-3 h-1 rounded-full bg-neutral-900 border border-neutral-500" />
          </div>
        </div>

        {/* Unboxed 3D Physics Canvas — Suspended from top */}
        <div className="relative w-full max-w-3xl h-[520px] sm:h-[580px] -mt-1 flex items-center justify-center">
          <Lanyard
            frontImage={lanyardTextures.front}
            backImage={lanyardTextures.back}
            strapImage={lanyardTextures.strap}
            finish={cardFinish}
            orientation="portrait"
            cornerRadius={0.25}
            size={0.68}
            strapLength={0.46}
            strapColor="#131b2e"
            metal="silver"
            breeze={0.3}
            interactive
            intro
          />
        </div>

        {/* Lanyard HUD & Action Control Capsule */}
        <div className="relative z-10 -mt-6 p-2 rounded-2xl glass-pill flex flex-wrap items-center justify-center gap-3 shadow-lg border border-outline-variant/40 max-w-2xl w-full">
          <div className="flex items-center gap-2 pl-2">
            <span className="material-symbols-outlined text-primary text-base">
              pan_tool_alt
            </span>
            <span className="text-xs font-semibold text-on-surface truncate">
              Drag to swing • Click card to flip
            </span>
          </div>

          <div className="h-4 w-px bg-outline-variant/40 hidden sm:block" />

          {/* Card Finish Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-outline uppercase font-bold">
              Finish:
            </span>
            <GlideSelect
              options={[
                { value: "holographic", label: "Holographic", tag: "Foil" },
                { value: "glossy", label: "Glossy Coat", tag: "Clear" },
                { value: "metallic", label: "Brushed Metal", tag: "Anodized" },
                { value: "matte", label: "Matte Finish", tag: "Satin" },
              ]}
              value={cardFinish}
              onChange={(val) =>
                setCardFinish(
                  val as "holographic" | "glossy" | "metallic" | "matte"
                )
              }
              ariaLabel="Card finish"
              size="sm"
              menuWidth={180}
              surfaceColor="#1e2942"
              highlightColor="#4b671b"
              textColor="#faf8ff"
              accentColor="#c1ee78"
            />
          </div>

          <div className="h-4 w-px bg-outline-variant/40 hidden sm:block" />

          {/* Quick Trigger for 2D Dynamic QR Pass */}
          <button
            type="button"
            onClick={() =>
              setActivePassModal({
                title: "Alex Rivera — Stanford Student ID",
                subtitle: "#STU-882194 • B.S. CS & Design",
                passCode: "CH-8821-94A-QR",
                location: "All Campus Gates & Union Locker #B-04",
              })
            }
            className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
            <span>Show QR Pass</span>
          </button>
        </div>
      </section>

      {/* 3. MAIN BALANCED PROFILE CONTENT GRID */}
      <AnimatedContent
        distance={40}
        direction="vertical"
        duration={0.8}
        ease="power3.out"
        stagger={0.08}
        threshold={0.1}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* LEFT 6 COLS: Blockchain Credentials & Registered Events */}
        <div className="lg:col-span-6 space-y-8">
          {/* Blockchain Verified Credentials */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                  Cryptographic Registrar Ledger
                </span>
                <h2 className="text-xl font-extrabold font-headline text-on-surface">
                  Verified Credentials &amp; Badges (3)
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-fixed text-[10px] font-mono font-bold">
                ON-CHAIN VERIFIED
              </span>
            </div>

            <div className="space-y-3">
              {VERIFIED_BADGES.map((b) => (
                <SpotlightCard
                  key={b.id}
                  className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">
                        {b.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold font-headline text-on-surface">
                        {b.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        {b.issuer} • {b.date}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-mono text-[10px] text-primary font-bold shrink-0">
                    {b.hash}
                  </span>
                </SpotlightCard>
              ))}
            </div>
          </div>

          {/* Active Club Memberships */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold font-headline text-on-surface">
                Active Club Memberships &amp; Roles
              </h2>
              <Link
                href="/events"
                className="text-xs font-bold text-primary hover:underline"
              >
                Events Calendar →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-extrabold uppercase font-mono">
                  Officer • Lab Access
                </span>
                <h3 className="text-sm font-extrabold font-headline text-on-surface pt-1">
                  Robotics &amp; AI Society (IEEE)
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Autonomous Quadruped Lead • Packard 108
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-extrabold uppercase font-mono">
                  Active Member
                </span>
                <h3 className="text-sm font-extrabold font-headline text-on-surface pt-1">
                  Stanford UX &amp; Design
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Design Systems Mentor • d.school Studio 2
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 6 COLS: Registered Events, Smart Locker & Co-Op Orders */}
        <div className="lg:col-span-6 space-y-8">
          {/* Registered Events & Fast-Pass Tickets */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                  Dynamic QR Entry
                </span>
                <h2 className="text-xl font-extrabold font-headline text-on-surface">
                  Registered Events &amp; Passes
                </h2>
              </div>
              <Link
                href="/events"
                className="text-xs font-bold text-primary hover:underline font-mono"
              >
                + Browse Events
              </Link>
            </div>

            <div className="space-y-3.5">
              {REGISTERED_EVENTS.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-primary uppercase">
                      {ev.date}
                    </span>
                    <h3 className="text-base font-extrabold font-headline text-on-surface">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      {ev.location} •{" "}
                      <strong className="text-on-surface">{ev.role}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePassModal({
                        title: ev.title,
                        subtitle: ev.date,
                        passCode: ev.passCode,
                        location: ev.location,
                      })
                    }
                    className="px-4 py-2.5 rounded-xl bg-on-surface hover:bg-primary text-surface font-headline font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      qr_code_2
                    </span>
                    <span>Show Pass</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Smart Locker #B-04 Remote Unlock Card */}
          <SpotlightCard
            spotlightColor="rgba(193, 238, 120, 0.22)"
            className="rounded-[2.25rem] bg-[#131b2e] text-white p-6 sm:p-8 shadow-xl space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-container block">
                  Tresidder Union Hub A
                </span>
                <h2 className="text-2xl font-extrabold font-headline mt-0.5">
                  Smart Locker #B-04
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-mono text-xs font-extrabold">
                PIN: 8492
              </span>
            </div>

            <p className="text-xs text-white/75 leading-relaxed">
              Your Campus Store package (
              <strong className="text-white">
                {displayOrders[0]?.items[0]?.name ||
                  "Heavyweight Archival Hoodie"}
              </strong>
              ) is waiting in Compartment #B-04.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLockerUnlocked((v) => !v)}
                className={`flex-1 py-3.5 px-4 rounded-xl font-headline font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  lockerUnlocked
                    ? "bg-emerald-400 text-emerald-950"
                    : "bg-secondary-container hover:bg-primary-fixed text-on-secondary-fixed"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {lockerUnlocked ? "lock_open" : "qr_code_scanner"}
                </span>
                <span>
                  {lockerUnlocked
                    ? "Compartment #B-04 Unlocked!"
                    : "Tap to Open Locker #B-04"}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setActivePassModal({
                    title: "Smart Locker #B-04 Unlock Pass",
                    subtitle: "PIN: 8492 • Tresidder Union Hub A",
                    passCode: "LOCKER-B04-8492",
                    location: "Tresidder Ground Floor Concourse West",
                  })
                }
                className="p-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Show Locker QR"
              >
                <span className="material-symbols-outlined text-[18px]">
                  qr_code_2
                </span>
              </button>
            </div>
          </SpotlightCard>

          {/* Recent Store Orders History */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold font-headline text-on-surface">
                Campus Store Orders ({displayOrders.length})
              </h3>
              <Link
                href="/shop"
                className="text-xs font-bold text-primary hover:underline"
              >
                Store →
              </Link>
            </div>

            <div className="space-y-3">
              {displayOrders.slice(0, 3).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-primary">
                      {ord.orderNumber}
                    </p>
                    <p className="font-bold text-on-surface truncate">
                      {ord.items.map((i) => i.name).join(", ")}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      ${ord.total.toFixed(2)} •{" "}
                      {ord.status.replace(/_/g, " ").toUpperCase()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePassModal({
                        title: `Order ${ord.orderNumber} Pass`,
                        subtitle: `Paid $${ord.total.toFixed(2)} • ${
                          ord.paypalOrderId
                        }`,
                        passCode: ord.pickupPassCode || "LOCKER-B04-8492",
                        location:
                          ord.fulfillmentLocation || "Tresidder Union Hub A",
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-bold text-on-surface hover:text-primary shrink-0 cursor-pointer"
                  >
                    Receipt
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedContent>

      <FastPassModal
        isOpen={Boolean(activePassModal)}
        onClose={() => setActivePassModal(null)}
        title={activePassModal?.title}
        subtitle={activePassModal?.subtitle}
        passCode={activePassModal?.passCode}
        location={activePassModal?.location}
      />
    </main>
  );
}
