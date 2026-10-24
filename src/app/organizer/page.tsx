"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SpotlightCard, CountUp } from "@/components/ui/react-bits";

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
    eventOrItem: "Autonomous Drone Swarm & Neural SLAM",
    tier: "VIP Keynote + Demo",
    status: "Checked In",
    time: "4 mins ago",
  },
  {
    id: "REG-9040",
    studentName: "Maya Lin",
    studentId: "#STU-881029",
    eventOrItem: "Autonomous Drone Swarm & Neural SLAM",
    tier: "Student General Pass",
    status: "Pass Issued",
    time: "12 mins ago",
  },
  {
    id: "REG-9039",
    studentName: "Liam Vance",
    studentId: "#STU-874410",
    eventOrItem: "Heavyweight Archival Hoodie (L)",
    tier: "MLK Locker #B-12",
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
  {
    id: "REG-9037",
    studentName: "Marcus Vance",
    studentId: "#STU-883391",
    eventOrItem: "Web3 Cryptography Summit",
    tier: "Early Bird Tier",
    status: "Checked In",
    time: "2 hours ago",
  },
];

export default function OrganizerDashboardPage() {
  const [signups, setSignups] = useState<RosterSignUp[]>(INITIAL_SIGNUPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "checked_in" | "issued">("all");

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

  const filteredSignups = signups.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.eventOrItem.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === "checked_in") return matchesSearch && s.status === "Checked In";
    if (filterStatus === "issued") return matchesSearch && s.status === "Pass Issued";
    return matchesSearch;
  });

  const checkedInCount = signups.filter((s) => s.status === "Checked In").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary font-label mb-1">
            <span className="material-symbols-outlined text-[16px]">monitoring</span>
            <span>Real-Time Campus Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
            Dashboard &amp; Telemetry
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Live turnstile velocity, student registration rosters, and smart locker dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/organizer/events"
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>New Event</span>
          </Link>
          <Link
            href="/organizer/scanner"
            className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-base text-primary">qr_code_scanner</span>
            <span>Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* 1. Telemetry Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
              Passes Issued
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">confirmation_number</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-headline">
            <CountUp to={418} durationMs={1200} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+18% from last week</span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
              Turnstile Velocity
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container/40 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">speed</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-headline flex items-baseline gap-1">
            <CountUp to={3.4} decimals={1} durationMs={1200} />
            <span className="text-sm font-mono text-outline">sec/scan</span>
          </div>
          <div className="text-xs text-on-surface-variant font-mono">
            {checkedInCount} checked in today
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
              Smart Lockers Filled
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">inventory_2</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-headline">
            <CountUp to={18} durationMs={1200} />
            <span className="text-base text-outline font-mono"> / 24</span>
          </div>
          <div className="text-xs text-on-surface-variant">
            Zone A (MLK Union) at 75% cap
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
              Chapter Treasury
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container/40 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">payments</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-headline flex items-baseline">
            <span>$</span>
            <CountUp to={3480} durationMs={1200} />
          </div>
          <div className="text-xs text-primary font-mono font-bold">
            0% platform fee • Verified
          </div>
        </SpotlightCard>
      </div>

      {/* 2. Management Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/organizer/events"
          className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 hover:shadow-xs transition-all group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-xl">edit_calendar</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-1">
              <span>Event Manager &amp; Editor</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Edit dates, AI pitch, venue logistics, and zero-conflict schedule checks.
            </p>
          </div>
        </Link>

        <Link
          href="/organizer/tickets"
          className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 hover:shadow-xs transition-all group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-xl">confirmation_number</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-1">
              <span>Passes &amp; Ticket Tiers</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Configure free student tier, VIP pass pricing, and rolling QR intervals.
            </p>
          </div>
        </Link>

        <Link
          href="/organizer/lockers"
          className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 hover:shadow-xs transition-all group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-xl">inventory_2</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-1">
              <span>Smart Locker Queue</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Dispatch official collegiate merch to Union &amp; Moffitt smart lockers.
            </p>
          </div>
        </Link>
      </div>

      {/* 3. Live Turnstile Roster Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold font-headline text-on-surface">
              Attendee Roster &amp; Live Gate Check-Ins
            </h2>
            <p className="text-xs text-on-surface-variant">
              Click any student pass status to manually toggle turnstile check-in.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined text-sm text-outline absolute left-3 top-2.5 pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attendee..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary w-40 sm:w-52"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex rounded-xl bg-surface-container-low p-1 border border-outline-variant/30 text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  filterStatus === "all"
                    ? "bg-surface-container-lowest text-on-surface shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("checked_in")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  filterStatus === "checked_in"
                    ? "bg-secondary-container text-on-secondary-fixed shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Checked In
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("issued")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  filterStatus === "issued"
                    ? "bg-surface-container-lowest text-on-surface shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Issued
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 text-outline font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Student</th>
                <th className="pb-3 px-3">Event / Item</th>
                <th className="pb-3 px-3">Tier</th>
                <th className="pb-3 px-3">Time</th>
                <th className="pb-3 px-3 text-right">Gate Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {filteredSignups.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-surface-container-low/50 transition-colors group"
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-on-surface">{s.studentName}</div>
                    <div className="text-[10px] font-mono text-outline">{s.studentId}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-on-surface">{s.eventOrItem}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-mono font-semibold">
                      {s.tier}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-outline font-mono text-[11px]">{s.time}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSignupStatus(s.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 ${
                        s.status === "Checked In"
                          ? "bg-secondary-container text-on-secondary-fixed shadow-2xs"
                          : "bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface border border-outline-variant/40"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {s.status === "Checked In" ? "check" : "pending"}
                      </span>
                      <span>{s.status}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
