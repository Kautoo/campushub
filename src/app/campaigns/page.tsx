"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Users,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Search,
  ShoppingBag,
} from "lucide-react";
import { MOCK_CAMPAIGNS, MOCK_PRODUCTS } from "@/data/mockData";
import { PageHero } from "@/components/ui/page-hero";

const CAMPAIGN_CATEGORIES = [
  "All Initiatives",
  "Engineering & Tech",
  "Humanitarian & Health",
  "Academic Grants",
  "Ecological & Reusable",
] as const;

export default function CampaignsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Initiatives");
  const [searchQuery, setSearchQuery] = useState("");

  const flagship = MOCK_CAMPAIGNS[0];
  const flagshipPct = Math.round(
    (flagship.raisedAmount / flagship.goalAmount) * 100
  );

  const filteredCampaigns = MOCK_CAMPAIGNS.filter((c) => {
    if (
      selectedCategory !== "All Initiatives" &&
      c.category !== selectedCategory
    ) {
      return false;
    }
    if (
      searchQuery.trim() &&
      !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.organization.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.summary.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-surface pt-28 sm:pt-32 pb-24">
      {/* 1. UNIFIED HERO & FILTER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHero
          titleLead="Back Student Ambition."
          titleHighlight="Track Every Milestone"
          titleTrail="on campus."
          description="Fund student-built electric racecars, rural mobile clinics, and undergraduate lab reagent grants. Contributions are held in Student Union escrow and released only as engineering milestones are verified."
        >
          {/* Unified Filter & Search Bar */}
          <div className="glass-pill rounded-2xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {CAMPAIGN_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      active
                        ? "bg-on-surface text-surface shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search initiatives or societies..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-low/80 border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </PageHero>
      </div>

      {/* 2. Featured Landmark Campaign with 3-Stage Milestone Escrow Execution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="rounded-3xl bg-surface-canvas border border-border-default overflow-hidden pin-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left 7 Cols: Visual & Story */}
            <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-border-default">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-tertiary-fixed/80 text-tertiary font-label-sm text-[10px] uppercase tracking-wider">
                    Flagship Engineering Build
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary">
                    <ShieldCheck className="w-4 h-4" />
                    {flagship.organization.name}
                  </span>
                </div>

                <Link
                  href={`/campaigns/${flagship.id}`}
                  className="block font-display-sm text-on-surface hover:text-primary transition-colors"
                >
                  {flagship.title}
                </Link>

                <p className="font-body-md text-text-secondary leading-relaxed">
                  {flagship.summary}
                </p>
              </div>

              <Link
                href={`/campaigns/${flagship.id}`}
                className="block relative aspect-[16/9] rounded-2xl overflow-hidden bg-surface-panel group"
              >
                <img
                  src={flagship.featuredImage}
                  alt={flagship.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-surface-canvas/90 backdrop-blur-md flex items-center justify-between text-xs">
                  <span className="font-medium text-on-surface">
                    {flagship.matchingGrant || "FS-25 Carbon Monocoque & Dual Inverter Architecture"}
                  </span>
                  <span className="font-mono font-bold text-primary">
                    Inspect Blueprint →
                  </span>
                </div>
              </Link>
            </div>

            {/* Right 5 Cols: 3-Stage Milestone Escrow Execution */}
            <div className="lg:col-span-5 p-6 md:p-10 bg-surface-soft/50 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div>
                  <span className="font-label-sm text-[11px] text-secondary uppercase tracking-widest">
                    Live Escrow Telemetry
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <div>
                      <span className="font-serif text-3xl font-bold text-on-surface">
                        ${flagship.raisedAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-text-secondary ml-1.5">
                        of ${flagship.goalAmount.toLocaleString()}
                      </span>
                    </div>
                    <span className="font-mono text-base font-bold text-primary">
                      {flagshipPct}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-surface-panel overflow-hidden mt-2.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${flagshipPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-secondary mt-2.5">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <strong>{flagship.backersCount}</strong> backers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      <strong>{flagship.daysLeft} days</strong> remaining
                    </span>
                  </div>
                </div>

                {/* 3-Stage Milestone Execution Ladder */}
                <div className="space-y-2.5 pt-3 border-t border-border-default">
                  <p className="font-label-sm text-[11px] text-text-muted uppercase tracking-wider">
                    Milestone Escrow Execution
                  </p>
                  {flagship.budgetBreakdown.slice(0, 3).map((item, idx) => {
                    const isCompleted = idx === 0;
                    return (
                      <div
                        key={item.category}
                        className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                          isCompleted
                            ? "bg-surface-canvas border-border-default"
                            : idx === 1
                            ? "bg-surface-container-low border-primary/30"
                            : "bg-surface-canvas/60 border-border-default/60 opacity-80"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${
                              isCompleted
                                ? "text-status-success"
                                : idx === 1
                                ? "text-primary"
                                : "text-text-muted"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface truncate">
                              {item.category}
                            </p>
                            <p className="text-[10px] font-mono text-text-muted">
                              Allocation: ${item.amount.toLocaleString()} ({item.percentage}%)
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                            isCompleted
                              ? "bg-emerald-100 text-status-success"
                              : idx === 1
                              ? "bg-primary text-white"
                              : "bg-surface-panel text-text-muted"
                          }`}
                        >
                          {item.phase || (isCompleted ? "RELEASED" : "ACTIVE")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/campaigns/${flagship.id}`}
                  className="flex-1 py-3.5 px-5 rounded-full bg-primary hover:bg-primary-container text-white font-label-lg text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Back This Build</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/campaigns/${flagship.id}#ledger`}
                  className="py-3.5 px-5 rounded-full bg-surface-canvas hover:bg-surface-panel text-on-surface border border-border-default font-label-lg text-xs text-center transition-colors"
                >
                  Audit Ledger
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Open Guild Initiatives Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="font-label-sm text-secondary uppercase tracking-widest text-xs block mb-1">
              Verified Student Causes
            </span>
            <h2 className="font-display-sm text-on-surface">
              Open Guild{" "}
              <span className="italic font-normal text-primary">
                Initiatives ({filteredCampaigns.length})
              </span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCampaigns.map((camp) => {
            const pct = Math.round((camp.raisedAmount / camp.goalAmount) * 100);
            const linkedProduct = camp.linkedProductId
              ? MOCK_PRODUCTS.find((p) => p.id === camp.linkedProductId)
              : null;

            return (
              <div
                key={camp.id}
                className="rounded-3xl bg-surface-canvas border border-border-default overflow-hidden flex flex-col justify-between group hover:shadow-[0_18px_36px_-10px_rgba(23,43,77,0.1)] transition-all duration-300"
              >
                <div>
                  <Link
                    href={`/campaigns/${camp.id}`}
                    className="block relative aspect-[16/10] overflow-hidden bg-surface-panel"
                  >
                    <img
                      src={camp.featuredImage}
                      alt={camp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-on-surface font-label-sm text-[10px] uppercase tracking-wider">
                        {camp.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-secondary text-white font-mono text-[10px] font-bold">
                        {camp.organization.badge}
                      </span>
                    </div>
                  </Link>

                  <div className="p-6 md:p-7 space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-secondary">
                        <ShieldCheck className="w-4 h-4" />
                        {camp.organization.name}
                      </span>
                      <span className="font-mono text-text-muted">
                        {camp.daysLeft} days left
                      </span>
                    </div>

                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="block font-headline-md text-on-surface group-hover:text-primary transition-colors"
                    >
                      {camp.title}
                    </Link>

                    <p className="font-body-sm text-text-secondary line-clamp-2">
                      {camp.summary}
                    </p>

                    {/* Linked Merch Cross-Sell Chip */}
                    {linkedProduct && (
                      <Link
                        href={`/shop/${linkedProduct.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-soft hover:bg-surface-container-low border border-border-default text-xs text-on-surface transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                        <span>
                          Supporter Merch:{" "}
                          <strong className="font-medium">
                            {linkedProduct.name}
                          </strong>{" "}
                          (${linkedProduct.price})
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-secondary" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 md:px-7 md:pb-7 pt-2 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="font-serif text-xl font-bold text-on-surface">
                          ${camp.raisedAmount.toLocaleString()}
                        </span>
                        <span className="text-xs text-text-muted ml-1.5">
                          / ${camp.goalAmount.toLocaleString()}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-primary">
                        {pct}% Funded
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-panel overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-default/70">
                    <span className="text-xs text-text-secondary">
                      <strong className="text-on-surface">
                        {camp.backersCount}
                      </strong>{" "}
                      student & alumni backers
                    </span>
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-label-lg text-primary hover:underline"
                    >
                      Inspect & Back
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Ledger Transparency Breakdown Section (Screen 03) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="rounded-3xl bg-surface-canvas border border-border-default p-8 md:p-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-label-sm text-secondary uppercase tracking-widest text-xs block mb-2">
                Union Treasury Audit Standard
              </span>
              <h2 className="font-display-sm text-on-surface">
                Aggregate Campaign{" "}
                <span className="italic font-normal text-primary">
                  Ledger Allocation
                </span>
              </h2>
            </div>
            <span className="font-mono text-xs px-3 py-1.5 rounded-full bg-surface-soft border border-border-default text-text-secondary">
              Audited Semesterly • 0.00% Platform Commission
            </span>
          </div>

          {/* Horizontal Stacked Allocation Bar */}
          <div className="space-y-3">
            <div className="w-full h-5 rounded-full overflow-hidden flex bg-surface-panel p-0.5 gap-0.5">
              <div
                className="h-full bg-primary rounded-l-full"
                style={{ width: "82.4%" }}
                title="82.4% Direct Hardware & Fabrication"
              />
              <div
                className="h-full bg-secondary"
                style={{ width: "12.6%" }}
                title="12.6% Field Testing & Logistics"
              />
              <div
                className="h-full bg-tertiary-container rounded-r-full"
                style={{ width: "5.0%" }}
                title="5.0% Safety Certification & Audit Reserve"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-surface-soft border border-border-default/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-mono text-lg font-bold text-primary">
                    82.4%
                  </span>
                </div>
                <p className="font-headline-sm text-sm text-on-surface pt-1">
                  Hardware, Composites & Clinical Supplies
                </p>
                <p className="text-xs text-text-secondary">
                  Direct supplier invoices verified before escrow tranche release.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-soft border border-border-default/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="font-mono text-lg font-bold text-secondary">
                    12.6%
                  </span>
                </div>
                <p className="font-headline-sm text-sm text-on-surface pt-1">
                  Field Deployment & Competition Transport
                </p>
                <p className="text-xs text-text-secondary">
                  Freight, mobile clinic fuel, and track testing fees.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-soft border border-border-default/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="w-3 h-3 rounded-full bg-tertiary-container" />
                  <span className="font-mono text-lg font-bold text-tertiary">
                    5.0%
                  </span>
                </div>
                <p className="font-headline-sm text-sm text-on-surface pt-1">
                  Safety Compliance & Contingency Reserve
                </p>
                <p className="text-xs text-text-secondary">
                  Mandatory lab safety testing and union audit buffer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Launch Society Initiative Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="rounded-3xl bg-inverse-surface text-white p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-label-sm uppercase tracking-widest text-secondary-fixed">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Student Societies
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-semibold">
              Have a faculty engineering build or community outreach project?
            </h3>
            <p className="font-body-sm text-white/80">
              Submit your milestone budget and supplier quotes to launch an escrow-backed campaign with zero platform fees.
            </p>
          </div>
          <Link
            href="/organizer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-on-surface font-label-lg text-xs hover:bg-surface-soft transition-colors shrink-0"
          >
            Submit Proposal in Organizer Portal
            <ArrowUpRight className="w-4 h-4 text-primary" />
          </Link>
        </div>
      </section>
    </main>
  );
}

