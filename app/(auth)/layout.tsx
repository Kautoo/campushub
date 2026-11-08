import Link from "next/link";
import { DotPattern } from "@/components/magicui";

/**
 * Stitch auth portal: split panel `grid lg:grid-cols-12 rounded-2xl shadow-xl`
 * — left `lg:col-span-5 bg-primary-container` brand panel with teal ambient
 * blobs (decorative, aria-hidden), right form column.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8 lg:px-12">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl bg-surface-container-lowest shadow-xl overflow-hidden">
        {/* LEFT brand panel — lg:col-span-5 */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between overflow-hidden bg-primary-container p-6 sm:p-8 lg:p-10 text-on-primary">
          {/* Ambient blobs — decorative */}
          <div
            aria-hidden
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-secondary/25 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute -bottom-28 -right-24 w-96 h-96 rounded-full bg-secondary-fixed-dim/20 blur-3xl pointer-events-none"
          />
          <DotPattern className="absolute inset-0 text-white/10 [mask-image:radial-gradient(400px_at_30%_30%,white,transparent)]" />

          {/* Top branding block */}
          <Link href="/" className="relative flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary to-secondary-container flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-primary text-[26px]">
                account_balance
              </span>
            </span>
            <span className="flex flex-col">
              <span className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm tracking-tight text-surface-container-lowest">
                  CampusHub
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                  2.0
                </span>
              </span>
              <span className="font-label-sm text-label-sm text-on-primary-container">
                Higher Ed Commerce Suite
              </span>
            </span>
          </Link>

          {/* Hero headline + feature pods */}
          <div className="relative max-w-md">
            <h1 className="font-headline-lg text-headline-lg text-surface-container-lowest tracking-tight">
              Empowering Student Societies, Hackathons &amp; Campus Commerce
            </h1>
            <p className="font-body-md text-body-md text-on-primary-container leading-relaxed mt-3">
              The all-in-one institutional hub to host official university
              events, distribute QR tickets, manage student apparel orders, and
              settle payments — with AI insights grounded in your real numbers.
            </p>
            <div className="mt-8 space-y-3">
              {[
                {
                  icon: "confirmation_number",
                  text: "Encrypted QR event ticketing",
                },
                {
                  icon: "storefront",
                  text: "Student club storefront & merchandise",
                },
                {
                  icon: "account_balance_wallet",
                  text: "PayPal-secured settlement",
                },
              ].map((f) => (
                <div
                  key={f.text}
                  className="p-3.5 rounded-xl bg-surface-container-lowest/10 backdrop-blur-md transition-all hover:bg-surface-container-lowest/15 flex items-start gap-3"
                >
                  <span className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-surface-container-lowest">
                      {f.icon}
                    </span>
                  </span>
                  <span className="font-body-md text-body-md text-surface-container-lowest/90 pt-1.5">
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-surface-container-lowest/10 px-4 py-2 font-label-md text-label-md text-surface-container-lowest">
              <span className="material-symbols-outlined text-[16px]">
                verified_user
              </span>
              Payments secured by PayPal
            </div>
          </div>

          <p className="relative font-body-sm text-body-sm text-on-primary-container/70">
            © CampusHub 2.0 · Tech Society demo
          </p>
        </div>

        {/* RIGHT form column — lg:col-span-7 */}
        <div className="lg:col-span-7 flex items-center justify-center bg-surface px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
