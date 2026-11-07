"use client";

import { Button } from "@heroui/react";
import { cn } from "@/lib/utils";

/**
 * Kinetic CTA trio from the Stitch "MagicUI Trio" spec.
 * - PayPalButton: pulse aura, PayPal blue #0070BA
 * - ShimmerAIButton: teal shimmer sweep for AI actions
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
        "bg-[var(--st-paypal)] hover:brightness-110",
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
        "animate-shimmer h-11 px-6 text-label-lg font-semibold text-[#00201c]",
        "bg-[linear-gradient(110deg,var(--st-primary),var(--st-gradient-a),var(--st-primary))]",
        "border border-primary/40 shadow-glow hover:brightness-105",
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
        "hover:brightness-110",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
