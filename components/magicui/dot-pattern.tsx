import { useId, type SVGProps } from "react";
import { cn } from "@/lib/utils";

export interface DotPatternProps extends SVGProps<SVGSVGElement> {
  /** Horizontal gap between dot centers. */
  width?: number;
  /** Vertical gap between dot centers. */
  height?: number;
  cx?: number;
  cy?: number;
  /** Dot radius. */
  cr?: number;
}

export function DotPattern({
  width = 20,
  height = 20,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-current",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <circle cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}

export default DotPattern;
