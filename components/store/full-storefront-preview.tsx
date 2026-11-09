"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type Viewport = "desktop" | "tablet" | "mobile";

export function FullStorefrontPreview({
  previewUrl = "/demo?preview=1",
  title = "Campus Storefront",
}: {
  previewUrl?: string;
  title?: string;
}) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reloadIframe = () => {
    setKey((k) => k + 1);
  };

  const viewportWidthClass =
    viewport === "mobile"
      ? "w-[375px] max-w-full"
      : viewport === "tablet"
        ? "w-[768px] max-w-full"
        : "w-full";

  return (
    <div className="space-y-3 rounded-2xl border border-outline-variant/50 bg-surface-low/80 p-4 sm:p-5">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">
            devices
          </span>
          <div>
            <h4 className="text-label-md font-bold text-on-surface">
              {title} Live Preview
            </h4>
            <p className="text-[11px] text-on-surface-variant">
              Isolated user preview · Public storefront remains pristine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Switcher */}
          <div className="inline-flex rounded-xl border border-outline-variant/60 bg-surface-lowest p-1 gap-1">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              aria-label="Desktop view"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                viewport === "desktop"
                  ? "bg-primary text-on-primary shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                desktop_windows
              </span>
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              aria-label="Tablet view"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                viewport === "tablet"
                  ? "bg-primary text-on-primary shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                tablet_mac
              </span>
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              aria-label="Mobile view"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                viewport === "mobile"
                  ? "bg-primary text-on-primary shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                smartphone
              </span>
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={reloadIframe}
            aria-label="Reload preview"
            title="Reload storefront preview"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/60 bg-surface-lowest text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              refresh
            </span>
          </button>

          {/* Open in New Window */}
          <Link
            href={previewUrl}
            target="_blank"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-lowest px-3 text-xs font-semibold text-secondary hover:text-primary transition-colors"
          >
            <span>Open in Tab</span>
            <span className="material-symbols-outlined text-[13px]">
              open_in_new
            </span>
          </Link>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex justify-center bg-surface-container-lowest/80 rounded-xl p-2 sm:p-4 overflow-hidden border border-outline-variant/40">
        <div
          className={`${viewportWidthClass} transition-all duration-300 rounded-xl overflow-hidden border border-outline-variant/70 shadow-md bg-background`}
        >
          <iframe
            key={key}
            ref={iframeRef}
            src={previewUrl}
            title="Storefront Live Preview Frame"
            className="w-full h-[540px] border-none bg-background"
          />
        </div>
      </div>
    </div>
  );
}
