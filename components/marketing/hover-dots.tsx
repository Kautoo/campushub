"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive dot field: a calm grid of dots that brighten, scale, and
 * gently repel around the pointer — the premium hover-background pattern.
 * Idle state is a soft breathing wave. Reduced motion → static grid.
 * One canvas, rAF-batched, pauses when scrolled away or tab hidden.
 */
export default function HoverDots({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let dots: { x: number; y: number }[] = [];
    const GAP = 26;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = GAP / 2; y < height; y += GAP) {
        for (let x = GAP / 2; x < width; x += GAP) {
          dots.push({ x, y });
        }
      }
    };
    resize();

    // Pointer in canvas-local coords
    const pointer = { x: -9999, y: -9999, active: false };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
    });
    io.observe(canvas);

    // Colors resolved from the live theme tokens
    const css = getComputedStyle(document.documentElement);
    const baseRGB = css.getPropertyValue("--st-outline-variant").trim() || "#c4c6ce";
    const accentRGB = css.getPropertyValue("--st-primary").trim() || "#2dd4bf";

    const hexToRgb = (c: string): [number, number, number] => {
      const m = c.trim().match(/^#([0-9a-f]{6})$/i);
      if (m) {
        const n = parseInt(m[1], 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      }
      return [148, 163, 184];
    };
    const [br, bg, bb] = hexToRgb(baseRGB);
    const [ar, ag, ab] = hexToRgb(accentRGB);

    const INFLUENCE = 150;
    let raf = 0;
    let last = performance.now();
    let time = 0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(50, now - last);
      last = now;
      if (!visible || document.hidden) return;
      if (!reduced) time += dt / 1000;

      ctx.clearRect(0, 0, width, height);
      for (const d of dots) {
        // idle breathing wave
        const idle = reduced
          ? 0
          : (Math.sin(d.x * 0.02 + time * 0.8) + Math.cos(d.y * 0.02 + time * 0.6)) * 0.5;

        // pointer influence: distance-based brighten + scale
        let influence = 0;
        let dx = 0;
        let dy = 0;
        if (pointer.active) {
          const dist = Math.hypot(d.x - pointer.x, d.y - pointer.y);
          influence = Math.max(0, 1 - dist / INFLUENCE);
          influence *= influence; // ease
          if (influence > 0) {
            const push = influence * 4;
            dx = ((d.x - pointer.x) / (dist || 1)) * push;
            dy = ((d.y - pointer.y) / (dist || 1)) * push;
          }
        }

        const alpha = 0.22 + idle * 0.08 + influence * 0.7;
        const r = 1 + idle * 0.3 + influence * 1.8;
        const rr = Math.round(br + (ar - br) * influence);
        const rg = Math.round(bg + (ag - bg) * influence);
        const rb = Math.round(bb + (ab - bb) * influence);

        ctx.beginPath();
        ctx.arc(d.x + dx, d.y + dy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rr},${rg},${rb},${Math.min(1, alpha)})`;
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`block h-full w-full ${className ?? ""}`}
    />
  );
}
