"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useBag } from "@/context/BagContext";
import { MOCK_STUDENT_ORDERS } from "@/data/mockData";
import {
  SpotlightCard,
  BlurText,
  FastPassModal,
  AnimatedContent,
  Lanyard,
} from "@/components/ui/react-bits";

type AccountTab =
  | "events"
  | "academics"
  | "lockers"
  | "orders"
  | "badges"
  | "clearances"
  | "settings"
  | "id_spec";

const VERIFIED_BADGES = [
  {
    id: "badge_ieee",
    title: "IEEE Autonomous Systems & Robotics Fellow",
    issuer: "Stanford Department of Electrical Engineering",
    date: "Oct 2025",
    hash: "0x88F4...29A1",
    icon: "precision_manufacturing",
    description:
      "Awarded for research in low-latency spatial localization and quadrupedal robot kinematics under Professor Marco Pavone.",
  },
  {
    id: "badge_treehacks",
    title: "TreeHacks '25 1st Place — Best Edge AI Agent",
    issuer: "Stanford ACM & Venture Partners",
    date: "Feb 2025",
    hash: "0x41C9...77B0",
    icon: "emoji_events",
    description:
      "Engineered an on-device multi-modal sensory copilot running locally on Jetson Orin with sub-50ms latency.",
  },
  {
    id: "badge_dschool",
    title: "Design Systems & Spatial Haptics Lead",
    issuer: "Hasso Plattner Institute of Design (d.school)",
    date: "May 2025",
    hash: "0x92E1...10D4",
    icon: "palette",
    description:
      "Led student cohort in designing next-generation tactile physical interfaces and spatial audio feedback for mixed-reality.",
  },
  {
    id: "badge_bases",
    title: "BASES Silicon Valley Innovation Fellow",
    issuer: "Business Association of Stanford Entrepreneurial Students",
    date: "Dec 2024",
    hash: "0x19B8...33F2",
    icon: "rocket_launch",
    description:
      "Venture incubator cohort fellow working on agentic commerce micro-transactions and autonomous university logistics.",
  },
];

const REGISTERED_EVENTS = [
  {
    id: "evt_robotics",
    title: "AI & Robotics Symposium '25",
    date: "FRI, OCT 24 • 4:00 PM",
    time: "4:00 PM – 7:30 PM PST",
    location: "Huang Engineering Amphitheater • Gate B",
    passCode: "SYM25-STU882194",
    role: "VIP Keynote + Demo Presenter",
    status: "Confirmed RSVP",
    badgeColor: "bg-secondary-container text-on-secondary-fixed",
  },
  {
    id: "evt_neon5k",
    title: "Neon 5K Campus Fun Run & Night Lights",
    date: "SAT, NOV 08 • 6:30 PM",
    time: "6:30 PM – 9:00 PM PST",
    location: "Main Quad Archway • Wave B (Bib #1042)",
    passCode: "NEON5K-BIB1042",
    role: "Plan B: Tech Tee + Medal + Acai Bowl",
    status: "Bib Assigned",
    badgeColor: "bg-primary/15 text-primary",
  },
];

const ACADEMIC_COURSES = [
  {
    code: "CS 106X",
    name: "Accelerated Data Structures & Systems Programming",
    units: 4,
    grade: "A+",
    gpa: 4.3,
    instructor: "Keith Schwarz",
    term: "Autumn 2024",
  },
  {
    code: "CS 110",
    name: "Principles of Computer Systems & Multiprocessing",
    units: 4,
    grade: "A",
    gpa: 4.0,
    instructor: "Nick Troccoli",
    term: "Winter 2025",
  },
  {
    code: "CS 147",
    name: "Introduction to Human-Computer Interaction Design",
    units: 4,
    grade: "A+",
    gpa: 4.3,
    instructor: "James Landay",
    term: "Spring 2025",
  },
  {
    code: "EE 180",
    name: "Digital Systems Architecture & FPGA Acceleration",
    units: 4,
    grade: "A",
    gpa: 4.0,
    instructor: "Mark Horowitz",
    term: "Autumn 2025",
  },
  {
    code: "DES 201",
    name: "Tangible Interfaces & Spatial Haptics Studio",
    units: 2,
    grade: "Pass",
    gpa: 4.0,
    instructor: "d.school Studio Faculty",
    term: "Winter 2026",
  },
];

const LAB_CLEARANCES = [
  {
    id: "clear_robotics",
    name: "Robotics & AI Society (IEEE Lab)",
    building: "Packard Electrical Engineering • Bay 3",
    role: "Officer & Lab Safety Steward",
    access: "24/7 RFID Keycard & Turnstile",
    equipment: "Kuka Arm, ROS2 Edge Compute, Stereocams",
    status: "Active",
  },
  {
    id: "clear_dschool",
    name: "Hasso Plattner d.school Studio 2",
    building: "Building 550 • Studio Floor",
    role: "Studio Lead",
    access: "Extended Hours (6:00 AM – Midnight)",
    equipment: "Laser Cutters, 5-Axis CNC, Formlabs 3D Resin",
    status: "Active",
  },
  {
    id: "clear_gates",
    name: "Gates Computer Science AI Research Bay",
    building: "Gates CS Building • 5th Floor Lab B",
    role: "Undergraduate Researcher",
    access: "Standard Research Clearance (8:00 AM – 11:00 PM)",
    equipment: "NVIDIA H100 GPU Cluster, Robotics Rig",
    status: "Active",
  },
];

function createSvgDataUri(svgString: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export default function StudentProfilePage() {
  const { orders } = useBag();
  const displayOrders = orders.length > 0 ? orders : MOCK_STUDENT_ORDERS;

  const [activeTab, setActiveTab] = useState<AccountTab>("events");
  const [lockerUnlocked, setLockerUnlocked] = useState(false);
  const [activePassModal, setActivePassModal] = useState<{
    title: string;
    subtitle: string;
    passCode: string;
    location: string;
  } | null>(null);

  // Settings states
  const [autoNfcTurnstile, setAutoNfcTurnstile] = useState(true);
  const [biometricLocker, setBiometricLocker] = useState(true);
  const [qrRollingInterval, setQrRollingInterval] = useState<30 | 60>(30);

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

  const navMenuItems: {
    id: AccountTab;
    label: string;
    icon: string;
    tag?: string;
    badgeCount?: number | string;
  }[] = [
    {
      id: "events",
      label: "Registered Events",
      icon: "confirmation_number",
      badgeCount: REGISTERED_EVENTS.length,
    },
    {
      id: "academics",
      label: "Academic Ledger & GPA",
      icon: "school",
      tag: "3.92 GPA",
    },
    {
      id: "lockers",
      label: "Smart Locker #B-04",
      icon: "lock",
      tag: lockerUnlocked ? "Unlocked" : "PIN 8492",
    },
    {
      id: "orders",
      label: "Co-Op Store Orders",
      icon: "shopping_bag",
      badgeCount: displayOrders.length,
    },
    {
      id: "badges",
      label: "Verified Fellowships",
      icon: "verified",
      badgeCount: VERIFIED_BADGES.length,
    },
    {
      id: "clearances",
      label: "Lab & Studio Access",
      icon: "meeting_room",
      badgeCount: LAB_CLEARANCES.length,
    },
    {
      id: "id_spec",
      label: "Digital ID & NFC Protocols",
      icon: "badge",
      tag: "Active",
    },
    {
      id: "settings",
      label: "Pass & Access Settings",
      icon: "shield",
      tag: autoNfcTurnstile ? "NFC On" : "Manual",
    },
  ];

  return (
    <main className="relative pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* =====================================================================
       * 1. TOP HERO: 3D LANYARD SUSPENDED FROM TOP OF PAGE (NO BLACK BOX)
       * The lanyard hangs cleanly from the top ceiling anchor with open air,
       * natural background and fixed satin matte finish.
       * ===================================================================== */}
      <section className="relative border-b border-outline-variant/25 pb-8 mb-10 pt-24 sm:pt-28">
        {/* Soft Ambient Glow Orb */}
        <div className="pointer-events-none absolute top-0 right-0 w-full lg:w-1/2 h-[560px] overflow-hidden -z-10">
          <div className="w-full h-full bg-gradient-to-b from-secondary-container/25 via-primary-fixed/15 to-transparent rounded-full blur-[110px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left 6 Columns: Student Profile & Action Controls */}
          <AnimatedContent
            trigger="mount"
            distance={24}
            direction="vertical"
            duration={0.6}
            className="lg:col-span-6 space-y-6 pt-2"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-bold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Stanford University • Registrar Verified Scholar</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-extrabold tracking-tight text-on-surface font-headline leading-[1.08]">
                <BlurText text="Alex Rivera —" delayStepMs={35} />{" "}
                <span className="font-editorial italic font-normal text-primary px-0.5">
                  Verified Scholar
                </span>{" "}
                <BlurText text="& Student Console." delayStepMs={45} />
              </h1>

              <p className="text-sm text-on-surface-variant leading-relaxed max-w-xl">
                B.S. Computer Science &amp; Interaction Design • Class of 2027 •
                Dean&apos;s Honors. Your interactive 3D Student ID is suspended
                live from the top of the page with physical spring dynamics and
                fixed satin matte finish.
              </p>
            </div>

            {/* Metric Ledger Bar */}
            <div className="grid grid-cols-3 divide-x divide-outline-variant/30 py-3.5 border-y border-outline-variant/25">
              <div className="pr-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">
                  INSTITUTIONAL ID
                </span>
                <span className="font-mono text-sm sm:text-base font-extrabold text-on-surface mt-0.5 block">
                  #STU-882194
                </span>
              </div>
              <div className="px-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">
                  CUMULATIVE GPA
                </span>
                <span className="font-money text-sm sm:text-base font-extrabold text-primary mt-0.5 block">
                  3.92 / 4.00
                </span>
              </div>
              <div className="pl-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">
                  SMART LOCKER
                </span>
                <span className="font-mono text-sm sm:text-base font-extrabold text-on-surface mt-0.5 block">
                  #B-04{" "}
                  <span className="text-[11px] text-primary font-bold">
                    PIN 8492
                  </span>
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
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
                className="py-3 px-5 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">
                  qr_code_2
                </span>
                <span>Open Dynamic 2D Fast-Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setLockerUnlocked((v) => !v)}
                className={`py-3 px-4 rounded-2xl font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  lockerUnlocked
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                    : "bg-surface-container-low hover:bg-surface-container border-outline-variant/35 text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {lockerUnlocked ? "lock_open" : "lock_clock"}
                </span>
                <span>
                  {lockerUnlocked ? "Locker #B-04 Open" : "Unlock Locker #B-04"}
                </span>
              </button>
            </div>
          </AnimatedContent>

          {/* Right 6 Columns: 3D Lanyard Suspended in Open Air (NO BLACK BOX) */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            {/* Physical Ceiling Anchor Clasp connected flush to the top edge */}
            <div className="relative z-20 flex flex-col items-center pointer-events-none">
              <div className="w-20 h-3 bg-gradient-to-r from-[#131b2e] via-[#283814] to-[#131b2e] rounded-b-lg border-x border-b border-primary/40 shadow-md flex items-center justify-center">
                <div className="w-8 h-1 bg-[#c1ee78] rounded-full" />
              </div>
              <div className="w-6 h-2.5 bg-[#131b2e] rounded-b-sm border-x border-b border-outline-variant/40" />
            </div>

            {/* Unboxed 3D Lanyard Canvas in Open Air */}
            <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[620px] -mt-2 flex items-center justify-center overflow-visible">
              <Lanyard
                frontImage={lanyardTextures.front}
                backImage={lanyardTextures.back}
                strapImage={lanyardTextures.strap}
                finish="matte"
                orientation="portrait"
                cornerRadius={0.25}
                size={0.68}
                strapLength={0.46}
                strapColor="#131b2e"
                metal="silver"
                breeze={0.28}
                interactive
                intro
                className="w-full h-full"
              />
            </div>

            {/* Subtle Gesture Control Pill */}
            <div className="relative z-10 -mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/35 shadow-2xs text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[15px] text-primary">
                pan_tool_alt
              </span>
              <span>
                Drag card to swing •{" "}
                <strong className="text-on-surface">Click card to flip</strong>{" "}
                for Attendant Pass
              </span>
              <span className="text-outline/60">•</span>
              <span className="font-mono text-primary font-bold text-[10px]">
                MATTE FINISH
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
       * 2. MAIN WORKSPACE WITH SIDEBAR MENU SELECTION
       * Neatly organizes all student features into an easy-to-use console.
       * ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ===================================================================
         * LEFT SIDEBAR MENU (lg:col-span-3)
         * =================================================================== */}
        <aside className="lg:col-span-3 sticky top-24 z-10 space-y-4">
          <div className="p-3 sm:p-4 rounded-3xl bg-surface-container-lowest border border-outline-variant/35 shadow-2xs space-y-1">
            <div className="px-3 py-2 mb-1 flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-outline font-extrabold">
                Console Navigation
              </span>
              <span className="text-[10px] font-mono text-primary font-bold">
                8 MODULES
              </span>
            </div>

            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
              {navMenuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full py-2.5 px-3 rounded-2xl text-left text-xs font-headline font-bold transition-all flex items-center justify-between gap-3 shrink-0 lg:shrink cursor-pointer ${
                      isActive
                        ? "bg-[#131b2e] text-[#c1ee78] shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`material-symbols-outlined text-[19px] shrink-0 ${
                          isActive ? "text-[#c1ee78]" : "text-outline"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.tag && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? "bg-[#c1ee78]/20 text-[#c1ee78] font-extrabold"
                            : "bg-surface-container text-on-surface-variant font-medium"
                        }`}
                      >
                        {item.tag}
                      </span>
                    )}

                    {typeof item.badgeCount !== "undefined" && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? "bg-[#c1ee78] text-[#121f00] font-extrabold"
                            : "bg-surface-container-high text-on-surface font-bold"
                        }`}
                      >
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Support & Dispatch Card */}
          <div className="hidden lg:block p-4 rounded-3xl bg-surface-container-lowest border border-outline-variant/35 shadow-2xs space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-primary font-bold text-[11px] font-mono uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">
                local_police
              </span>
              <span>Campus Security Dispatch</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              24/7 Gate Lockout &amp; Turnstile Assistance:
              <strong className="block text-on-surface font-mono font-bold mt-0.5">
                (650) 723-9633
              </strong>
            </p>
            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
              <span className="text-outline">Registrar Token</span>
              <span className="font-mono text-primary font-bold">0x88F4...29A1</span>
            </div>
          </div>
        </aside>

        {/* ===================================================================
         * RIGHT CONTENT AREA (lg:col-span-9)
         * =================================================================== */}
        <div className="lg:col-span-9 min-w-0 space-y-6">
          {/* =================================================================
           * TAB 1: REGISTERED EVENTS & PASSES
           * ================================================================= */}
          {activeTab === "events" && (
            <AnimatedContent
              trigger="mount"
              distance={20}
              direction="vertical"
              duration={0.4}
              className="space-y-5"
            >
              <div className="p-6 sm:p-7 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/35 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                      Confirmed Schedules &amp; Turnstile Passes
                    </span>
                    <h2 className="text-2xl font-extrabold font-headline text-on-surface mt-0.5">
                      Registered Campus Events ({REGISTERED_EVENTS.length})
                    </h2>
                  </div>
                  <Link
                    href="/events"
                    className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-primary transition-colors self-start sm:self-auto flex items-center gap-1"
                  >
                    <span>Browse All Events</span>
                    <span>→</span>
                  </Link>
                </div>

                <div className="space-y-4">
                  {REGISTERED_EVENTS.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-5 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 hover:border-primary/40 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-extrabold text-primary uppercase tracking-wider">
                              {ev.date}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${ev.badgeColor}`}
                            >
                              {ev.status}
                            </span>
                          </div>
                          <h3 className="text-lg font-extrabold font-headline text-on-surface">
                            {ev.title}
                          </h3>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-outline">
                              schedule
                            </span>
                            <span>{ev.time}</span>
                          </p>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-outline">
                              location_on
                            </span>
                            <span>{ev.location}</span>
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                          <span className="px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-mono text-xs font-bold text-on-surface">
                            {ev.passCode}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-on-surface-variant">
                          Tier / Privilege:{" "}
                          <strong className="text-on-surface font-semibold">
                            {ev.role}
                          </strong>
                        </span>

                        <div className="flex items-center gap-2">
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
                            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              qr_code_2
                            </span>
                            <span>Show Fast-Pass QR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedContent>
          )}

          {/* =================================================================
           * TAB 2: ACADEMIC LEDGER & GPA RECORD
           * ================================================================= */}
          {activeTab === "academics" && (
            <AnimatedContent
              trigger="mount"
              distance={20}
              direction="vertical"
              duration={0.4}
              className="space-y-6"
            >
              {/* GPA Headline Stat Card */}
              <div className="p-6 sm:p-7 rounded-[2rem] bg-gradient-to-br from-surface-container-lowest via-surface-container-lowest to-secondary-container/15 border border-outline-variant/35 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/25">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-outline font-bold block">
                      Cumulative Grade Point Average
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black font-money text-primary">
                        3.92
                      </span>
                      <span className="text-sm font-mono text-on-surface-variant">
                        / 4.00 Max
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-sm">
                        verified
                      </span>
                      <span>Stanford Dean&apos;s Honor List (Top 5%)</span>
                    </p>
                  </div>

                  <div className="sm:px-6 pt-4 sm:pt-0 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-outline font-bold block">
                      Quarter &amp; Units Progress
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold font-headline text-on-surface">
                        84
                      </span>
                      <span className="text-xs font-mono text-on-surface-variant">
                        / 180 Units to Degree
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden mt-2">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: "46.6%" }}
                      />
                    </div>
                  </div>

                  <div className="sm:pl-6 pt-4 sm:pt-0 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-outline font-bold block">
                      Registrar Cryptographic Hash
                    </span>
                    <p className="font-mono text-xs font-bold text-on-surface break-all">
                      0x88F4c1ee78a9B017...29A1
                    </p>
                    <span className="inline-block mt-2 px-2.5 py-1 rounded-md bg-secondary-container/60 text-on-secondary-fixed text-[10px] font-mono font-bold">
                      SEALED BY REGISTRAR
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Transcript Table */}
              <div className="p-6 sm:p-7 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/35 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                      Official Curriculum Ledger
                    </span>
                    <h3 className="text-xl font-extrabold font-headline text-on-surface mt-0.5">
                      Enrolled Courses &amp; Grade Report
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant">
                    Autumn 2024 – Winter 2026
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-outline uppercase font-mono text-[10px] tracking-wider">
                        <th className="py-3 px-3">Course Code</th>
                        <th className="py-3 px-3">Title &amp; Faculty</th>
                        <th className="py-3 px-3">Term</th>
                        <th className="py-3 px-2 text-center">Units</th>
                        <th className="py-3 px-3 text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {ACADEMIC_COURSES.map((course) => (
                        <tr
                          key={course.code}
                          className="hover:bg-surface-container-low/50 transition-colors"
                        >
                          <td className="py-3.5 px-3 font-mono font-extrabold text-primary">
                            {course.code}
                          </td>
                          <td className="py-3.5 px-3">
                            <p className="font-extrabold text-on-surface font-headline">
                              {course.name}
                            </p>
                            <p className="text-[11px] text-on-surface-variant">
                              Instructor: {course.instructor}
                            </p>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-on-surface-variant">
                            {course.term}
                          </td>
                          <td className="py-3.5 px-2 text-center font-mono font-bold text-on-surface">
                            {course.units}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <span className="px-2.5 py-1 rounded-lg bg-surface-container-high font-mono font-extrabold text-on-surface">
                              {course.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedContent>
          )}

          {/* =================================================================
           * TAB 3: SMART LOCKER DISPENSER CONSOLE
           * ================================================================= */}
          {activeTab === "lockers" && (
            <AnimatedContent
              trigger="mount"
              distance={20}
              direction="vertical"
              duration={0.4}
              className="space-y-6"
            >
              <SpotlightCard
                spotlightColor="rgba(193, 238, 120, 0.22)"
                className="rounded-[2.5rem] bg-[#131b2e] text-white p-7 sm:p-9 shadow-xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#c1ee78] block font-bold">
                      Tresidder Memorial Union Hub A • Concourse West
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-headline">
                      Smart Locker Compartment #B-04
                    </h2>
                    <p className="text-xs text-white/70 max-w-lg leading-relaxed">
                      24/7 contactless campus pickup dispenser. Tap your physical
                      student ID to turnstile NFC or trigger the remote unlock
                      command below.
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 rounded-2xl bg-white/10 border border-white/15 flex flex-col items-center shrink-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#c1ee78] font-bold">
                      ONE-TIME MASTER PIN
                    </span>
                    <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-widest mt-0.5">
                      8492
                    </span>
                  </div>
                </div>

                {/* Staged Item Info */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#c1ee78] text-[#121f00] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-2xl">
                        package_2
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#c1ee78] font-bold">
                        Staged Package Inside Compartment
                      </span>
                      <h4 className="text-sm font-extrabold font-headline text-white mt-0.5">
                        {displayOrders[0]?.items[0]?.name ||
                          "Heavyweight Archival Hoodie (Size L)"}
                      </h4>
                      <p className="text-[11px] text-white/60">
                        Order #{displayOrders[0]?.orderNumber || "ORD-2026-9921"} • Staged Today
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 font-mono text-xs font-bold self-start sm:self-auto">
                    READY FOR PICKUP
                  </span>
                </div>

                {/* Unlock Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLockerUnlocked((v) => !v)}
                    className={`w-full sm:flex-1 py-4 px-6 rounded-2xl font-headline font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg ${
                      lockerUnlocked
                        ? "bg-emerald-400 text-emerald-950 shadow-emerald-400/30"
                        : "bg-[#c1ee78] hover:bg-[#a5d15f] text-[#121f00] shadow-[#c1ee78]/25"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {lockerUnlocked ? "lock_open" : "sensors"}
                    </span>
                    <span>
                      {lockerUnlocked
                        ? "Compartment #B-04 Unlocked! [Tap to Re-lock]"
                        : "Remote Unlock Locker #B-04"}
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
                    className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      qr_code_2
                    </span>
                    <span>Show Locker QR</span>
                  </button>
                </div>
              </SpotlightCard>
            </AnimatedContent>
          )}

          {/* =================================================================
           * TAB 4: CAMPUS STORE ORDERS & RECEIPTS
           * ================================================================= */}
          {activeTab === "orders" && (
            <AnimatedContent
              trigger="mount"
              distance={20}
              direction="vertical"
              duration={0.4}
              className="space-y-5"
            >
              <div className="p-6 sm:p-7 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/35 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                      University Co-Op Purchase History
                    </span>
                    <h2 className="text-2xl font-extrabold font-headline text-on-surface mt-0.5">
                      Campus Store Orders ({displayOrders.length})
                    </h2>
                  </div>
                  <Link
                    href="/shop"
                    className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-primary transition-colors flex items-center gap-1"
                  >
                    <span>Store Catalog</span>
                    <span>→</span>
                  </Link>
                </div>

                <div className="space-y-3">
                  {displayOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/35 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-primary text-xs">
                            {ord.orderNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-mono">
                            {ord.createdAt || "Today"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold font-mono uppercase">
                            {ord.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-on-surface font-headline truncate">
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </h4>
                        <p className="text-xs text-on-surface-variant font-mono">
                          Total: ${ord.total.toFixed(2)} • Ref: {ord.paypalOrderId}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setActivePassModal({
                            title: `Order ${ord.orderNumber} Receipt Pass`,
                            subtitle: `Paid $${ord.total.toFixed(2)} • ${
                              ord.paypalOrderId
                            }`,
                            passCode: ord.pickupPassCode || "LOCKER-B04-8492",
                            location:
                              ord.fulfillmentLocation || "Tresidder Union Hub A",
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-primary hover:text-on-primary border border-outline-variant/40 font-headline font-bold text-xs text-on-surface transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          receipt_long
                        </span>
                        <span>View Pass</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedContent>
          )}

          {/* =================================================================
           * TAB 5: VERIFIED FELLOWSHIPS & BLOCKCHAIN BADGES
           * ================================================================= */}
          {activeTab === "badges" && (
            <AnimatedContent
              trigger="mount"
              distance={20}
              direction="vertical"
              duration={0.4}
              className="space-y-5"
            >
              <div className="p-6 sm:p-7 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/35 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                      Cryptographic Registrar Ledger
                    </span>
                    <h2 className="text-2xl font-extrabold font-headline text-on-surface mt-0.5">
                      Verified Credentials &amp; Honors ({VERIFIED_BADGES.length})
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-fixed text-[10px] font-mono font-bold">
                    ON-CHAIN VERIFIED
                  </span>
                </div>

                <div className="space-y-3.5">
                  {VERIFIED_BADGES.map((b) => (
                    <SpotlightCard
                      key={b.id}
                      className="p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
                            <span className="material-symbols-outlined text-2xl">
                              {b.icon}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-extrabold font-headline text-on-surface">
                              {b.title}
                            </h3>
                            <p className="text-xs text-on-surface-variant">
                              {b.issuer} • <span className="font-mono">{b.date}</span>
                            </p>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-mono text-xs text-primary font-bold self-start sm:self-auto shrink-0">
                          {b.hash}
                        </span>
                      </div>

                      <p className="text-xs text-on-surface-variant leading-relaxed pl-0 sm:pl-[62px]">
                        {b.description}
                      </p>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            </AnimatedContent>
          )}

          {/* =================================================================
           * TAB 6: LAB & STUDIO CLEARANCES
           * ================================================================= */}
          {activeTab === "clearances" && (
            <AnimatedContent
              trigger="mount"
              distance={20}
              direction="vertical"
              duration={0.4}
              className="space-y-5"
            >
              <div className="p-6 sm:p-7 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/35 shadow-2xs space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                    Building, Lab &amp; Prototyping Studios
                  </span>
                  <h2 className="text-2xl font-extrabold font-headline text-on-surface mt-0.5">
                    Authorized Studio Clearances ({LAB_CLEARANCES.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {LAB_CLEARANCES.map((lab) => (
                    <div
                      key={lab.id}
                      className="p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold font-headline text-on-surface">
                              {lab.name}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold font-mono uppercase">
                              {lab.status}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {lab.building}
                          </p>
                        </div>

                        <span className="px-3 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-mono text-xs text-primary font-bold self-start sm:self-auto">
                          {lab.role}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-outline-variant/20">
                        <div>
                          <span className="text-outline text-[11px] block">
                            Keycard Access Level:
                          </span>
                          <strong className="text-on-surface">{lab.access}</strong>
                        </div>
                        <div>
                          <span className="text-outline text-[11px] block">
                            Authorized Equipment:
                          </span>
                          <strong className="text-on-surface">
                            {lab.equipment}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedContent>
          )}

          {/* =================================================================
           * TAB 7: DIGITAL ID & OPTICAL SPECIFICATIONS
           * ================================================================= */}
          {activeTab === "id_spec" && (
            <AnimatedContent
              trigger="mount"
              distance={20}
              direction="vertical"
              duration={0.4}
              className="space-y-5"
            >
              <div className="p-6 sm:p-7 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/35 shadow-2xs space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                    Cryptographic ID &amp; Physical Specifications
                  </span>
                  <h2 className="text-2xl font-extrabold font-headline text-on-surface mt-0.5">
                    Student ID &amp; Turnstile Protocols
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SpotlightCard className="p-5 rounded-3xl bg-surface-container-low/70 border border-outline-variant/35 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                        Institutional Identity
                      </span>
                      <span className="text-[10px] font-mono font-bold text-on-surface-variant">
                        ACTIVE • 2025/2026
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-on-surface-variant">
                      <div className="flex justify-between py-1 border-b border-outline-variant/20">
                        <span>Full Legal Name</span>
                        <strong className="text-on-surface">Alex Rivera</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-outline-variant/20">
                        <span>Student ID Number</span>
                        <strong className="font-mono text-primary">#STU-882194</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-outline-variant/20">
                        <span>Degree Program</span>
                        <strong className="text-on-surface">B.S. CS &amp; Design</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-outline-variant/20">
                        <span>Registrar Expiry</span>
                        <strong className="text-on-surface">June 15, 2027</strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Academic Status</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Dean&apos;s Honor Roll (3.92 GPA)
                        </strong>
                      </div>
                    </div>
                  </SpotlightCard>

                  <SpotlightCard className="p-5 rounded-3xl bg-surface-container-low/70 border border-outline-variant/35 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                        Optical &amp; RFID Protocols
                      </span>
                      <span className="text-[10px] font-mono font-bold text-secondary">
                        DUAL-LAYER READY
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-on-surface-variant">
                      <div className="flex justify-between py-1 border-b border-outline-variant/20">
                        <span>Turnstile NFC Protocol</span>
                        <strong className="font-mono text-on-surface">ISO/IEC 14443 Type A</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-outline-variant/20">
                        <span>Dynamic QR Interval</span>
                        <strong className="font-mono text-primary">30s Rolling Token</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-outline-variant/20">
                        <span>On-Chain Cryptographic Proof</span>
                        <strong className="font-mono text-on-surface">0x88F4...29A1</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-outline-variant/20">
                        <span>Physical Finish Spec</span>
                        <strong className="text-on-surface">Non-Glare Matte Satin</strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Attendant Verification</span>
                        <strong className="text-primary font-bold">
                          Click card at top of page to flip
                        </strong>
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              </div>
            </AnimatedContent>
          )}

          {/* =================================================================
           * TAB 8: TURNSTILE & ACCESS SETTINGS
           * ================================================================= */}
          {activeTab === "settings" && (
            <AnimatedContent
              trigger="mount"
              distance={20}
              direction="vertical"
              duration={0.4}
              className="space-y-5"
            >
              <div className="p-6 sm:p-7 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/35 shadow-2xs space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                    Hardware, NFC &amp; Turnstile Preferences
                  </span>
                  <h2 className="text-2xl font-extrabold font-headline text-on-surface mt-0.5">
                    Pass &amp; Access Controls
                  </h2>
                </div>

                <div className="space-y-4 divide-y divide-outline-variant/20 text-xs">
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5 max-w-md">
                      <p className="font-extrabold text-sm font-headline text-on-surface">
                        Automatic NFC Transmission
                      </p>
                      <p className="text-on-surface-variant">
                        Broadcast optical student pass token automatically when
                        approaching campus turnstiles and library gates.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoNfcTurnstile((v) => !v)}
                      className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                        autoNfcTurnstile ? "bg-primary" : "bg-surface-container-high"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                          autoNfcTurnstile ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-0.5 max-w-md">
                      <p className="font-extrabold text-sm font-headline text-on-surface">
                        Biometric Confirmation for Smart Lockers
                      </p>
                      <p className="text-on-surface-variant">
                        Require FaceID or TouchID before sending remote unlock
                        signals to Tresidder Union Hub A.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBiometricLocker((v) => !v)}
                      className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                        biometricLocker ? "bg-primary" : "bg-surface-container-high"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                          biometricLocker ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-0.5 max-w-md">
                      <p className="font-extrabold text-sm font-headline text-on-surface">
                        Rolling QR Refresh Rate
                      </p>
                      <p className="text-on-surface-variant">
                        Duration before dynamic pass cryptographically regenerates
                        to prevent screenshot fraud.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container-low border border-outline-variant/30">
                      <button
                        type="button"
                        onClick={() => setQrRollingInterval(30)}
                        className={`py-1 px-3 rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
                          qrRollingInterval === 30
                            ? "bg-primary text-on-primary"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        30s
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrRollingInterval(60)}
                        className={`py-1 px-3 rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
                          qrRollingInterval === 60
                            ? "bg-primary text-on-primary"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        60s
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedContent>
          )}
        </div>
      </div>

      {/* =====================================================================
       * 3. 2D FAST-PASS QR MODAL
       * ===================================================================== */}
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

