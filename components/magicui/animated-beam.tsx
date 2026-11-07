"use client";

import { useEffect, useId, useState, type FC, type RefObject } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  /** Seconds per sweep. */
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export const AnimatedBeam: FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3,
  delay = 0,
  pathColor = "var(--st-border)",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "var(--st-gradient-a)",
  gradientStopColor = "var(--st-gradient-b)",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const gradientTransform = reverse ? "rotate(180)" : "rotate(0)";

  useEffect(() => {
    const updatePath = () => {
      const container = containerRef.current;
      const from = fromRef.current;
      const to = toRef.current;
      if (container && from && to) {
        const containerRect = container.getBoundingClientRect();
        const rectFrom = from.getBoundingClientRect();
        const rectTo = to.getBoundingClientRect();

        const x1 =
          rectFrom.left - containerRect.left + rectFrom.width / 2 + startXOffset;
        const y1 =
          rectFrom.top - containerRect.top + rectFrom.height / 2 + startYOffset;
        const x2 =
          rectTo.left - containerRect.left + rectTo.width / 2 + endXOffset;
        const y2 =
          rectTo.top - containerRect.top + rectTo.height / 2 + endYOffset;

        const controlX = (x1 + x2) / 2;
        const controlY = reverse
          ? Math.min(y1, y2) - Math.abs(y1 - y2) * curvature
          : Math.max(y1, y2) + Math.abs(y1 - y2) * curvature;

        setPathD(`M ${x1},${y1} Q ${controlX},${controlY} ${x2},${y2}`);
        setSvgDimensions({
          width: containerRect.width,
          height: containerRect.height,
        });
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const _ of entries) updatePath();
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    updatePath();

    return () => resizeObserver.disconnect();
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    reverse,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute top-0 left-0 transform-gpu stroke-2",
        className
      )}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        stroke={`url(#${id})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={{
            x1: ["0%", "100%"],
            x2: ["0%", "100%"],
            y1: ["0%", "100%"],
            y2: ["0%", "100%"],
          }}
          transition={{ delay, duration, ease: "easeInOut", repeat: Infinity }}
          gradientTransform={gradientTransform}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
};

export default AnimatedBeam;
