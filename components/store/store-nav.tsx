"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/demo", label: "Overview", exact: true, icon: "storefront" },
  { href: "/demo/events", label: "Events & Passes", exact: false, icon: "confirmation_number" },
  { href: "/demo/shop", label: "Merch Shop", exact: false, icon: "shopping_bag" },
  { href: "/demo/societies", label: "Societies", exact: false, icon: "groups" },
  { href: "/demo/cart", label: "Shopping Bag", exact: false, icon: "shopping_cart" },
] as const;

export function StoreNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Storefront navigation"
      className="flex items-center gap-1 overflow-x-auto no-scrollbar"
    >
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-label-md font-semibold whitespace-nowrap transition-all",
              active
                ? "bg-primary text-on-primary shadow-2xs"
                : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface",
            )}
          >
            <span className="material-symbols-outlined text-[16px]">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
