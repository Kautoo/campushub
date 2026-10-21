"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SpotlightCard,
  CountUp,
  FastPassModal,
  GlideSelect,
} from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";

type StudioTab = "overview" | "create_event" | "catalog";

interface RosterSignUp {
  id: string;
  studentName: string;
  studentId: string;
  eventOrItem: string;
  tier: string;
  status: "Checked In" | "Pass Issued";
  time: string;
}

const INITIAL_SIGNUPS: RosterSignUp[] = [
  {
    id: "REG-9041",
    studentName: "Alex Rivera",
    studentId: "#STU-882194",
    eventOrItem: "AI & Robotics Symposium '25",
    tier: "VIP Keynote + Demo",
    status: "Checked In",
    time: "4 mins ago",
  },
  {
    id: "REG-9040",
    studentName: "Maya Lin",
    studentId: "#STU-881029",
    eventOrItem: "AI & Robotics Symposium '25",
    tier: "Student General Pass",
    status: "Pass Issued",
    time: "12 mins ago",
  },
  {
    id: "REG-9039",
    studentName: "Liam Vance",
    studentId: "#STU-874410",
    eventOrItem: "Heavyweight Archival Hoodie (L)",
    tier: "Union Locker #B-12",
    status: "Pass Issued",
    time: "28 mins ago",
  },
  {
    id: "REG-9038",
    studentName: "Chloe Park",
    studentId: "#STU-890312",
    eventOrItem: "Quadruped Obstacle Trials",
    tier: "Lab Builder Pass",
    status: "Checked In",
    time: "1 hour ago",
  },
];

export default function OrganizerStudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTab>("overview");
  const [signups, setSignups] = useState<RosterSignUp[]>(INITIAL_SIGNUPS);

  // Event Creation Wizard State (Screen 069016c90eff4d6d8987088ac8762852)
  const [eventTitle, setEventTitle] = useState(
    "Autonomous Drone Swarm & Neural SLAM Workshop"
  );
  const [eventPitch, setEventPitch] = useState(
    "Hands-on flight controller tuning, onboard vision inference, and live flight cage demos at Huang Basement."
  );
  const [eventCategory, setEventCategory] = useState("Tech & AI");
  const [eventDate, setEventDate] = useState("2025-11-14");
  const [eventTime, setEventTime] = useState("17:00");
  const [eventVenue, setEventVenue] = useState(
    "Huang Engineering Amphitheater (Cap: 250)"
  );
  const [vipPrice, setVipPrice] = useState("15.00");
  const [eventPublished, setEventPublished] = useState(false);

  // AI Copy Assistant State
  const [aiTone, setAiTone] = useState<"editorial" | "technical" | "urgent">(
    "editorial"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewPassOpen, setPreviewPassOpen] = useState(false);

  const toggleSignupStatus = (id: string) => {
    setSignups((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === "Checked In" ? "Pass Issued" : "Checked In",
            }
          : s
      )
    );
  };

  const handleAiPolish = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/copy-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "campaign",
          title: eventTitle,
          rawNotes: eventPitch,
          organizationName: "Robotics & AI Society (IEEE)",
          tone: aiTone,
        }),
      });
      const data = await res.json();
      if (data.suggestion?.polishedDescription) {
        setEventPitch(data.suggestion.polishedDescription);
      }
    } catch {
      setEventPitch(
        "Hosted by the IEEE Robotics & AI Society: Join 150+ builders for live autonomous flight cage trials, onboard CUDA vision workshops, and late-night boba networking."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setEventPublished(true);
    setTimeout(() => setEventPublished(false), 3500);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      {/* 1. FIXED LEFT ORGANIZER STUDIO SIDEBAR */}
      <aside className="w-full lg:w-64 bg-[#131b2e] text-white flex flex-col justify-between shrink-0 border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">
                  school
                </span>
              </div>
              <div>
                <span className="font-headline text-lg font-extrabold tracking-tight block leading-none">
                  CampusHub
                </span>
                <span className="text-[10px] font-mono text-secondary-container uppercase tracking-widest">
                  Organizer Studio
                </span>
              </div>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("create_event")}
            className="w-full py-3 px-4 rounded-xl bg-secondary-container hover:bg-primary-fixed text-on-secondary-fixed font-headline font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            <span>+ Create Campus Event</span>
          </button>

          <nav className="space-y-1.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white/15 text-secondary-container"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                dashboard
              </span>
              <span>Overview & Telemetry</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("create_event")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === "create_event"
                  ? "bg-white/15 text-secondary-container"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                confirmation_number
              </span>
              <span>Event & Ticket Wizard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === "catalog"
                  ? "bg-white/15 text-secondary-container"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                inventory_2
              </span>
              <span>Store & Locker Queue</span>
            </button>

            <Link
              href="/clubs"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/75 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                groups
              </span>
              <span>Clubs & Rosters</span>
            </Link>

            <Link
              href="/map"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/75 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                map
              </span>
              <span>Venue Logistics</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Officer Audit Card */}
        <div className="p-6 space-y-4 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/10 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-secondary-container font-bold">
              <span className="material-symbols-outlined text-[14px]">
                verified
              </span>
              IEEE CHAPTER TREASURY
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              0.00% platform commission. PayPal Sandbox payouts settle every
              Friday at 18:00.
            </p>
          </div>

          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-white text-on-surface font-headline font-bold text-xs flex items-center justify-center gap-2 hover:bg-secondary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            <span>Back to Explore</span>
          </Link>
        </div>
      </aside>

      {/* 2. MAIN STUDIO WORKSPACE */}
      <div className="flex-1 min-w-0 pb-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-6 sm:pt-8 lg:pt-10">
          <PageHero
            titleLead={
              activeTab === "create_event" ? "Publish New" : "Organizer Studio &"
            }
            titleHighlight={
              activeTab === "create_event" ? "Campus Event" : "Live Telemetry"
            }
            titleTrail={activeTab === "create_event" ? "& Ticketing." : "Hub."}
            description={
              activeTab === "create_event"
                ? "Configure your campus poster, verify zero Registrar midterm conflicts, and issue CampusHub Dynamic QR entry passes."
                : "Real-time attendant QR gate velocity, student RSVP rosters, Smart Locker dispatches, and AI-assisted copywriting."
            }
            actions={
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewPassOpen(true)}
                  className="px-4 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container-low text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    qr_code_scanner
                  </span>
                  <span>Test Gate Scanner</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      activeTab === "create_event" ? "overview" : "create_event"
                    )
                  }
                  className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {activeTab === "create_event" ? "dashboard" : "add"}
                  </span>
                  <span>
                    {activeTab === "create_event"
                      ? "View Dashboard"
                      : "New Event Wizard"}
                  </span>
                </button>
              </div>
            }
          />
          {activeTab === "create_event" ? (
            /* ================================================================
             * VIEW 2: EVENT CREATION & TICKETING WIZARD (Screen 069016c90eff4d6d8987088ac8762852)
             * ================================================================ */
            <form
              onSubmit={handlePublishEvent}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <div className="lg:col-span-8 space-y-6">
                {/* Step 1: Event Identity & Schedule Conflict Detector */}
                <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold font-headline text-on-surface">
                      1. Event Identity & Academic Timetable Check
                    </h2>
                    <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-mono font-bold">
                      STEP 1 OF 3
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
                          {
                            value: "Design & Culture",
                            label: "Design & Culture",
                            tag: "Arts",
                          },
                          {
                            value: "Sports & Wellness",
                            label: "Sports & Wellness",
                            tag: "Active",
                          },
                          {
                            value: "Venture & Pitch",
                            label: "Venture & Pitch",
                            tag: "Startups",
                          },
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
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface"
                      />
                    </div>
                  </div>

                  {/* Campus Timetable Conflict Detector Banner */}
                  <div className="p-4 rounded-2xl bg-secondary-container/35 border border-primary/25 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        event_available
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-on-surface">
                          Registrar Timetable Sync: Zero Midterm Conflicts!
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                          94% of CS & EE undergraduates are free at {eventTime}{" "}
                          on {eventDate}.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-primary text-white font-mono text-[10px] font-bold shrink-0">
                      94% FIT
                    </span>
                  </div>
                </div>

                {/* Step 2: Campus Venue & Description */}
                <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-5">
                  <h2 className="text-lg font-extrabold font-headline text-on-surface">
                    2. Campus Venue & Editorial Pitch
                  </h2>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                      Verified University Venue
                    </label>
                    <GlideSelect
                      className="w-full"
                      options={[
                        {
                          value: "Huang Engineering Amphitheater (Cap: 250)",
                          label: "Huang Engineering Amphitheater",
                          tag: "Cap: 250",
                        },
                        {
                          value: "d.school Atrium Loft (Cap: 120)",
                          label: "d.school Atrium Loft",
                          tag: "Cap: 120",
                        },
                        {
                          value: "Main Quad Lawn Stage (Cap: 600)",
                          label: "Main Quad Lawn Stage",
                          tag: "Cap: 600",
                        },
                      ]}
                      value={eventVenue}
                      onChange={(val) => setEventVenue(val)}
                      ariaLabel="Verified University Venue"
                      menuWidth={340}
                      size="lg"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-outline">
                        Luma-Style Poster Description
                      </label>
                      <button
                        type="button"
                        onClick={handleAiPolish}
                        disabled={isGenerating}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          auto_awesome
                        </span>
                        {isGenerating
                          ? "Synthesizing..."
                          : "Polish with AI Copilot"}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={eventPitch}
                      onChange={(e) => setEventPitch(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface leading-relaxed focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Step 3: Ticket Tiers & CampusHub QR Gate Configuration */}
                <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-5">
                  <h2 className="text-lg font-extrabold font-headline text-on-surface">
                    3. Ticket Tiers &amp; Dynamic QR Attendant Gate
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1">
                      <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-fixed text-[10px] font-bold uppercase">
                        Tier 01 • Student SSO
                      </span>
                      <h3 className="text-sm font-extrabold font-headline text-on-surface pt-1">
                        Verified Student Admission
                      </h3>
                      <p className="font-mono text-sm font-bold text-primary">
                        FREE (150 Quota)
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                      <span className="px-2 py-0.5 rounded bg-on-surface text-white text-[10px] font-bold uppercase">
                        Tier 02 • Hardware Kit + Merch
                      </span>
                      <h3 className="text-sm font-extrabold font-headline text-on-surface">
                        VIP Builder Pack + Locker Pickup
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-outline">$</span>
                        <input
                          type="number"
                          value={vipPrice}
                          onChange={(e) => setVipPrice(e.target.value)}
                          className="w-24 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-mono text-xs font-bold text-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 4 Cols: AI Copilot Studio & Audience Snapshot */}
              <div className="lg:col-span-4 space-y-6">
                <SpotlightCard className="bg-[#131b2e] text-white rounded-[2rem] p-6 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-extrabold uppercase">
                      Live Poster Preview
                    </span>
                    <span className="text-xs font-mono text-secondary-container">
                      {eventDate}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold font-headline leading-tight">
                    {eventTitle}
                  </h3>
                  <p className="text-xs text-white/75 leading-relaxed">
                    {eventPitch}
                  </p>
                  <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs">
                    <span className="text-secondary-container font-medium">
                      {eventVenue.split("(")[0]}
                    </span>
                    <span className="font-mono font-bold">DYNAMIC QR</span>
                  </div>
                </SpotlightCard>

                <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 space-y-4 shadow-xs">
                  <h3 className="text-sm font-extrabold font-headline text-on-surface">
                    Estimated Campus Reach
                  </h3>
                  <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant">
                      Matched CS & Design Guilds
                    </span>
                    <span className="font-mono text-base font-extrabold text-primary">
                      2,840 Students
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      rocket_launch
                    </span>
                    <span>
                      {eventPublished
                        ? "Published to Campus Explore ✓"
                        : "Publish Event & Issue Passes"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ================================================================
             * VIEW 1: ORGANIZER STUDIO OVERVIEW (Screen 9a8600ae30944d2ebfe7f023bfb35327)
             * ================================================================ */
            <div className="space-y-8">
              {/* 4 Bento Stat Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <SpotlightCard className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-outline">
                    <span className="font-bold uppercase tracking-wider">
                      Active Registrations
                    </span>
                    <span className="material-symbols-outlined text-primary">
                      confirmation_number
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold font-headline text-on-surface">
                    <CountUp to={1420} />
                  </p>
                  <p className="text-xs text-primary font-semibold">
                    +18.4% vs Spring Quarter
                  </p>
                </SpotlightCard>

                <SpotlightCard className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-outline">
                    <span className="font-bold uppercase tracking-wider">
                      Gross Ticket & Merch
                    </span>
                    <span className="material-symbols-outlined text-secondary">
                      payments
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold font-headline text-on-surface">
                    <CountUp to={14850} prefix="$" />
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    0.00% Platform Commission
                  </p>
                </SpotlightCard>

                <SpotlightCard className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-outline">
                    <span className="font-bold uppercase tracking-wider">
                      Scheduled Events
                    </span>
                    <span className="material-symbols-outlined text-primary">
                      event
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold font-headline text-on-surface">
                    <CountUp to={4} /> Live
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Huang Center & Main Quad
                  </p>
                </SpotlightCard>

                <SpotlightCard className="p-6 rounded-3xl bg-secondary-container/35 border border-primary/25 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-primary">
                    <span className="font-bold uppercase tracking-wider">
                      Gate Check-In Rate
                    </span>
                    <span className="material-symbols-outlined text-primary">
                      qr_code_scanner
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold font-headline text-primary">
                    <CountUp to={94.2} decimals={1} suffix="%" />
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    CampusHub QR Scanners Active
                  </p>
                </SpotlightCard>
              </section>

              {/* Main 12-Col Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left 8 Cols: Hourly Gate Check-In Chart + Live Signups & Locker Handover */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Fast-Pass Hourly Gate Check-In Distribution */}
                  <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                          Live Optical &amp; Attendant Telemetry
                        </span>
                        <h2 className="text-lg font-extrabold font-headline text-on-surface">
                          Dynamic QR Gate Check-In Velocity (Huang Gate B)
                        </h2>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-mono text-xs font-bold">
                        PEAK: 4:15 PM (68 scans/min)
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-3 items-end h-36 pt-4 px-2">
                      {[
                        { label: "3:30 PM", pct: "28%", val: "42" },
                        { label: "4:00 PM", pct: "76%", val: "118" },
                        {
                          label: "4:30 PM",
                          pct: "96%",
                          val: "164",
                          peak: true,
                        },
                        { label: "5:00 PM", pct: "64%", val: "92" },
                        { label: "5:30 PM", pct: "48%", val: "64" },
                        { label: "6:00 PM", pct: "35%", val: "48" },
                      ].map((bar) => (
                        <div
                          key={bar.label}
                          className="flex flex-col items-center gap-2 h-full justify-end"
                        >
                          <span className="text-[10px] font-mono font-bold text-primary">
                            {bar.val}
                          </span>
                          <div className="w-full bg-surface-container-low rounded-xl h-24 flex items-end overflow-hidden">
                            <div
                              className={`w-full rounded-xl ${
                                bar.peak
                                  ? "bg-primary"
                                  : "bg-primary-container/80"
                              }`}
                              style={{ height: bar.pct }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-outline">
                            {bar.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Student Sign-Ups & Locker Dispatch Queue */}
                  <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 overflow-hidden shadow-xs">
                    <div className="p-6 border-b border-outline-variant/25 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-extrabold font-headline text-on-surface">
                          Recent Student Sign-Ups & Locker Handovers
                        </h2>
                        <p className="text-xs text-on-surface-variant">
                          Click action button to verify attendant QR check-in
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-surface-container-low/70 border-b border-outline-variant/25 text-outline font-mono uppercase">
                            <th className="py-3.5 px-6">Student</th>
                            <th className="py-3.5 px-4">Event / Merch Item</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-6 text-right">
                              Gate Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                          {signups.map((row) => {
                            const checked = row.status === "Checked In";
                            return (
                              <tr
                                key={row.id}
                                className="hover:bg-surface-container-low/40"
                              >
                                <td className="py-4 px-6">
                                  <p className="font-bold text-on-surface">
                                    {row.studentName}
                                  </p>
                                  <p className="font-mono text-[11px] text-outline">
                                    {row.studentId} • {row.time}
                                  </p>
                                </td>
                                <td className="py-4 px-4">
                                  <p className="font-bold text-on-surface">
                                    {row.eventOrItem}
                                  </p>
                                  <span className="text-[11px] text-primary font-medium">
                                    {row.tier}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold ${
                                      checked
                                        ? "bg-secondary-container text-on-secondary-fixed"
                                        : "bg-surface-container-high text-on-surface"
                                    }`}
                                  >
                                    {row.status}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <button
                                    type="button"
                                    onClick={() => toggleSignupStatus(row.id)}
                                    className={`px-3.5 py-1.5 rounded-xl font-headline font-bold text-xs transition-all cursor-pointer ${
                                      checked
                                        ? "bg-surface-container-low text-on-surface-variant"
                                        : "bg-primary text-on-primary"
                                    }`}
                                  >
                                    {checked ? "Verified ✓" : "Check In"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: AI Copy Studio & Quick Event Launch */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">
                          auto_awesome
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold font-headline text-on-surface">
                          AI Copywriter Studio
                        </h3>
                        <p className="text-[10px] font-mono text-primary uppercase">
                          Luma & Storefront Copy
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      {(["editorial", "technical", "urgent"] as const).map(
                        (t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setAiTone(t)}
                            className={`flex-1 py-1.5 rounded-lg font-mono text-[10px] uppercase font-bold border cursor-pointer ${
                              aiTone === t
                                ? "bg-on-surface text-white border-on-surface"
                                : "bg-surface-container-low text-on-surface-variant border-outline-variant/30"
                            }`}
                          >
                            {t}
                          </button>
                        )
                      )}
                    </div>

                    <textarea
                      rows={4}
                      value={eventPitch}
                      onChange={(e) => setEventPitch(e.target.value)}
                      className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface leading-relaxed"
                    />

                    <button
                      type="button"
                      onClick={handleAiPolish}
                      disabled={isGenerating}
                      className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        bolt
                      </span>
                      <span>
                        {isGenerating
                          ? "Synthesizing..."
                          : "Synthesize Club Copy"}
                      </span>
                    </button>
                  </div>

                  {/* Smart Locker Hub Status */}
                  <div className="bg-[#131b2e] text-white rounded-[2rem] p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-container">
                        Union Hub A Telemetry
                      </span>
                      <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-fixed font-mono text-[10px] font-bold">
                        ONLINE
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold font-headline">
                      14 / 48 Compartments Open
                    </h3>
                    <p className="text-xs text-white/75 leading-relaxed">
                      Club merchandise orders automatically assign a 4-digit PIN
                      and notify students via AI Copilot.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <FastPassModal
        isOpen={previewPassOpen}
        onClose={() => setPreviewPassOpen(false)}
        title={eventTitle}
        subtitle={`${eventDate} • ${eventTime}`}
        passCode="STUDIO-GATE-PREVIEW"
        location={eventVenue}
        badgeLabel="ORGANIZER GATE TEST PASS"
      />
    </div>
  );
}
