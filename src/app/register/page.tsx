"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SpotlightCard,
  TiltedCard,
  FastPassModal,
  GlideSelect,
} from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";

const DEGREE_LEVELS = ["Undergraduate", "Master's / MBA", "Ph.D. / Postdoc"];

const GUILD_TAGS = [
  "Autonomous Robotics",
  "Product Design / Figma",
  "AI & Neural Systems",
  "Analog Photography",
  "Venture & Startups",
  "CleanTech & Solar",
  "Indie Music & Sound",
  "Running & Wellness",
];

export default function StudentOnboardingPage() {
  const [fullName, setFullName] = useState("Alex Rivera");
  const [email, setEmail] = useState("arivera27@stanford.edu");
  const [studentId, setStudentId] = useState("#STU-882194");
  const [degreeLevel, setDegreeLevel] = useState("Undergraduate");
  const [major, setMajor] = useState("Computer Science & Interaction Design");
  const [cohort, setCohort] = useState("Class of 2027");
  const [residence, setResidence] = useState("Crothers Hall — Toyon Quad");
  const [selectedGuilds, setSelectedGuilds] = useState<string[]>([
    "Autonomous Robotics",
    "Product Design / Figma",
    "AI & Neural Systems",
  ]);
  const [lockerSync, setLockerSync] = useState(true);
  const [calendarSync, setCalendarSync] = useState(true);
  const [passModalOpen, setPassModalOpen] = useState(false);

  const toggleGuild = (tag: string) => {
    setSelectedGuilds((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleIssuePass = (e: React.FormEvent) => {
    e.preventDefault();
    setPassModalOpen(true);
  };

  return (
    <main className="relative pt-28 pb-24 max-w-7xl mx-auto px-6">
      {/* 1. UNIFIED HERO & STEP TRACKER */}
      <PageHero
        badge="Institutional Identity Provisioning • NFC Pass v4"
        badgeSubtext="Step 2 of 3 • Guild Radar"
        titleLead="Create your verified"
        titleHighlight="Student Identity"
        titleTrail="& NFC Pass."
        description="Connect your university SSO, calibrate your Interest Guilds for AI Copilot recommendations, and provision your contactless CampusHub ID card."
        stats={[
          {
            label: "Step 1 • SSO",
            value: ".EDU Verified ✓",
            sublabel: email,
            icon: "verified_user",
          },
          {
            label: "Step 2 • Calibration",
            value: `${selectedGuilds.length} Guilds Active`,
            sublabel: "Live NFC Card Synced",
            icon: "badge",
            accent: true,
          },
        ]}
      />

      <form
        onSubmit={handleIssuePass}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* LEFT 7 COLS: Onboarding Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Institutional Credentials */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold font-headline text-on-surface">
                1. Institutional Credentials
              </h2>
              <span className="text-[11px] font-mono font-bold text-primary bg-secondary-container/50 px-2.5 py-1 rounded-full">
                .EDU VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Full Student Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-bold text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Matriculation ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono font-bold text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  University SSO Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Academic Track & Residence */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-lg font-extrabold font-headline text-on-surface">
              2. Academic Credentials & Residence
            </h2>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-2">
                Degree Track
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {DEGREE_LEVELS.map((lvl) => {
                  const active = degreeLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDegreeLevel(lvl)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        active
                          ? "bg-on-surface text-surface border-on-surface"
                          : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary"
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Primary Major / Department
                </label>
                <GlideSelect
                  className="w-full"
                  options={[
                    {
                      value: "Computer Science & Interaction Design",
                      label: "Computer Science & Interaction Design",
                      tag: "Engineering",
                    },
                    {
                      value: "Electrical & Autonomous Engineering",
                      label: "Electrical & Autonomous Engineering",
                      tag: "EE",
                    },
                    {
                      value: "Bioengineering & Cellular Systems",
                      label: "Bioengineering & Cellular Systems",
                      tag: "BioE",
                    },
                    {
                      value: "Economics & Venture Management",
                      label: "Economics & Venture Management",
                      tag: "GSB/Econ",
                    },
                  ]}
                  value={major}
                  onChange={(val) => setMajor(val)}
                  ariaLabel="Faculty / Major"
                  menuWidth={320}
                  size="lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Graduating Cohort
                </label>
                <GlideSelect
                  className="w-full"
                  options={[
                    { value: "Class of 2026", label: "Class of 2026", tag: "Senior" },
                    { value: "Class of 2027", label: "Class of 2027", tag: "Junior" },
                    { value: "Class of 2028", label: "Class of 2028", tag: "Sophomore" },
                    { value: "Class of 2029", label: "Class of 2029", tag: "Frosh" },
                  ]}
                  value={cohort}
                  onChange={(val) => setCohort(val)}
                  ariaLabel="Graduating Cohort"
                  menuWidth={240}
                  size="lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                  Campus Residence & Mailroom Hub
                </label>
                <GlideSelect
                  className="w-full"
                  options={[
                    {
                      value: "Crothers Hall — Toyon Quad",
                      label: "Crothers Hall — Toyon Quad",
                      tag: "Union Hub A",
                    },
                    {
                      value: "Wilbur Hall — East Campus",
                      label: "Wilbur Hall — East Campus",
                      tag: "North Dorm",
                    },
                    {
                      value: "EVGR Graduate Towers",
                      label: "EVGR Graduate Towers",
                      tag: "Pavilion",
                    },
                  ]}
                  value={residence}
                  onChange={(val) => setResidence(val)}
                  ariaLabel="Campus Residence & Mailroom Hub"
                  menuWidth={340}
                  size="lg"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Interest Guilds & Skill Radar */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold font-headline text-on-surface">
                  3. Interest Guilds & AI Skill Radar
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Select guilds to calibrate your AI Copilot event & club
                  recommendations.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-primary">
                {selectedGuilds.length} Selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {GUILD_TAGS.map((tag) => {
                const active = selectedGuilds.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleGuild(tag)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {active ? "check_circle" : "add"}
                    </span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Smart Campus Services Toggles */}
            <div className="pt-4 border-t border-outline-variant/25 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-on-surface">
                  24/7 Smart Locker Auto-Assign
                </span>
                <input
                  type="checkbox"
                  checked={lockerSync}
                  onChange={(e) => setLockerSync(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
              </label>
              <label className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-on-surface">
                  Canvas & GCal Free-Hour Sync
                </span>
                <input
                  type="checkbox"
                  checked={calendarSync}
                  onChange={(e) => setCalendarSync(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: Live Sticky CampusHub ID NFC Pass Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <TiltedCard maxTilt={3.5}>
            <SpotlightCard
              spotlightColor="rgba(193, 238, 120, 0.28)"
              className="rounded-[2.25rem] bg-gradient-to-br from-[#131b2e] via-[#1c263b] to-[#2b3c14] text-white p-7 shadow-2xl border border-white/15 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">
                      school
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-container block">
                      Stanford University
                    </span>
                    <span className="text-sm font-extrabold font-headline">
                      CampusHub NFC ID
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 font-mono text-[10px] text-secondary-container font-bold">
                  NFC ACTIVE
                </span>
              </div>

              {/* Avatar & Identity Block */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-secondary-container text-on-secondary-fixed font-headline font-extrabold text-2xl flex items-center justify-center shrink-0">
                  {fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "AR"}
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl font-extrabold font-headline truncate">
                    {fullName || "Alex Rivera"}
                  </h3>
                  <p className="text-xs font-mono text-secondary-container">
                    {studentId} • {degreeLevel}
                  </p>
                  <p className="text-xs text-white/75 truncate mt-0.5">
                    {major}
                  </p>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs mb-6">
                <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">
                    Cohort
                  </span>
                  <span className="font-bold text-white">{cohort}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">
                    Residence Hub
                  </span>
                  <span className="font-bold text-white truncate block">
                    {residence.split("—")[0]}
                  </span>
                </div>
              </div>

              {/* Guild Chips on Card */}
              <div className="mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-2">
                  Calibrated Guild Radar ({selectedGuilds.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedGuilds.slice(0, 4).map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-lg bg-secondary-container/20 border border-secondary-container/30 text-secondary-container text-[10px] font-bold"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom QR & Contactless Strip */}
              <div className="p-4 rounded-2xl bg-white text-on-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-on-surface">
                    qr_code_2
                  </span>
                  <div>
                    <p className="text-xs font-extrabold font-headline">
                      10% Store & Locker Access
                    </p>
                    <p className="text-[10px] font-mono text-outline">
                      {email}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-2xl">
                  contactless
                </span>
              </div>
            </SpotlightCard>
          </TiltedCard>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              badge
            </span>
            <span>Issue Encrypted NFC Student ID Pass</span>
          </button>

          <div className="text-center">
            <Link
              href="/account"
              className="text-xs font-bold text-on-surface-variant hover:text-primary"
            >
              Already verified? Go to Student Profile →
            </Link>
          </div>
        </div>
      </form>

      <FastPassModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        title={`${fullName} • Verified Campus ID`}
        subtitle={`${cohort} • ${major}`}
        passCode={`NFC-${studentId.replace("#", "")}`}
        studentName={fullName}
        studentId={studentId}
        location={residence}
        badgeLabel="INSTITUTIONAL NFC STUDENT ID"
      />
    </main>
  );
}

