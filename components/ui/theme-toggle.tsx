"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Theme toggle: flips `data-theme` on <html> and persists to both
 * localStorage and cookie (`ch-theme`) so the root layout's inline script
 * reads it before paint, keeping all subpages (storefront & dashboard) in sync.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Initial sync with DOM or storage
    const current =
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    setTheme(current);

    const handleSync = () => {
      const active =
        typeof document !== "undefined" &&
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "dark"
          : "light";
      setTheme(active);
    };

    window.addEventListener("ch-theme-changed", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("ch-theme-changed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
      document.cookie = `ch-theme=${next};path=/;max-age=31536000;samesite=lax`;
      try {
        localStorage.setItem("ch-theme", next);
      } catch {}
      window.dispatchEvent(new Event("ch-theme-changed"));
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className={cn(
        "focus-aura inline-flex h-9 w-9 items-center justify-center rounded-full",
        "border border-outline-variant bg-surface-lowest text-on-surface-variant",
        "transition-colors hover:bg-surface-container hover:text-on-surface cursor-pointer",
        className,
      )}
    >
      <span className="material-symbols-outlined text-[18px]">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
