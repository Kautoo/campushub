"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "ch-cookie-consent";

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted" || stored === "declined") return;

    // Slide in shortly after mount once we know consent is still needed.
    const timer = window.setTimeout(() => setVisible(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const decide = (value: "accepted" | "declined") => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  // Render nothing until mounted (avoid SSR mismatch) and never again once a
  // choice has been stored.
  if (!mounted || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className={`bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md fixed z-50 rounded-2xl border border-outline-variant bg-surface-lowest p-5 shadow-xl transition-[transform,opacity] duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none"
      }`}
    >
      <h2 className="text-headline-sm text-ink">Cookies on CampusHub</h2>
      <p className="text-muted text-body-sm mt-2">
        We use a single first-party cookie to remember your theme and session.
        No tracking, no ads, no third-party analytics.{" "}
        <Link href="/privacy" className="link-draw text-primary">
          Cookie &amp; privacy policy
        </Link>
      </p>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => decide("accepted")}
          className="btn-step bg-primary text-white dark:text-[#00201c] focus-aura inline-flex h-11 items-center rounded-full px-6 text-label-md font-semibold"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => decide("declined")}
          className="btn-step border-outline-variant text-ink focus-aura inline-flex h-11 items-center rounded-full border px-6 text-label-md font-semibold hover:bg-surface-low"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

export { CookieConsent };
