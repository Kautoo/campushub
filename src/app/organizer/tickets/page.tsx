"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/react-bits";

interface TicketTier {
  id: string;
  name: string;
  price: number;
  capacity: number;
  issued: number;
  rollingInterval: number; // seconds
  walletSync: boolean;
  maxPerStudent: number;
}

const INITIAL_TIERS: TicketTier[] = [
  {
    id: "tier_general",
    name: "Student General Admission",
    price: 0,
    capacity: 200,
    issued: 142,
    rollingInterval: 30,
    walletSync: true,
    maxPerStudent: 1,
  },
  {
    id: "tier_vip",
    name: "VIP Keynote + Flight Cage Demo",
    price: 15,
    capacity: 50,
    issued: 38,
    rollingInterval: 15,
    walletSync: true,
    maxPerStudent: 1,
  },
  {
    id: "tier_early",
    name: "Early Bird Builders Pass",
    price: 8,
    capacity: 75,
    issued: 64,
    rollingInterval: 30,
    walletSync: true,
    maxPerStudent: 2,
  },
];

export default function OrganizerTicketsPage() {
  const [tiers, setTiers] = useState<TicketTier[]>(INITIAL_TIERS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const updateTier = (id: string, updates: Partial<TicketTier>) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleAddTier = () => {
    const newTier: TicketTier = {
      id: `tier_${Date.now()}`,
      name: "New Ticket Tier",
      price: 10,
      capacity: 50,
      issued: 0,
      rollingInterval: 30,
      walletSync: true,
      maxPerStudent: 1,
    };
    setTiers((prev) => [...prev, newTier]);
  };

  const handleDeleteTier = (id: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2800);
  };

  const totalCapacity = tiers.reduce((acc, t) => acc + t.capacity, 0);
  const totalIssued = tiers.reduce((acc, t) => acc + t.issued, 0);
  const projectedRevenue = tiers.reduce((acc, t) => acc + t.issued * t.price, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/25">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary font-label mb-1">
            <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
            <span>Ticketing &amp; Access Controls</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
            Passes &amp; Ticket Tiers
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Configure student free access, VIP pricing, capacity quotas, and rolling Dynamic QR security rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleAddTier}
            className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Ticket Tier</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Save Rules</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-secondary-container/40 border border-secondary/30 text-on-secondary-fixed text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
          <span>Ticketing quotas, pricing tiers, and rolling QR encryption rules updated!</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
            Total Capacity Quota
          </span>
          <div className="text-2xl font-extrabold text-on-surface font-headline">
            {totalCapacity} passes
          </div>
          <p className="text-xs text-on-surface-variant">Across {tiers.length} active tiers</p>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
            Issued Passes
          </span>
          <div className="text-2xl font-extrabold text-primary font-headline">
            {totalIssued} / {totalCapacity}
          </div>
          <p className="text-xs text-secondary font-semibold">
            {Math.round((totalIssued / Math.max(1, totalCapacity)) * 100)}% claimed
          </p>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-label">
            Treasury Gross
          </span>
          <div className="text-2xl font-extrabold text-on-surface font-headline">
            ${projectedRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-primary font-mono font-bold">0% university fee</p>
        </SpotlightCard>
      </div>

      {/* Tiers List */}
      <div className="space-y-4">
        {tiers.map((tier, idx) => (
          <div
            key={tier.id}
            className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                    className="font-headline font-extrabold text-base text-on-surface bg-transparent border-b border-transparent hover:border-outline-variant/40 focus:border-primary focus:outline-none px-1 py-0.5"
                  />
                  <span className="text-[11px] text-outline font-mono block px-1">
                    ID: {tier.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed">
                  {tier.issued} / {tier.capacity} Claimed
                </span>
                {tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTier(tier.id)}
                    className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-surface-container transition-colors"
                    title="Delete tier"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tier Parameter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1">
                  Ticket Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-outline">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={tier.price}
                    onChange={(e) =>
                      updateTier(tier.id, { price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono font-bold text-on-surface"
                  />
                </div>
                <span className="text-[10px] text-outline font-mono mt-1 block">
                  {tier.price === 0 ? "Free General Student" : "PayPal Sandbox checkout"}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1">
                  Total Capacity Cap
                </label>
                <input
                  type="number"
                  min="1"
                  value={tier.capacity}
                  onChange={(e) =>
                    updateTier(tier.id, {
                      capacity: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono font-bold text-on-surface"
                />
                <span className="text-[10px] text-outline font-mono mt-1 block">
                  {tier.capacity - tier.issued} remaining
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1">
                  Rolling QR Interval
                </label>
                <select
                  value={tier.rollingInterval}
                  onChange={(e) =>
                    updateTier(tier.id, {
                      rollingInterval: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface"
                >
                  <option value={15}>15 seconds (High Security)</option>
                  <option value={30}>30 seconds (Standard)</option>
                  <option value={60}>60 seconds (Relaxed)</option>
                </select>
                <span className="text-[10px] text-outline font-mono mt-1 block">
                  Anti-screenshot token refresh
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1">
                  Limit Per Student
                </label>
                <select
                  value={tier.maxPerStudent}
                  onChange={(e) =>
                    updateTier(tier.id, {
                      maxPerStudent: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface"
                >
                  <option value={1}>1 pass per Student ID</option>
                  <option value={2}>2 passes (+1 Guest)</option>
                </select>
                <span className="text-[10px] text-outline font-mono mt-1 block">
                  Enforced via institutional SSO
                </span>
              </div>
            </div>

            {/* Apple/Google Wallet Sync Checkbox */}
            <div className="pt-2 flex items-center justify-between text-xs text-on-surface-variant">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={tier.walletSync}
                  onChange={(e) =>
                    updateTier(tier.id, { walletSync: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-primary border-outline-variant/40 focus:ring-primary"
                />
                <span className="font-semibold text-on-surface">
                  Auto-generate Apple Wallet &amp; Google Wallet dynamic passes
                </span>
              </label>
              <span className="text-[11px] font-mono text-secondary font-bold">
                HMAC-SHA256 Encrypted
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

