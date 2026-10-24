"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FastPassModal } from "@/components/ui/react-bits";
import { cn } from "@/lib/utils";

const ORGANIZER_NAV = [
  {
    href: "/organizer",
    label: "Dashboard & Telemetry",
    icon: "dashboard",
    badge: "Live",
  },
  {
    href: "/organizer/events",
    label: "Event Manager & Editor",
    icon: "event_note",
  },
  {
    href: "/organizer/tickets",
    label: "Passes & Ticket Tiers",
    icon: "confirmation_number",
  },
  {
    href: "/organizer/lockers",
    label: "Smart Locker Queue",
    icon: "inventory_2",
  },
  {
    href: "/organizer/scanner",
    label: "Gate Turnstile Scanner",
    icon: "qr_code_scanner",
    badge: "Active",
  },
];

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [testPassOpen, setTestPassOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isLinkActive = (href: string) => {
    if (href === "/organizer") {
      return pathname === "/organizer";
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row text-on-surface font-body antialiased selection:bg-secondary-container selection:text-on-secondary-fixed">
      {/* 1. SYNCED LEFT SIDEBAR */}
      <aside className="w-full lg:w-72 bg-surface-container-lowest border-b lg:border-b-0 lg:border-r border-outline-variant/30 flex flex-col justify-between shrink-0 z-30">
        <div>
          {/* Brand & Studio Title */}
          <div className="p-5 sm:p-6 border-b border-outline-variant/20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  school
                </span>
              </div>
              <div>
                <span className="font-headline text-base font-extrabold tracking-tight block text-on-surface leading-tight">
                  CampusHub
                </span>
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest block">
                  Organizer Studio
                </span>
              </div>
            </Link>

            {/* Mobile Nav Toggle */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                {mobileNavOpen ? "close" : "menu"}
              </span>
            </button>
          </div>

          {/* Quick Create Action */}
          <div className="p-4 sm:p-5 border-b border-outline-variant/15">
            <Link
              href="/organizer/events"
              className="w-full py-2.5 px-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>+ Create Campus Event</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav
            className={cn(
              "p-3 sm:p-4 space-y-1 text-xs",
              mobileNavOpen ? "block" : "hidden lg:block"
            )}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-outline font-label">
              Management Console
            </div>

            {ORGANIZER_NAV.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer",
                    active
                      ? "bg-secondary-container/40 text-on-secondary-fixed border border-secondary/25 shadow-2xs font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "material-symbols-outlined text-[19px]",
                        active ? "text-primary" : "text-outline"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider",
                        active
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-on-surface-variant"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-outline font-label">
              External Logistics
            </div>

            <Link
              href="/clubs"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[19px] text-outline">
                groups
              </span>
              <span>Clubs &amp; Societies</span>
            </Link>

            <Link
              href="/map"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[19px] text-outline">
                map
              </span>
              <span>Venue Logistics Map</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Treasury & Return to Main Site */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/20 space-y-3">
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary font-bold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>OFFICER CHAPTER LEDGER</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              0.00% university platform fee. Payouts settle automatically to Student Union accounts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTestPassOpen(true)}
              className="w-full py-2 px-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface font-headline font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-primary">qr_code_2</span>
              <span>Test Pass</span>
            </button>
            <Link
              href="/"
              className="w-full py-2 px-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface font-headline font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Exit Studio</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Sticky Bar */}
        <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-outline-variant/25 px-6 md:px-10 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono font-semibold text-on-surface-variant">
              Turnstiles Synced • IEEE Chapter Active • Canvas Timetable Live
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTestPassOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-sm text-primary">qr_code_scanner</span>
              <span>Preview Pass</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-10 py-8">
          {children}
        </main>
      </div>

      {/* Global Redesigned Pass Modal */}
      <FastPassModal
        isOpen={testPassOpen}
        onClose={() => setTestPassOpen(false)}
        title="Autonomous Drone Swarm & Neural SLAM Workshop"
        subtitle="NOV 14, 2025 • 5:00 PM"
        passCode="CH-8821-94A-QR"
        studentName="Alex Rivera"
        studentId="#STU-882194"
        location="Huang Engineering Amphitheater • Gate B"
      />
    </div>
  );
}

