"use client";

import dynamic from "next/dynamic";

// WebGL canvas is browser-only; lazy-load so it never blocks first paint.
// ssr:false requires a client wrapper.
const HeroBackground = dynamic(() => import("./hero-background"), {
  ssr: false,
  loading: () => null,
});

export default HeroBackground;
