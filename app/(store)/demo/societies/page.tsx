import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CAMPUS_SOCIETIES } from "@/lib/storefront";

export const metadata = {
  title: "Accredited Campus Societies — CampusHub 2.0 Storefront",
};

export default function DemoSocietiesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 shadow-xs space-y-4">
        <nav className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <Link href="/demo" className="hover:text-primary transition-colors">
            Storefront
          </Link>
          <span>/</span>
          <span className="text-on-surface font-semibold">
            Accredited Campus Societies
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <Badge tone="teal" icon="verified">
              University Registry Verified
            </Badge>
            <h1 className="text-display font-bold text-on-surface tracking-tight">
              Accredited Student Societies &amp; Club Organizers
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Every club on CampusHub 2.0 operates an isolated Postgres
              workspace with role-based committee permissions, Bryntum venue
              scheduling, and direct PayPal bursary settlement.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:opacity-90 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              domain_add
            </span>
            <span>Onboard Your Society</span>
          </Link>
        </div>
      </div>

      {/* Societies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {CAMPUS_SOCIETIES.map((soc) => (
          <article
            key={soc.slug}
            className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 shadow-xs flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">
                    {soc.icon}
                  </span>
                </div>
                <Badge tone={soc.badgeTone} icon="verified">
                  {soc.badge}
                </Badge>
              </div>

              <div>
                <h2 className="text-headline-md font-bold text-on-surface">
                  {soc.name}
                </h2>
                <p className="text-label-md text-secondary font-semibold mt-0.5">
                  {soc.faculty}
                </p>
                <p className="text-body-md text-on-surface-variant mt-2.5 leading-relaxed">
                  {soc.description}
                </p>
              </div>

              <ul className="space-y-2 pt-2 border-t border-outline-variant/40">
                {soc.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-center gap-2 text-body-sm text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      check_circle
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 pt-4 border-t border-outline-variant/40">
              <div className="grid grid-cols-3 gap-2 text-center tabular-nums">
                <div className="rounded-lg bg-surface-low p-2">
                  <span className="text-headline-sm font-bold text-primary block">
                    {soc.members}
                  </span>
                  <span className="text-[10.5px] text-on-surface-variant">
                    Members
                  </span>
                </div>
                <div className="rounded-lg bg-surface-low p-2">
                  <span className="text-headline-sm font-bold text-on-surface block">
                    {soc.eventsCount}
                  </span>
                  <span className="text-[10.5px] text-on-surface-variant">
                    Events
                  </span>
                </div>
                <div className="rounded-lg bg-surface-low p-2">
                  <span className="text-headline-sm font-bold text-secondary block">
                    {soc.merchCount}
                  </span>
                  <span className="text-[10.5px] text-on-surface-variant">
                    Merch SKUs
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/demo/events"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-colors"
                >
                  View Events
                </Link>
                <Link
                  href="/demo/shop"
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-outline-variant/60 bg-surface-lowest text-on-surface text-label-sm font-semibold hover:bg-surface-low transition-colors"
                >
                  Browse Merch
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
