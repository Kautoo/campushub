"use client";

import React, { Suspense } from "react";
import { BagProvider } from "@/context/BagContext";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { usePathname } from "next/navigation";
import FadeContent from "@/components/ui/FadeContent";

function AmbientGreenAura() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none"
    >
      {/* Soft Chartreuse / Light Olive Orb 1 (Top-Right / Center Orbit) */}
      <div
        className="ambient-orb-1 absolute -top-[8%] -right-[6%] w-[640px] h-[640px] rounded-full opacity-20 blur-[110px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 45% 45%, #cbef92 0%, #83a350 50%, transparent 75%)",
        }}
      />

      {/* Soft Academic Moss / Forest Orb 2 (Mid-Left Floating Orbit) */}
      <div
        className="ambient-orb-2 absolute top-[35%] -left-[8%] w-[700px] h-[700px] rounded-full opacity-[0.15] blur-[130px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #b0d279 0%, #4b671b 45%, transparent 75%)",
        }}
      />

      {/* Third Ambient Center-Low Pulse for balanced glow */}
      <div
        className="ambient-orb-1 absolute bottom-[-10%] right-[20%] w-[520px] h-[520px] rounded-full opacity-10 blur-[100px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #c1ee78 0%, #556341 50%, transparent 70%)",
        }}
      />
    </div>
  );
}

function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOrganizerWorkspace = pathname?.startsWith("/organizer") ?? false;

  return (
    <>
      <AmbientGreenAura />
      {!isOrganizerWorkspace && <Header />}
      <div className={!isOrganizerWorkspace ? "min-h-screen flex flex-col" : ""}>
        <FadeContent
          key={pathname}
          trigger="mount"
          effect="focus"
          blur={6}
          duration={0.65}
          ease="power2.out"
          className="flex-1 flex flex-col"
        >
          {children}
        </FadeContent>
        {!isOrganizerWorkspace && <Footer />}
      </div>
    </>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BagProvider>
      <Suspense fallback={<div className="min-h-screen bg-surface" />}>
        <NavigationWrapper>{children}</NavigationWrapper>
      </Suspense>
    </BagProvider>
  );
}
