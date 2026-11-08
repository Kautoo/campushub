import type { NavSection } from "@/components/layout/app-shell";

/**
 * Dashboard sidebar navigation — Stitch IA: "Main" + "Management".
 * Routes are unchanged; icon/label mapping follows the Stitch reference
 * where a route matches. Stitch-only entries without a real route
 * (a bare "Analytics" page) are omitted — no dead links.
 */
export const dashboardNav: NavSection[] = [
  {
    title: "Main",
    items: [
      // Stitch "Overview" → our dashboard route (Stitch icon grid_view)
      { href: "/dashboard", label: "Overview", icon: "grid_view" },
      {
        // Stitch "AI Intelligence" (auto_awesome)
        href: "/dashboard/ai-insights",
        label: "AI Intelligence",
        icon: "auto_awesome",
      },
    ],
  },
  {
    title: "Management",
    items: [
      // Stitch: Events (confirmation_number)
      { href: "/dashboard/events", label: "Events", icon: "confirmation_number" },
      {
        href: "/dashboard/registrations",
        label: "Registrations",
        icon: "how_to_reg",
      },
      // Stitch: Products (shopping_bag)
      { href: "/dashboard/products", label: "Products", icon: "shopping_bag" },
      // Stitch: Orders (receipt_long)
      { href: "/dashboard/orders", label: "Orders", icon: "receipt_long" },
      // Stitch: Transactions (account_balance_wallet)
      {
        href: "/dashboard/transactions",
        label: "Transactions",
        icon: "account_balance_wallet",
      },
      // Stitch: Members (groups)
      { href: "/dashboard/members", label: "Members", icon: "groups" },
      {
        href: "/dashboard/notifications",
        label: "Notifications",
        icon: "notifications",
      },
      { href: "/dashboard/reports", label: "Reports", icon: "description" },
      // Stitch: Settings (settings)
      { href: "/dashboard/settings", label: "Settings", icon: "settings" },
      { href: "/dashboard/help", label: "Help", icon: "help" },
    ],
  },
];
