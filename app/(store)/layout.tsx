import Link from "next/link";
import { StoreNav } from "@/components/store/store-nav";
import { StoreCurrencyProvider } from "@/components/store/currency-provider";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreCurrencyProvider>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        {/* Floating Pill Navbar (matching landing page aesthetic) */}
        <StoreNav />

        {/* Main Storefront Content (padded top for fixed floating navbar) */}
        <div className="flex-1 pt-20">{children}</div>

        {/* Consumer Storefront Footer */}
        <footer className="border-t border-outline-variant/60 bg-surface-lowest px-4 py-12 lg:px-8 mt-12">
          <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-outline-variant/40">
            <div className="md:col-span-2 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="bg-primary text-on-primary flex h-8 w-8 items-center justify-center rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">
                    storefront
                  </span>
                </span>
                <span className="text-headline-sm font-bold text-on-surface">
                  CampusHub Official Storefront
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant max-w-md leading-relaxed">
                Verified campus marketplace for official student society events,
                digital QR passes, and licensed club merchandise with PayPal
                buyer protection.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-label-sm uppercase tracking-wider font-bold text-secondary block">
                Shop &amp; Discover
              </span>
              <ul className="space-y-1.5 text-body-sm text-on-surface-variant">
                <li>
                  <Link
                    href="/demo"
                    className="hover:text-primary transition-colors"
                  >
                    Storefront Overview
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo/events"
                    className="hover:text-primary transition-colors"
                  >
                    Events &amp; Digital Passes
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
                    Campus Societies
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-label-sm uppercase tracking-wider font-bold text-secondary block">
                Buyer Support &amp; Checkout
              </span>
              <ul className="space-y-1.5 text-body-sm text-on-surface-variant">
                <li>
                  <Link
                    href="/demo/cart"
                    className="hover:text-primary transition-colors"
                  >
                    Your Shopping Bag
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo/checkout"
                    className="hover:text-primary transition-colors"
                  >
                    PayPal Express Checkout
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-primary transition-colors"
                  >
                    Buyer Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tos"
                    className="hover:text-primary transition-colors"
                  >
                    Terms of Sale
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mx-auto max-w-7xl pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-body-sm text-on-surface-variant">
            <p>
              CampusHub Storefront · 100% PayPal Escrow Protection · Instant QR
              Pass Delivery
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
