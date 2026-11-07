"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

export interface GlobeProps {
  className?: string;
  globeColor?: string;
  baseColor?: string;
  markerColor?: string;
  markers?: { location: [number, number]; size: number }[];
}

const DEFAULT_MARKERS: { location: [number, number]; size: number }[] = [
  { location: [3.139, 101.686], size: 0.08 }, // Kuala Lumpur
];

/** Hex color -> cobe's [r, g, b] (0..1) format. */
function hexToRgb01(hex: string): [number, number, number] {
  const int = parseInt(hex.replace("#", ""), 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

export function Globe({
  className,
  globeColor = "#2dd4bf",
  baseColor = "#0b1326",
  markerColor = "#f8fafb",
  markers = DEFAULT_MARKERS,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let phi = 0.3;
    let width = canvas.offsetWidth || 600;

    const onResize = () => {
      width = canvas.offsetWidth || width;
    };
    window.addEventListener("resize", onResize);

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: hexToRgb01(baseColor),
      markerColor: hexToRgb01(markerColor),
      glowColor: hexToRgb01(globeColor),
      markers,
    });

    // cobe v2 animates via update(); phi never advances under reduced motion.
    let raf = 0;
    const render = () => {
      if (!reducedMotion) phi += 0.005;
      globe.update({ phi, width: width * 2, height: width * 2 });
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [globeColor, baseColor, markerColor, markers]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("size-full [contain:layout_paint_size]", className)}
      style={
        {
          width: "100%",
          height: "100%",
          aspectRatio: "1",
          pointerEvents: "none",
        } as CSSProperties
      }
    />
  );
}

export default Globe;
