"use client";

import dynamic from "next/dynamic";
import type { GlobeProps } from "./globe";

export type { GlobeProps } from "./globe";

// cobe renders via canvas + rAF; browser-only. Lazy-load it so the WebGL
// bundle never blocks first paint, and keep the landing page server-rendered.
// ssr:false requires a client wrapper.
const Globe = dynamic(() => import("./globe").then((m) => m.Globe), {
  ssr: false,
  loading: () => <div className="mx-auto h-72 w-72" aria-hidden="true" />,
});

export default Globe;
