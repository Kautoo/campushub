import Link from "next/link";
import Image from "next/image";
import { StoreNav } from "@/components/store/store-nav";
import { StoreCurrencyProvider } from "@/components/store/currency-provider";
import { StorefrontBanner } from "@/components/store/storefront-banner";
import { hasDatabaseEnv } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/session";
import { getStorefrontData } from "@/lib/storefront";

export const instant = false;
export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let org: { name: string; isCustomOrg?: boolean } = {
    name: "Tech Society",
    isCustomOrg: false,
  };
  if (hasDatabaseEnv()) {
    try {
      const session = await getSessionContext();
      const targetOrg = session?.orgIds?.[0];
      const data = await getStorefrontData(targetOrg);
      if (data?.org) {
        org = {
          name: data.org.name,
          isCustomOrg: Boolean(data.org.isCustomOrg),
        };
      }
    } catch {}
  }

  return (
    <StoreCurrencyProvider>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        {/* Floating Pill Navbar (matching landing page aesthetic) */}
        <StoreNav />

        {/* Global Storefront Announcement & Session Indicator Bar — Uniform across all demo subpages */}
        <div className="pt-20">
          <StorefrontBanner
            orgName={org.name}
            isCustomOrg={org.isCustomOrg}
          />
        </div>

        {/* Main Storefront Content */}
        <div className="flex-1">{children}</div>

        {/* Consumer Storefront Footer */}
        <footer className="border-t border-outline-variant/60 bg-surface-lowest px-4 py-12 lg:px-8 mt-12">
          <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-outline-variant/40">
            <div className="md:col-span-2 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-outline-variant/60 bg-surface-low shadow-2xs shrink-0">
                  <Image
                    src="/brand/campushub-mark.svg"
                    alt="CampusHub Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain p-0.5"
                  />
                </span>
                <span className="text-headline-sm font-bold text-on-surface tracking-tight">
                  CampusHub
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant max-w-md leading-relaxed">
                Empowering student societies with autonomous ticketing, official
                merchandise drops, and verified PayPal Orders v2 escrow settlement.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-label-sm uppercase tracking-wider font-bold text-secondary block">
                Shop &amp; Discover
              </span>
              <ul className="space-y-1.5 text-body-sm text-on-surface-variant">
                <li>
                  <Link
                    href="/demo/events"
                    className="hover:text-primary transition-colors"
                  >
                    Campus Events &amp; Passes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo/shop"
                    className="hover:text-primary transition-colors"
                  >
                    Official Merch Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo/societies"
                    className="hover:text-primary transition-colors"
                  >
                    Clubs &amp; Societies Directory
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo/cart"
                    className="hover:text-primary transition-colors"
                  >
                    Your Shopping Bag
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-label-sm uppercase tracking-wider font-bold text-secondary block">
                Platform &amp; Governance
              </span>
              <ul className="space-y-1.5 text-body-sm text-on-surface-variant">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-primary transition-colors"
                  >
                    Organizer Executive Console
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/ai-insights"
                    className="hover:text-primary transition-colors"
                  >
                    Astropods Commerce Analyst
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/help"
                    className="hover:text-primary transition-colors"
                  >
                    Documentation &amp; Runbook
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-primary transition-colors"
                  >
                    Sign In / Sandbox Access
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mx-auto max-w-7xl pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-body-sm text-on-surface-variant">
            <p>
              &copy; {new Date().getFullYear()} CampusHub. Settled via
              PayPal Orders v2.
            </p>
            <p className="text-xs">
              Guest checkout enabled — no student account required
            </p>
          </div>
        </footer>
      </div>
    </StoreCurrencyProvider>
  );
}
