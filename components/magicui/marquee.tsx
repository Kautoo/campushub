import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: ReactNode;
  vertical?: boolean;
  /** Number of times the content is repeated to fill the track. */
  repeat?: number;
}

const MARQUEE_KEYFRAMES = `
@keyframes magicui-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - var(--gap)));
  }
}

@keyframes magicui-marquee-vertical {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-100% - var(--gap)));
  }
}
`;

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  style,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        className
      )}
      style={style}
    >
      <style>{MARQUEE_KEYFRAMES}</style>
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--gap)] [animation-duration:var(--duration)] [animation-iteration-count:infinite] [animation-timing-function:linear]",
            vertical
              ? "[animation-name:magicui-marquee-vertical]"
              : "[animation-name:magicui-marquee]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

export default Marquee;
