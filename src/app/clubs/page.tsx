"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SpotlightCard,
  TiltedCard,
  AnimatedContent,
} from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";

interface ClubItem {
  id: string;
  name: string;
  category: string;
  filterCategory: string;
  members: number;
  statusBadge: string;
  statusType: "recruiting" | "open" | "interviewing";
  description: string;
  tags: string[];
  meetingTime: string;
  ctaLabel: string;
  icon: string;
  iconBg: string;
}

const CLUBS_LIST: ClubItem[] = [
  {
    id: "ux_design",
    name: "Stanford UX & Design Association",
    category: "Design & HCI",
    filterCategory: "Design & Media",
    members: 210,
    statusBadge: "Recruiting",
    statusType: "recruiting",
    description:
      "Weekly Figma critiques, design systems workshops, and product design sprints with industry mentors from Apple, Linear, and Airbnb.",
    tags: ["Figma", "Product Design", "UI/UX"],
    meetingTime: "Thu 6:30 PM • d.school",
    ctaLabel: "1-Click Apply",
    icon: "palette",
    iconBg: "bg-[#131b2e] text-secondary-container",
  },
  {
    id: "solar_car",
    name: "Solar Car Project",
    category: "Aerospace & CleanTech",
    filterCategory: "Engineering & AI",
    members: 95,
    statusBadge: "Open Shop",
    statusType: "open",
    description:
      "Designing, fabricating, and racing a solar-powered endurance vehicle across the Australian outback in the World Solar Challenge.",
    tags: ["Composites", "Battery BMS", "CAD"],
    meetingTime: "Sat 10:00 AM • VAIL Garage",
    ctaLabel: "Join Subteam",
    icon: "solar_power",
    iconBg: "bg-primary text-white",
  },
  {
    id: "venture_quant",
    name: "Campus Venture & Quant Collective",
    category: "Finance & Web3",
    filterCategory: "Venture & Finance",
    members: 160,
    statusBadge: "Interviewing",
    statusType: "interviewing",
    description:
      "Student-run micro-seed investment committee and algorithmic trading research group managing a $250K alumni endowment sleeve.",
    tags: ["Venture Capital", "Quantitative", "Startups"],
    meetingTime: "Tue 7:30 PM • GSB Room 104",
    ctaLabel: "Submit Profile",
    icon: "trending_up",
    iconBg: "bg-[#283044] text-secondary-container",
  },
  {
    id: "daily_media",
    name: "The Daily Collegian Media Lab",
    category: "Journalism & Podcast",
    filterCategory: "Design & Media",
    members: 140,
    statusBadge: "Pitch Open",
    statusType: "recruiting",
    description:
      "Independent investigative reporting, data journalism visualizations, and weekly campus culture podcasts produced in our broadcast studio.",
    tags: ["Editorial", "Audio Studio", "Data Viz"],
    meetingTime: "Mon 5:00 PM • Storke Publications",
    ctaLabel: "Join Newsroom",
    icon: "podcasts",
    iconBg: "bg-secondary text-white",
  },
  {
    id: "pre_med_biotech",
    name: "Pre-Med & Biotech Society",
    category: "Life Sciences",
    filterCategory: "Engineering & AI",
    members: 310,
    statusBadge: "Open Access",
    statusType: "open",
    description:
      "Clinical shadowing matching, CRISPR wet-lab bootcamps, MCAT peer cohorts, and physician-scientist keynote roundtables.",
    tags: ["CRISPR", "Clinical", "Bioengineering"],
    meetingTime: "Wed 6:00 PM • Clark Center Auditorium",
    ctaLabel: "Join Roster",
    icon: "biotech",
    iconBg: "bg-primary text-white",
  },
  {
    id: "analog_film",
    name: "Analog Film & Darkroom Guild",
    category: "Visual Arts",
    filterCategory: "Cultural & Arts",
    members: 88,
    statusBadge: "Lab Certified",
    statusType: "open",
    description:
      "24/7 student darkroom access for 35mm & 120mm C-41 and black-and-white film development, plus monthly rooftop 16mm screenings.",
    tags: ["35mm Film", "Darkroom", "Archival Print"],
    meetingTime: "Fri 4:00 PM • McMurtry Art Basement",
    ctaLabel: "Book Orientation",
    icon: "photo_camera",
    iconBg: "bg-[#131b2e] text-white",
  },
];

const CATEGORIES = [
  "All Orgs",
  "Engineering & AI",
  "Design & Media",
  "Venture & Finance",
  "Cultural & Arts",
] as const;

export default function ClubsDirectoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Orgs");
  const [searchQuery, setSearchQuery] = useState("");
  const [recruitingOnly, setRecruitingOnly] = useState(false);
  const [appliedClubs, setAppliedClubs] = useState<Record<string, boolean>>({});
  const [activeClubModal, setActiveClubModal] = useState<string | null>(null);

  const filteredClubs = CLUBS_LIST.filter((club) => {
    if (
      selectedCategory !== "All Orgs" &&
      club.filterCategory !== selectedCategory
    ) {
      return false;
    }
    if (recruitingOnly && club.statusType === "interviewing") {
      return false;
    }
    if (
      searchQuery.trim() &&
      !club.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !club.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !club.tags.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) {
      return false;
    }
    return true;
  });

  const handleApply = (clubId: string, clubName: string) => {
    setAppliedClubs((prev) => ({ ...prev, [clubId]: true }));
    setActiveClubModal(clubName);
  };

  return (
    <main className="relative pt-28 pb-24 max-w-7xl mx-auto px-6">
      {/* 1. UNIFIED HERO HEADER */}
      <PageHero
        badge="180+ Recognized Student Orgs • Fall Recruitment Open"
        badgeSubtext="Seed Grants Active"
        badgeHref="/campaigns"
        titleLead="Discover your circle,"
        titleHighlight="craft ideas"
        titleTrail="& lead communities."
        description="Explore verified engineering teams, design guilds, venture collectives, and cultural societies—apply in 1 click using your Stanford Student ID."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/campaigns"
              className="bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-outline-variant/40 font-headline font-bold text-xs px-5 py-3.5 rounded-2xl transition-all flex items-center gap-2 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                volunteer_activism
              </span>
              <span>Explore Club Grants</span>
            </Link>
            <Link
              href="/organizer"
              className="bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs px-5 py-3.5 rounded-2xl transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                add_circle
              </span>
              <span>Charter New Club</span>
            </Link>
          </div>
        }
      />

      {/* 2. SEARCH & FILTER BAR */}
      <section className="sticky top-20 z-30 mb-10">
        <div className="glass-pill rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={
                    active
                      ? "px-4 py-2 rounded-xl text-xs font-bold bg-on-surface text-surface shadow-xs shrink-0 cursor-pointer"
                      : "px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all shrink-0 cursor-pointer"
                  }
                >
                  {cat === "All Orgs" ? "All Orgs (184)" : cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search robotics, design, film, quant..."
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low/80 rounded-xl text-xs text-on-surface placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={() => setRecruitingOnly((v) => !v)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low/80 border border-outline-variant/30 cursor-pointer"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  recruitingOnly ? "bg-primary animate-pulse" : "bg-outline"
                }`}
              />
              <span className="text-[11px] font-semibold text-on-surface">
                Open Entry Only
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SPOTLIGHT CLUB BENTO CARD */}
      <AnimatedContent
        distance={60}
        direction="vertical"
        duration={0.8}
        ease="power3.out"
        threshold={0.1}
        className="mb-12"
      >
        <TiltedCard
          maxTilt={2}
          className="rounded-[2.25rem] bg-[#131b2e] text-white p-8 sm:p-10 shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none" />

          <div className="lg:col-span-7 relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-extrabold uppercase tracking-widest">
                Spotlight of the Week
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-secondary-container text-[10px] font-mono font-bold border border-white/15">
                96% Skill Match • CS & Robotics
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Lab Open • 14 Members Inside
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight mb-3">
              Robotics & AI Society{" "}
              <span className="font-editorial italic font-normal text-secondary-container">
                (IEEE Student Chapter)
              </span>
            </h2>
            <p className="text-sm text-white/75 leading-relaxed mb-6 max-w-2xl">
              Building autonomous quadrupeds, custom manipulator arms, and edge
              vision models. Open to undergraduate and graduate students across
              CS, EE, and Mechanical Engineering—no prior hardware fabrication
              required.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 pt-4 border-t border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
                  Active Roster
                </span>
                <span className="text-base font-extrabold font-headline text-white">
                  142 Builders
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
                  Lab Location
                </span>
                <span className="text-base font-extrabold font-headline text-secondary-container">
                  Huang Basement • Bay 3
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
                  Weekly Build Night
                </span>
                <span className="text-base font-extrabold font-headline text-white">
                  Wednesdays, 7:00 PM
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  handleApply(
                    "robotics_ai",
                    "Robotics & AI Society (IEEE Student Chapter)"
                  )
                }
                className="bg-secondary-container hover:bg-primary-fixed text-on-secondary-fixed font-headline font-bold text-xs px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>
                  {appliedClubs["robotics_ai"]
                    ? "Application Sent ✓"
                    : "1-Click Apply with Student ID"}
                </span>
                <span className="material-symbols-outlined text-[16px]">
                  bolt
                </span>
              </button>
              <Link
                href="/map"
                className="bg-white/10 hover:bg-white/15 text-white border border-white/15 font-headline font-semibold text-xs px-5 py-3.5 rounded-xl transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  location_on
                </span>
                <span>Locate Lab Bay 3</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-white/15">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80"
              alt="Robotics Lab"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
              <div className="w-full flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Next Event: Quadruped Obstacle Trials
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-secondary-container text-on-secondary-fixed font-mono font-bold text-[10px]">
                  OCT 24
                </span>
              </div>
            </div>
          </div>
        </TiltedCard>
      </AnimatedContent>

      {/* 4. CURATED CLUBS DIRECTORY GRID (6 CARDS) */}
      <section className="mb-20">
        <AnimatedContent
          distance={60}
          direction="vertical"
          duration={0.8}
          ease="power3.out"
          stagger={0.08}
          threshold={0.1}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredClubs.map((club) => {
            const isApplied = Boolean(appliedClubs[club.id]);
            return (
              <SpotlightCard
                key={club.id}
                className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl ${club.iconBg} flex items-center justify-center font-headline font-extrabold text-lg shrink-0`}
                      >
                        <span className="material-symbols-outlined">
                          {club.icon}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
                          {club.category} • {club.members} Members
                        </span>
                        <h3 className="text-lg font-extrabold font-headline text-on-surface leading-tight">
                          {club.name}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                        club.statusType === "recruiting"
                          ? "bg-secondary-container text-on-secondary-fixed"
                          : club.statusType === "open"
                          ? "bg-surface-container-high text-on-surface"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {club.statusBadge}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed mb-5">
                    {club.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {club.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-surface-container-low text-[10px] font-semibold text-on-surface-variant"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/25 flex items-center justify-between">
                  <div className="text-[11px] text-outline font-medium">
                    <span className="font-bold text-on-surface block">
                      {club.meetingTime}
                    </span>
                    <span>Verified Student Chapter</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApply(club.id, club.name)}
                    className={`font-headline font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer ${
                      isApplied
                        ? "bg-secondary-container text-on-secondary-fixed"
                        : "bg-on-surface hover:bg-primary text-surface"
                    }`}
                  >
                    {isApplied ? "Applied ✓" : club.ctaLabel}
                  </button>
                </div>
              </SpotlightCard>
            );
          })}
        </AnimatedContent>
      </section>

      {/* 5. CHARTER A NEW CLUB BANNER */}
      <AnimatedContent
        distance={60}
        direction="vertical"
        duration={0.8}
        ease="power3.out"
        threshold={0.1}
        className="rounded-[2rem] bg-surface-container-lowest border border-outline-variant/40 p-8 sm:p-10 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6"
      >
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-extrabold uppercase tracking-widest mb-3">
            <span className="material-symbols-outlined text-[14px]">
              rocket_launch
            </span>
            Student Union Incubator
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-headline text-on-surface tracking-tight mb-2">
            Don&apos;t see your community?{" "}
            <span className="font-editorial italic font-normal text-primary">
              Found a new one.
            </span>
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Gather 8 verified students and a faculty advisor to unlock up to
            $5,000 in ASSU seed grants, dedicated room booking privileges, and
            an instant CampusHub storefront.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/campaigns"
            className="px-5 py-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs transition-colors"
          >
            View Seed Grant Rules
          </Link>
          <Link
            href="/organizer"
            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <span>Start Club Charter</span>
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        </div>
      </AnimatedContent>

      {/* Confirmation Toast Modal */}
      {activeClubModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveClubModal(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">
                verified
              </span>
            </div>
            <h3 className="text-xl font-extrabold font-headline text-on-surface">
              1-Click Application Sent!
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Your verified Stanford Student Profile (
              <strong className="text-on-surface">
                Alex Rivera • #STU-882194
              </strong>
              ) and academic availability have been shared with{" "}
              <strong className="text-primary">{activeClubModal}</strong>.
            </p>
            <div className="pt-2 flex gap-3">
              <Link
                href="/account"
                className="flex-1 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs"
              >
                View Memberships
              </Link>
              <button
                type="button"
                onClick={() => setActiveClubModal(null)}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-headline font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

