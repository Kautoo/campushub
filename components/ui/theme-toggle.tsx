"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Theme toggle: flips `data-theme` on <html> and persists to a cookie
 * that the root layout's inline script reads before paint.
 */
export function ThemeToggle({ className }: { className?: string }) {
  // Read the DOM (external system) lazily on first client render so the
  // effect body stays a pure sync — no setState-in-effect cascade.
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light",
  );

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    document.cookie = `ch-theme=${next};path=/;max-age=31536000;samesite=lax`;
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className={cn(
        "focus-aura inline-flex h-9 w-9 items-center justify-center rounded-full",
        "border border-outline-variant bg-surface-lowest text-ink-variant",
        "transition-colors hover:bg-surface-container",
        className,
      )}
    >
      <span className="material-symbols-outlined text-[18px]">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
