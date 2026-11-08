"use client";

import dynamic from "next/dynamic";

// Canvas is browser-only; lazy-load so it never blocks first paint.
const HoverDots = dynamic(() => import("./hover-dots"), {
  ssr: false,
  loading: () => null,
});

export default HoverDots;
