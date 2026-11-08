"use client";

import { GradientFlowButton, ShimmerAIButton } from "@/components/ui/kinetic-buttons";
import { useRouter } from "next/navigation";

/** Client CTA wrappers: HeroUI onPress handlers need a client boundary. */
export function GetStartedGradientButton({
  label = "Create free workspace",
  href = "/register",
}: {
  label?: string;
  href?: string;
}) {
  const router = useRouter();
  return (
    <GradientFlowButton onPress={() => router.push(href)}>
      {label}
    </GradientFlowButton>
  );
}

export function TryAiButton() {
  const router = useRouter();
  return (
    <ShimmerAIButton onPress={() => router.push("/register")}>
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
