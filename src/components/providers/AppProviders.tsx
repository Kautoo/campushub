"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { BagProvider } from "@/context/BagContext";
import { IntroProvider } from "@/context/IntroContext";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { RouteTransition } from "@/components/navigation/RouteTransition";

function AmbientGreenAura() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-secondary-container/20 rounded-full blur-[110px]" />
      <div className="absolute top-[38%] -right-40 w-[480px] h-[480px] bg-primary-fixed/12 rounded-full blur-[130px]" />
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
        <RouteTransition>
          {children}
        </RouteTransition>
        {!isOrganizerWorkspace && <Footer />}
      </div>
    </>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BagProvider>
      <IntroProvider>
        <Suspense fallback={<div className="min-h-screen bg-surface" />}>
          <NavigationWrapper>{children}</NavigationWrapper>
        </Suspense>
      </IntroProvider>
    </BagProvider>
  );
}
