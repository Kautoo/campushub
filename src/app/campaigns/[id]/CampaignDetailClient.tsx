"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Share2,
  Quote,
  Check,
  FileSpreadsheet,
  Wrench,
} from "lucide-react";
import { MOCK_CAMPAIGNS, MOCK_PRODUCTS } from "@/data/mockData";
import { useBag } from "@/context/BagContext";
import { PageHero } from "@/components/ui/page-hero";

export function CampaignDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { addItem, setCampaignContribution } = useBag();

  const campaign =
    MOCK_CAMPAIGNS.find((c) => c.id === id || c.slug === id) || MOCK_CAMPAIGNS[0];

  const linkedProduct =
    MOCK_PRODUCTS.find((p) => p.id === campaign.linkedProductId) ||
    MOCK_PRODUCTS[1];

  const [selectedTierId, setSelectedTierId] = useState<string>(
    campaign.tiers[1]?.id || campaign.tiers[0]?.id || "tier_a"
  );
  const [customAmount, setCustomAmount] = useState<string>("");
  const [pledgeAdded, setPledgeAdded] = useState(false);
  const [merchAdded, setMerchAdded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const pct = Math.round((campaign.raisedAmount / campaign.goalAmount) * 100);

  const selectedTier =
    campaign.tiers.find((t) => t.id === selectedTierId) || campaign.tiers[0];

  const effectivePledgeAmount =
    customAmount && Number(customAmount) > 0
      ? Number(customAmount)
      : selectedTier?.amount || 25;

  const handleBackCampaign = (redirect = false) => {
    setCampaignContribution({
      campaignId: campaign.id,
      title: campaign.title,
      amount: effectivePledgeAmount,
      tierTitle:
        customAmount && Number(customAmount) > 0
          ? "Custom Escrow Grant"
          : selectedTier?.title || "Supporter Tier",
    });
    setPledgeAdded(true);
    setTimeout(() => setPledgeAdded(false), 1800);
    if (redirect) {
      router.push("/checkout");
    }
  };

  const handleAddLinkedMerch = () => {
    addItem(linkedProduct, 1, linkedProduct.sizes?.[2] || "M");
    setMerchAdded(true);
    setTimeout(() => setMerchAdded(false), 1800);
  };

  const handleShare = () => {
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1800);
  };

  const mosaicImages =
    campaign.galleryImages.length >= 2
      ? [campaign.featuredImage, ...campaign.galleryImages]
      : [
          campaign.featuredImage,
          MOCK_CAMPAIGNS[1].featuredImage,
          MOCK_CAMPAIGNS[2].featuredImage,
        ];

  const techSpecs = campaign.technicalSpecs || [
    { label: "Escrow Tranches", value: "3 Stages", subtext: "Union Audited" },
    { label: "Audit Protocol", value: "v4.2", subtext: "Invoice Verified" },
    { label: "Platform Cut", value: "0.00%", subtext: "Direct to Society" },
    { label: "Tax Receipt", value: "Instant", subtext: "Student Ledger" },
  ];

  return (
    <main className="min-h-screen bg-surface pt-28 pb-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <PageHero
          badge={`${campaign.category} • ${campaign.organization.badge}`}
          badgeSubtext="All Initiatives"
          badgeHref="/campaigns"
          titleLead={campaign.title.split(":")[0]}
          titleHighlight={
            campaign.title.includes(":")
              ? campaign.title.split(":")[1]
              : campaign.organization.name
          }
          description={campaign.summary}
          stats={[
            {
              label: "Verified Society",
              value: campaign.organization.name,
              sublabel: "Union Escrow • 0% Rake",
              icon: "verified",
            },
            {
              label: "Milestone Progress",
              value: `${pct}% Funded ($${campaign.raisedAmount.toLocaleString()})`,
              sublabel: `${campaign.daysLeft} Days Remaining`,
              icon: "trending_up",
              accent: true,
            },
          ]}
        />
      </div>

      {/* 2. Main 8:4 Asymmetric Campaign Architecture */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 8 Columns: Media Mosaic, Specs, Narrative, Public Ledger & Field Updates */}
          <div className="lg:col-span-8 space-y-12">
            {/* 3-Image Hero Media Mosaic */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 relative aspect-[16/10] rounded-3xl overflow-hidden bg-surface-panel border border-border-default/60">
                <img
                  src={mosaicImages[0]}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-[11px] font-label-sm text-on-surface">
                  Primary Workshop & Telemetry View
                </span>
              </div>

              <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-surface-panel border border-border-default/60">
                  <img
                    src={mosaicImages[1]}
                    alt="Subsystem detail 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-surface-panel border border-border-default/60">
                  <img
                    src={mosaicImages[2]}
                    alt="Subsystem detail 2"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 4-Card Technical Specs Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {techSpecs.map((spec) => (
                <div
                  key={spec.label}
                  className="p-4 rounded-2xl bg-surface-canvas border border-border-default shadow-2xs"
                >
                  <p className="text-[10px] font-label-sm text-text-muted uppercase tracking-wider">
                    {spec.label}
                  </p>
                  <p className="font-mono text-base font-bold text-primary mt-1">
                    {spec.value}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {spec.subtext}
                  </p>
                </div>
              ))}
            </div>

            {/* Editorial Story & Pull Quote */}
            <div className="rounded-3xl bg-surface-canvas border border-border-default p-6 md:p-10 space-y-6">
              <div className="space-y-2">
                <span className="font-label-sm text-secondary uppercase tracking-widest text-xs">
                  Engineering & Mission Dossier
                </span>
                <h2 className="font-headline-lg text-on-surface">
                  Why This Student Initiative Matters
                </h2>
              </div>

              <p className="font-body-lg text-text-secondary leading-relaxed whitespace-pre-line">
                {campaign.story}
              </p>

              {campaign.pullQuote && (
                <blockquote className="p-6 rounded-2xl bg-surface-container-low/70 border-l-4 border-primary space-y-2">
                  <Quote className="w-5 h-5 text-secondary" />
                  <p className="font-serif italic text-lg md:text-xl text-on-surface leading-relaxed">
                    “{campaign.pullQuote.quote}”
                  </p>
                  <footer className="text-xs font-label-md text-text-secondary">
                    {campaign.pullQuote.attribution}
                  </footer>
                </blockquote>
              )}
            </div>

            {/* Public Fund Ledger & Milestone Table */}
            <div
              id="ledger"
              className="rounded-3xl bg-surface-canvas border border-border-default p-6 md:p-10 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-label-sm text-secondary uppercase tracking-widest text-xs flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Public Escrow Ledger
                  </span>
                  <h2 className="font-headline-lg text-on-surface mt-1">
                    Milestone Tranche Schedule & Budget
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-surface-soft border border-border-default font-mono text-xs text-text-secondary">
                  100% Ring-Fenced
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border-default text-text-muted font-mono uppercase">
                      <th className="py-3 pr-4">Budget Line Item</th>
                      <th className="py-3 px-4">Subsystem Scope</th>
                      <th className="py-3 px-4 text-right">Allocation</th>
                      <th className="py-3 pl-4 text-right">Escrow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default/60">
                    {campaign.budgetBreakdown.map((item, idx) => (
                      <tr key={item.category} className="hover:bg-surface-soft/60">
                        <td className="py-4 pr-4 font-semibold text-on-surface">
                          {item.category}
                        </td>
                        <td className="py-4 px-4 text-text-secondary">
                          {item.subtitle || item.phase || "Direct Procurement"}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-primary">
                          ${item.amount.toLocaleString()} ({item.percentage}%)
                        </td>
                        <td className="py-4 pl-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                              idx === 0
                                ? "bg-emerald-100 text-status-success"
                                : idx === 1
                                ? "bg-surface-container text-primary"
                                : "bg-surface-panel text-text-muted"
                            }`}
                          >
                            {item.status || (idx === 0 ? "RELEASED" : "IN ESCROW")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Field Engineering & Lab Updates Timeline */}
            {campaign.updates.length > 0 && (
              <div className="rounded-3xl bg-surface-canvas border border-border-default p-6 md:p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-secondary uppercase tracking-widest text-xs flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      Live Lab Dispatches
                    </span>
                    <h2 className="font-headline-lg text-on-surface mt-1">
                      Field Engineering Updates ({campaign.updates.length})
                    </h2>
                  </div>
                </div>

                <div className="space-y-8">
                  {campaign.updates.map((upd) => (
                    <div
                      key={upd.id}
                      className="relative pl-6 border-l-2 border-primary/30 space-y-3"
                    >
                      <span className="w-3 h-3 rounded-full bg-primary absolute -left-[7px] top-1.5 ring-4 ring-surface-canvas" />
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-primary">
                          {upd.date}
                        </span>
                        <span className="text-border-default">•</span>
                        <span className="text-text-secondary">
                          <strong className="text-on-surface">{upd.author}</strong>
                        </span>
                        {upd.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-surface-soft font-mono text-[10px] text-secondary">
                            {upd.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline-sm text-on-surface">
                        {upd.title}
                      </h3>
                      <p className="font-body-md text-text-secondary leading-relaxed">
                        {upd.content}
                      </p>

                      {upd.images && upd.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 pt-2">
                          {upd.images.map((img, i) => (
                            <div
                              key={i}
                              className="aspect-[4/3] rounded-2xl overflow-hidden bg-surface-panel border border-border-default/60"
                            >
                              <img
                                src={img}
                                alt={`${upd.title} photo ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right 4 Columns: Sticky Support Tier Selector + Dual-Impact Merch Cross-Sell */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* Live Escrow Funding Card */}
            <div className="rounded-3xl bg-surface-canvas border border-border-default p-6 space-y-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="font-serif text-3xl font-bold text-on-surface">
                      ${campaign.raisedAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-text-secondary block">
                      raised of ${campaign.goalAmount.toLocaleString()} target
                    </span>
                  </div>
                  <span className="font-mono text-lg font-bold text-secondary">
                    {pct}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-surface-panel overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-surface-soft">
                    <p className="text-text-muted flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" /> Backers
                    </p>
                    <p className="font-mono text-base font-bold text-on-surface mt-0.5">
                      {campaign.backersCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface-soft">
                    <p className="text-text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-secondary" /> Window
                    </p>
                    <p className="font-mono text-base font-bold text-on-surface mt-0.5">
                      {campaign.daysLeft} Days Left
                    </p>
                  </div>
                </div>
              </div>

              {/* Support Tier Selector */}
              <div className="space-y-3 pt-2 border-t border-border-default">
                <label className="font-label-sm text-[11px] text-text-muted uppercase tracking-wider block">
                  Select Backer Recognition Tier
                </label>

                <div className="space-y-2.5">
                  {campaign.tiers.map((tier) => {
                    const active =
                      selectedTierId === tier.id && !customAmount.trim();
                    return (
                      <div
                        key={tier.id}
                        onClick={() => {
                          setSelectedTierId(tier.id);
                          setCustomAmount("");
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          active
                            ? "bg-surface-container-low border-primary ring-1 ring-primary"
                            : "bg-surface-soft/70 hover:bg-surface-soft border-border-default"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-headline-sm text-sm text-on-surface">
                              {tier.title}
                            </span>
                            {tier.recommended && (
                              <span className="px-2 py-0.5 rounded-full bg-secondary text-white font-mono text-[9px] font-bold uppercase">
                                Popular
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-sm font-bold text-primary">
                            ${tier.amount}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                          {tier.description}
                        </p>
                        {tier.backerCount !== undefined && (
                          <p className="text-[10px] font-mono text-text-muted mt-2">
                            {tier.backerCount} student backers claimed
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom Micro-Grant Input */}
                <div className="pt-2">
                  <label className="text-[11px] font-label-sm text-text-muted uppercase block mb-1.5">
                    Or Enter Custom Escrow Grant ($)
                  </label>
                  <input
                    type="number"
                    min={5}
                    placeholder="Custom amount (e.g. 50)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft border border-border-default font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Pledge Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleBackCampaign(true)}
                  className="w-full py-4 px-5 rounded-full bg-primary hover:bg-primary-container text-white font-label-lg text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Back Initiative • ${effectivePledgeAmount.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleBackCampaign(false)}
                  className={`w-full py-2.5 px-4 rounded-full font-label-md text-xs border transition-all flex items-center justify-center gap-1.5 ${
                    pledgeAdded
                      ? "bg-status-success text-white border-status-success"
                      : "bg-surface-canvas hover:bg-surface-soft text-on-surface border-border-default"
                  }`}
                >
                  {pledgeAdded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Added to Combined Checkout Bag
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-secondary" />
                      Attach Grant to Bag & Keep Browsing
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-text-muted pt-1">
                <Lock className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>
                  PayPal Sandbox Escrow • Instant Student Union receipt
                </span>
              </div>
            </div>

            {/* Dual-Impact Merchandise Cross-Sell Card */}
            <div className="rounded-3xl bg-inverse-surface text-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-label-sm uppercase tracking-widest text-secondary-fixed">
                  Dual-Impact Merch
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/15 font-mono text-[10px]">
                  +28% to Campaign
                </span>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={linkedProduct.images[0]}
                  alt={linkedProduct.name}
                  className="w-20 h-24 rounded-2xl object-cover bg-surface-panel shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <Link
                    href={`/shop/${linkedProduct.id}`}
                    className="font-serif font-semibold text-base text-white hover:underline block truncate"
                  >
                    {linkedProduct.name}
                  </Link>
                  <p className="text-xs text-white/75 line-clamp-2">
                    Wear the official society release and fund this milestone simultaneously.
                  </p>
                  <p className="font-mono text-sm font-bold text-secondary-fixed pt-0.5">
                    ${linkedProduct.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddLinkedMerch}
                className={`w-full py-2.5 px-4 rounded-full font-label-md text-xs flex items-center justify-center gap-2 transition-colors ${
                  merchAdded
                    ? "bg-status-success text-white"
                    : "bg-white text-on-surface hover:bg-surface-soft"
                }`}
              >
                {merchAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Added {linkedProduct.name} to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                    Bundle Official Merch (${linkedProduct.price.toFixed(2)})
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

