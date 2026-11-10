import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — CampusHub",
  description:
    "The terms that govern your use of CampusHub: accounts, acceptable use, payments, and liability.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      {/* Small header: back link + icon tile */}
      <header className="border-b border-outline-variant bg-surface-lowest/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 lg:px-8">
          <span className="bg-primary-container text-on-primary-container flex h-9 w-9 items-center justify-center rounded-lg">
            <span className="material-symbols-outlined text-[20px]">gavel</span>
          </span>
          <span className="text-headline-sm text-on-surface">Terms of Service</span>
          <Link
            href="/"
            className="link-draw text-label-lg text-on-surface-variant hover:text-on-surface ml-auto"
          >
            <span aria-hidden="true" className="mr-1">
              ←
            </span>
            Back to CampusHub
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <p className="font-mono text-label-sm text-on-surface-variant">
          Last updated: November 2026
        </p>
        <h1 className="text-display text-on-surface mt-3">Terms of Service</h1>
        <p className="text-on-surface-variant text-body-lg leading-relaxed mt-4">
          These terms govern your use of CampusHub. They are intentionally
          plain-spoken.
        </p>
        <p className="text-on-surface-variant text-body-sm mt-2">
          This document is provided as a template and is not legal advice.
        </p>

        <div className="mt-10 space-y-12">
          <section>
            <h2 className="text-headline-md text-on-surface">Using the service</h2>
            <p className="text-on-surface-variant text-body-lg leading-relaxed mt-4">
              You need an account to sell or manage a storefront. Keep your
              credentials safe and provide accurate information about yourself
              and your organization. You are responsible for activity under
              your account.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface">Acceptable use</h2>
            <ul className="text-on-surface-variant text-body-lg leading-relaxed mt-4 list-disc space-y-2 pl-5">
              <li>Do not use CampusHub for fraud, scams, or misrepresentation.</li>
              <li>Do not list unlawful content or prohibited goods.</li>
              <li>Do not attempt to access other accounts or data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface">Payments &amp; refunds</h2>
            <p className="text-on-surface-variant text-body-lg leading-relaxed mt-4">
              Payments are processed by PayPal. CampusHub never handles card
              details. Refunds are handled according to the organizer&apos;s
              refund policy for the event or product in question; PayPal&apos;s
              own policies may also apply to a transaction.
            </p>
            <p className="text-on-surface-variant text-body-lg leading-relaxed mt-4">
              Demo storefronts and sample data shown in the product are
              fictional.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface">Availability</h2>
            <p className="text-on-surface-variant text-body-lg leading-relaxed mt-4">
              CampusHub is provided as-is. We do not promise uninterrupted
              availability, and features may change. If something breaks, we
              will try to fix it, but there is no uptime warranty.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface">Intellectual property</h2>
            <p className="text-on-surface-variant text-body-lg leading-relaxed mt-4">
              Content you create — listings, descriptions, images — stays
              yours. The CampusHub platform itself, including its code and
              design, is proprietary and may not be copied or redistributed
              without permission.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface">
              Limitation of liability
            </h2>
            <p className="text-on-surface-variant text-body-lg leading-relaxed mt-4">
              To the fullest extent permitted by law, CampusHub is not liable
              for indirect, incidental, or consequential damages arising from
              your use of the service. If we are found liable for anything, our
              total liability is limited to the amount you paid us in the
              twelve months before the claim.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface">Termination</h2>
            <p className="text-on-surface-variant text-body-lg leading-relaxed mt-4">
              You can stop using CampusHub and delete your account at any time.
              We may suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface">Contact</h2>
            <p className="text-on-surface-variant text-body-lg leading-relaxed mt-4">
              Questions about these terms? Email{" "}
              <a
                href="mailto:legal@campushub.example"
                className="link-draw text-primary"
              >
                legal@campushub.example
              </a>
              . Our data practices are described in the{" "}
              <Link href="/privacy" className="link-draw text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-outline-variant">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-10 lg:px-8">
          <p className="text-on-surface-variant text-sm">
            © CampusHub · Built with Next.js, Render Postgres, and PayPal
          </p>
          <nav className="flex gap-6" aria-label="Footer">
            <Link
              href="/privacy"
              className="link-draw text-on-surface-variant text-sm hover:text-on-surface"
            >
              Privacy
            </Link>
            <Link href="/" className="link-draw text-on-surface-variant text-sm hover:text-on-surface">
              Home
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
