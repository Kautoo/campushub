"use client";

import { Button } from "@heroui/react";
import { cn } from "@/lib/utils";

/**
 * Kinetic CTA trio from the Stitch "MagicUI Trio" spec.
 * - PayPalButton: pulse aura, PayPal blue #0070BA
 * - ShimmerAIButton: high-contrast teal-navy gradient shimmer for AI actions with crisp white text
 * - GradientFlowButton: kinetic gradient flow
 * All accept HeroUI Button props via onPress.
 */

export function PayPalButton({
  children = "Pay with PayPal",
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "animate-pulse-aura h-11 px-6 text-label-lg font-semibold text-white",
        "bg-[#0070BA] hover:bg-[#005ea6] shadow-sm hover:shadow-md transition-all",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export function ShimmerAIButton({
  children = "Generate insights",
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "h-11 px-6 text-label-md font-semibold text-white",
        "bg-gradient-to-r from-[#00162e] via-[#005a50] to-[#00162e] dark:from-[#142b45] dark:via-[#007567] dark:to-[#142b45]",
        "border border-secondary/40 shadow-xs hover:border-secondary hover:shadow-md active:scale-[0.98] transition-all",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export function GradientFlowButton({
  children = "Get started",
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "animate-gradient-flow bg-gradient-kinetic h-11 px-6 text-label-lg font-semibold text-white",
        "hover:brightness-110 shadow-sm hover:shadow-md transition-all",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
