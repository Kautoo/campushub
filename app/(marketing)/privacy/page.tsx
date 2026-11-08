import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — CampusHub 2.0",
  description:
    "What CampusHub collects, the single first-party cookie it sets, how payments are handled, and how to reach us.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Small header: back link + icon tile */}
      <header className="border-b border-outline-variant bg-surface-lowest/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 lg:px-8">
          <span className="bg-primary-container text-on-primary-container flex h-9 w-9 items-center justify-center rounded-lg">
            <span className="material-symbols-outlined text-[20px]">
              shield
            </span>
          </span>
          <span className="text-headline-sm text-ink">Privacy Policy</span>
          <Link
            href="/"
            className="link-draw text-label-lg text-muted hover:text-ink ml-auto"
          >
            <span aria-hidden="true" className="mr-1">
              ←
            </span>
            Back to CampusHub
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <p className="font-mono text-label-sm text-muted">
          Last updated: November 2026
        </p>
        <h1 className="text-display text-ink mt-3">Privacy Policy</h1>
        <p className="text-muted text-body-lg leading-relaxed mt-4">
          CampusHub is a campus commerce platform for clubs and student
          organizations. This page explains, in plain language, what we store
          and what we deliberately do not do.
        </p>
        <p className="text-muted text-body-sm mt-2">
          This document is provided as a template and is not legal advice.
        </p>

        <div className="mt-10 space-y-12">
          <section>
            <h2 className="text-headline-md text-ink">What we collect</h2>
            <ul className="text-muted text-body-lg leading-relaxed mt-4 list-disc space-y-2 pl-5">
              <li>
                <span className="text-ink">Account email and name</span> —
                collected when you register, handled by Supabase Auth.
              </li>
              <li>
                <span className="text-ink">Organization data</span> — the
                organization profiles, event listings, and product details you
                enter.
              </li>
              <li>
                <span className="text-ink">Order and transaction records</span>{" "}
                — the orders placed through storefronts on CampusHub.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-ink">Cookies</h2>
            <p className="text-muted text-body-lg leading-relaxed mt-4">
              We set one first-party cookie that remembers your theme
              preference and keeps your session alive. That is the whole list.
              Your cookie choice from the consent banner is stored locally in
              your browser so the banner does not reappear.
            </p>
            <p className="text-muted text-body-lg leading-relaxed mt-4">
              No tracking cookies, no advertising pixels, no third-party
              analytics.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-ink">Payments</h2>
            <p className="text-muted text-body-lg leading-relaxed mt-4">
              Payments are processed by PayPal. Card numbers and payment
              credentials never touch CampusHub servers — checkout happens on
              PayPal&apos;s side. For details on how PayPal handles payment
              data, refer to{" "}
              <a
                href="https://www.paypal.com/webapps/mpp/ua/privacy-full"
                className="link-draw text-primary"
                rel="noreferrer noopener"
                target="_blank"
              >
                PayPal&apos;s privacy policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-ink">Data storage</h2>
            <p className="text-muted text-body-lg leading-relaxed mt-4">
              All data lives in a Supabase Postgres database protected by
              row-level security, so each account can only read and write the
              rows it owns.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-ink">Your rights</h2>
            <p className="text-muted text-body-lg leading-relaxed mt-4">
              You may request access to, correction of, or deletion of your
              personal data at any time by emailing{" "}
              <a
                href="mailto:privacy@campushub.example"
                className="link-draw text-primary"
              >
                privacy@campushub.example
              </a>
              . We respond to every reasonable request.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-ink">Contact</h2>
            <p className="text-muted text-body-lg leading-relaxed mt-4">
              Questions about this policy? Email{" "}
              <a
                href="mailto:privacy@campushub.example"
                className="link-draw text-primary"
              >
                privacy@campushub.example
              </a>
              . Our usage terms are in the{" "}
              <Link href="/tos" className="link-draw text-primary">
                Terms of Service
              </Link>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-outline-variant">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-10 lg:px-8">
          <p className="text-muted text-sm">
            © CampusHub 2.0 · Built with Next.js, Supabase, and PayPal
          </p>
          <nav className="flex gap-6" aria-label="Footer">
            <Link href="/tos" className="link-draw text-muted text-sm hover:text-ink">
              Terms
            </Link>
            <Link href="/" className="link-draw text-muted text-sm hover:text-ink">
              Home
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
