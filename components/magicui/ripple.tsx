import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface RippleProps {
  className?: string;
  numRipples?: number;
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  mainCircleScale?: number;
  color?: string;
}

const RIPPLE_KEYFRAMES = `
@keyframes magicui-ripple-pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(0.9);
  }
}
`;

export function Ripple({
  className,
  numRipples = 3,
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  mainCircleScale = 0.8,
  color = "var(--st-primary)",
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        className
      )}
    >
      <style>{RIPPLE_KEYFRAMES}</style>
      {Array.from({ length: numRipples }, (_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 rounded-full border"
          style={
            {
              width: mainCircleSize,
              height: mainCircleSize,
              backgroundColor: color,
              borderColor: color,
              opacity: mainCircleOpacity,
              transform: `translate(-50%, -50%) scale(${1 + i * mainCircleScale})`,
              animation: `magicui-ripple-pulse 3s ease-in-out ${i * 0.6}s infinite`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default Ripple;
