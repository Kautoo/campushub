"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface AnimatedGridPatternProps
  extends ComponentPropsWithoutRef<"svg"> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  numSquares?: number;
  maxOpacity?: number;
  /** Seconds for one appear/drift/disappear cycle of a square. */
  duration?: number;
  /** Seconds to pause between cycles. */
  repeatDelay?: number;
}

interface Square {
  id: number;
  x: number;
  y: number;
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  numSquares = 30,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [squares, setSquares] = useState<Square[]>([]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    setSquares(
      Array.from({ length: numSquares }, (_, i) => ({
        id: i,
        x: Math.floor((Math.random() * dimensions.width) / width) * width,
        y: Math.floor((Math.random() * dimensions.height) / height) * height,
      }))
    );
  }, [dimensions, numSquares, width, height]);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full stroke-current",
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
          x={x}
          y={y}
        >
          <path
            d={`M ${width} 0 L 0 0 0 ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      {squares.map((square, index) => (
        <motion.rect
          key={`${square.x}-${square.y}-${square.id}-${id}`}
          x={square.x + 0.5}
          y={square.y + 0.5}
          width={width - 1}
          height={height - 1}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ opacity: 0, strokeDashoffset: 0 }}
          animate={{ opacity: [0, maxOpacity, 0], strokeDashoffset: [0, -16] }}
          transition={{
            duration,
            repeat: Infinity,
            delay: index * 0.4,
            repeatDelay,
            ease: "linear",
          }}
        />
      ))}
    </svg>
  );
}

export default AnimatedGridPattern;
