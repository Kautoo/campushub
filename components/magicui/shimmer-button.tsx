import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends ComponentProps<"button"> {
  /** Color of the sweeping highlight. */
  shimmerColor?: string;
  /** Base button color. */
  background?: string;
  /** Width of the highlight band relative to the button, e.g. "125%". */
  spread?: string;
  /** Seconds for one full sweep. */
  duration?: number;
}

const SHIMMER_KEYFRAMES = `
@keyframes magicui-shimmer-sweep {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
`;

export function ShimmerButton({
  children,
  className,
  shimmerColor = "var(--st-secondary-fixed-dim)",
  background = "var(--st-primary)",
  spread = "125%",
  duration = 5,
  type = "button",
  style,
  ...props
}: ShimmerButtonProps) {
  return (
    <>
      <style>{SHIMMER_KEYFRAMES}</style>
      <button
        type={type}
        {...props}
        className={cn(
          "focus-aura relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity disabled:pointer-events-none disabled:opacity-60",
          className
        )}
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-background": background,
            "--shimmer-spread": spread,
            "--shimmer-duration": `${duration}s`,
            color: "var(--st-background)",
            backgroundImage:
              "linear-gradient(110deg, var(--shimmer-background) calc(50% - var(--shimmer-spread) / 4), var(--shimmer-color) 50%, var(--shimmer-background) calc(50% + var(--shimmer-spread) / 4))",
            backgroundSize: "250% 100%",
            backgroundRepeat: "no-repeat",
            animation:
              "magicui-shimmer-sweep var(--shimmer-duration, 5s) linear infinite",
            ...style,
          } as CSSProperties
        }
      >
        {children}
      </button>
    </>
  );
}

export default ShimmerButton;
