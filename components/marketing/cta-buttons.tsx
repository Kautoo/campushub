"use client";

import { GradientFlowButton, ShimmerAIButton } from "@/components/ui/kinetic-buttons";

/** Client CTA wrappers: HeroUI onPress handlers need a client boundary. */
export function GetStartedGradientButton({
  label = "Create free workspace",
  href = "/register",
}: {
  label?: string;
  href?: string;
}) {
  return (
    <GradientFlowButton onPress={() => (window.location.href = href)}>
      {label}
    </GradientFlowButton>
  );
}

export function TryAiButton() {
  return (
    <ShimmerAIButton onPress={() => (window.location.href = "/register")}>
      Try AI insights
    </ShimmerAIButton>
  );
}

export function PayPalLink() {
  return (
    <a
      href="/demo"
      className="animate-pulse-aura bg-[var(--st-paypal)] hidden h-11 items-center rounded-full px-6 text-label-lg font-semibold text-white hover:brightness-110 sm:inline-flex"
    >
      Pay with PayPal
    </a>
  );
}
