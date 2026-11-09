import type { NavSection } from "@/components/layout/app-shell";

/**
 * Streamlined Dashboard Sidebar Navigation:
 * Focused strictly on core daily analytics, event scheduling, and commerce ledgers.
 * Notifications, Organization Settings, Committee Members, and Help live in the
 * top header popovers (Bell, Org Switcher, Account menu) and bottom org card.
 */
export const dashboardNav: NavSection[] = [
  {
    title: "Intelligence",
    items: [
      { href: "/dashboard", label: "Overview", icon: "grid_view" },
      {
        href: "/dashboard/ai-insights",
        label: "AI Intelligence",
        icon: "auto_awesome",
      },
      { href: "/dashboard/reports", label: "Audit Reports", icon: "description" },
    ],
  },
  {
    title: "Events & Venues",
    items: [
      {
        href: "/dashboard/events",
        label: "Events & Timeline",
        icon: "confirmation_number",
      },
      {
        href: "/dashboard/registrations",
        label: "Registrations",
        icon: "how_to_reg",
      },
    ],
  },
  {
    title: "Commerce Ledgers",
    items: [
      { href: "/dashboard/products", label: "Products", icon: "shopping_bag" },
      { href: "/dashboard/orders", label: "Orders", icon: "receipt_long" },
      {
        href: "/dashboard/transactions",
        label: "Transactions",
        icon: "account_balance_wallet",
      },
    ],
  },
];
