import type { NavSection } from "@/components/layout/app-shell";

/** Dashboard sidebar navigation — 13 workspaces. */
export const dashboardNav: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "space_dashboard" },
      { href: "/dashboard/ai-insights", label: "AI Insights", icon: "auto_awesome" },
    ],
  },
  {
    title: "Events",
    items: [
      { href: "/dashboard/events", label: "Events", icon: "event" },
      {
        href: "/dashboard/registrations",
        label: "Registrations",
        icon: "how_to_reg",
      },
    ],
  },
  {
    title: "Commerce",
    items: [
      { href: "/dashboard/products", label: "Products", icon: "inventory_2" },
      { href: "/dashboard/orders", label: "Orders", icon: "receipt_long" },
      {
        href: "/dashboard/transactions",
        label: "Transactions",
        icon: "payments",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/dashboard/members", label: "Members", icon: "group" },
      {
        href: "/dashboard/notifications",
        label: "Notifications",
        icon: "notifications",
      },
      { href: "/dashboard/reports", label: "Reports", icon: "description" },
      { href: "/dashboard/settings", label: "Settings", icon: "settings" },
      { href: "/dashboard/help", label: "Help", icon: "help" },
    ],
  },
];
