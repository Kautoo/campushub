"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ParticlesProps {
  className?: string;
  quantity?: number;
  /** Lower staticity = stronger pull toward the pointer. */
  staticity?: number;
  ease?: number;
  size?: number;
  /** CSS color, including `var(--token)` — resolved at mount. */
  color?: string;
  vx?: number;
  vy?: number;
  refresh?: boolean;
}

interface Circle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
}

function hexToRgb(hex: string): number[] | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  const int = parseInt(h, 16);
  if (Number.isNaN(int)) return null;
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/** Resolve any CSS color (hex, rgb(), or var(--token)) to "r, g, b". */
function colorToRgbChannels(color: string): string {
  const value = color.trim();
  if (value.startsWith("var(")) {
    const name = value
      .slice(value.indexOf("(") + 1, value.indexOf(")"))
      .split(",")[0]
      .trim();
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    if (resolved) return colorToRgbChannels(resolved);
    return "125, 211, 252";
  }
  if (value.startsWith("#")) {
    const rgb = hexToRgb(value);
    if (rgb) return rgb.join(", ");
  }
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (match) {
    return match[1]
      .split(",")
      .slice(0, 3)
      .map((part) => part.trim())
      .join(", ");
  }
  return "125, 211, 252";
}

function remapValue(
  value: number,
  start1: number,
  end1: number,
  start2: number,
  end2: number
) {
  const remapped =
    ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
  return remapped > 0 ? remapped : 0;
}

export function Particles({
  className,
  quantity = 80,
  staticity = 50,
  ease = 50,
  size = 0.4,
  color = "var(--st-primary)",
  vx = 0,
  vy = 0,
  refresh = false,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const circlesRef = useRef<Circle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const rgbChannelsRef = useRef("125, 211, 252");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    contextRef.current = ctx;
    rgbChannelsRef.current = colorToRgbChannels(color);

    const resizeCanvas = () => {
      if (!container || !canvas || !ctx) return;
      circlesRef.current = [];
      canvasSizeRef.current.w = container.offsetWidth;
      canvasSizeRef.current.h = container.offsetHeight;
      canvas.width = canvasSizeRef.current.w * dpr;
      canvas.height = canvasSizeRef.current.h * dpr;
      canvas.style.width = `${canvasSizeRef.current.w}px`;
      canvas.style.height = `${canvasSizeRef.current.h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const circleParams = (): Circle => {
      const canvasSize = canvasSizeRef.current;
      return {
        x: Math.floor(Math.random() * canvasSize.w),
        y: Math.floor(Math.random() * canvasSize.h),
        translateX: 0,
        translateY: 0,
        size: Math.floor(Math.random() * 2) + size,
        alpha: 0,
        targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(2)),
        dx: (Math.random() - 0.5) * 0.1,
        dy: (Math.random() - 0.5) * 0.1,
        magnetism: 0.1 + Math.random() * 4,
      };
    };

    const drawCircle = (circle: Circle, update = false) => {
      if (!ctx) return;
      const { x, y, translateX, translateY, size: s, alpha } = circle;
      ctx.translate(translateX, translateY);
      ctx.beginPath();
      ctx.arc(x, y, s, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${rgbChannelsRef.current}, ${alpha})`;
      ctx.fill();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!update) circlesRef.current.push(circle);
    };

    const clearContext = () => {
      if (ctx) ctx.clearRect(0, 0, canvasSizeRef.current.w, canvasSizeRef.current.h);
    };

    const animateParticles = () => {
      clearContext();
      const canvasSize = canvasSizeRef.current;
      const mouse = mouseRef.current;
      circlesRef.current.forEach((circle, i) => {
        // Alpha fade-in.
        const edge = [
          circle.x + circle.translateX - circle.size,
          canvasSize.w - circle.x - circle.translateX - circle.size,
          circle.y + circle.translateY - circle.size,
          canvasSize.h - circle.y - circle.translateY - circle.size,
        ];
        const closestEdge = edge.reduce((a, b) => Math.min(a, b));
        const remapClosestEdge = parseFloat(
          remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
        );
        if (remapClosestEdge > 1) {
          circle.alpha += 0.02;
          if (circle.alpha > circle.targetAlpha)
            circle.alpha = circle.targetAlpha;
        } else {
          circle.alpha = circle.targetAlpha * remapClosestEdge;
        }
        circle.x += circle.dx + vx;
        circle.y += circle.dy + vy;
        // Pointer magnetism.
        circle.translateX +=
          (mouse.x / (staticity / circle.magnetism) - circle.translateX) / ease;
        circle.translateY +=
          (mouse.y / (staticity / circle.magnetism) - circle.translateY) / ease;

        drawCircle(circle, true);

        // Recycle circles that leave the canvas.
        if (
          circle.x < -circle.size ||
          circle.x > canvasSize.w + circle.size ||
          circle.y < -circle.size ||
          circle.y > canvasSize.h + circle.size
        ) {
          circlesRef.current.splice(i, 1);
          drawCircle(circleParams());
        }
      });
      rafRef.current = window.requestAnimationFrame(animateParticles);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - canvasSizeRef.current.w / 2;
      const y = event.clientY - rect.top - canvasSizeRef.current.h / 2;
      const inside =
        x < canvasSizeRef.current.w / 2 &&
        x > -canvasSizeRef.current.w / 2 &&
        y < canvasSizeRef.current.h / 2 &&
        y > -canvasSizeRef.current.h / 2;
      if (inside) {
        mouseRef.current.x = x * dpr;
        mouseRef.current.y = y * dpr;
      }
    };

    resizeCanvas();
    for (let i = 0; i < quantity; i++) drawCircle(circleParams());
    rafRef.current = window.requestAnimationFrame(animateParticles);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      circlesRef.current = [];
    };
  }, [color, quantity, size, ease, staticity, vx, vy, refresh]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default Particles;
