import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  listAllStorefrontSocieties,
  CAMPUS_SOCIETIES,
  type CampusSocietyMeta,
  type StorefrontSocietyItem,
} from "@/lib/storefront";

export const metadata = {
  title: "Campus Clubs & Societies Directory — CampusHub Storefront",
};

export const instant = false;
export default async function DemoSocietiesPage() {
  const liveOrgs = await listAllStorefrontSocieties();

  const societyList: StorefrontSocietyItem[] =
    liveOrgs.length > 0
      ? liveOrgs
      : CAMPUS_SOCIETIES.map((c: CampusSocietyMeta, i: number) => ({
          id: String(i),
          name: c.name,
          slug: c.slug,
          description: c.description,
          currency: "MYR",
          eventCount: c.eventsCount,
          productCount: c.merchCount,
          isDemoOrg: i === 0,
        }));

  const metaBySlug = new Map<string, CampusSocietyMeta>(
    CAMPUS_SOCIETIES.map((c: CampusSocietyMeta) => [c.slug, c]),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Breadcrumb + Header */}
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 shadow-xs space-y-4">
        <nav className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <Link href="/demo" className="hover:text-primary transition-colors">
            Storefront
          </Link>
          <span>/</span>
          <span className="text-on-surface font-semibold">
            Clubs &amp; Societies
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <Badge tone="teal" icon="verified">
              University Student Union Accredited
            </Badge>
            <h1 className="text-display font-bold text-on-surface tracking-tight">
              Campus Clubs &amp; Societies (Organizers &amp; Sellers)
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Every accredited student organization on CampusHub operates its
              own box office and merchandise store. Choose a society below to
              browse their events and official club gear.
            </p>
          </div>
          <Link
            href="/demo/events"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:opacity-90 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              confirmation_number
            </span>
            <span>Browse All Campus Passes</span>
          </Link>
        </div>
      </div>

      {/* EXPLANATORY GUIDE: WHAT IS A CAMPUS SOCIETY? */}
      <section className="rounded-2xl border border-secondary/35 bg-gradient-to-br from-surface-lowest via-secondary-container/10 to-surface-low p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">
            help_outline
          </span>
          <h2 className="text-headline-sm font-bold text-on-surface">
            How Societies Function on CampusHub
          </h2>
          <Badge tone="teal">Platform Architecture</Badge>
        </div>
        <p className="text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
          In university campus life, a <strong>Society</strong> is an accredited
          student-run organization (like Tech Society or the Design Guild).
          On CampusHub, each society acts as both an event organizer and an
          official merchandise seller:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="rounded-xl border border-outline-variant/50 bg-surface-lowest p-4 space-y-1.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-label-lg font-bold text-on-surface">
              Official Event Host
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Societies schedule venues, host campus hackathons and workshops,
              and issue instant digital QR entry passes.
            </p>
          </div>

          <div className="rounded-xl border border-outline-variant/50 bg-surface-lowest p-4 space-y-1.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-label-lg font-bold text-on-surface">
              Merchandise Seller
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Societies design, stock, and sell faculty-licensed apparel and gear
              to fund student projects and competitions.
            </p>
          </div>

          <div className="rounded-xl border border-outline-variant/50 bg-surface-lowest p-4 space-y-1.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-success-container text-success flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-label-lg font-bold text-on-surface">
              100% PayPal Protected
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              All transactions settle directly into the society&apos;s verified
              university escrow account with PayPal security.
            </p>
          </div>

          <div className="rounded-xl border border-outline-variant/50 bg-surface-lowest p-4 space-y-1.5 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-warning-container text-warning flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="text-label-lg font-bold text-on-surface">
              Dedicated Storefronts
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Clicking any club below filters the store to show exclusively that
              society&apos;s events and official products.
            </p>
          </div>
        </div>
      </section>

      {/* Accredited Societies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {societyList.map((soc: StorefrontSocietyItem) => {
          const meta = metaBySlug.get(soc.slug);
          const icon = meta?.icon ?? "school";
          const faculty = meta?.faculty ?? "University Student Union";
          const badgeTone = meta?.badgeTone ?? "teal";
          const badgeLabel = soc.isDemoOrg
            ? "Featured Showroom"
            : meta?.badge ?? "Accredited Club";

          return (
            <article
              key={soc.slug}
              className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 shadow-xs flex flex-col justify-between gap-6 hover:border-secondary/50 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[24px]">
                      {icon}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={badgeTone} icon="verified">
                      {badgeLabel}
                    </Badge>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      Seller ID: {soc.slug}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-headline-md font-bold text-on-surface">
                    {soc.name}
                  </h3>
                  <p className="text-label-md text-secondary font-semibold mt-0.5">
                    {faculty}
                  </p>
                  <p className="text-body-md text-on-surface-variant mt-2.5 leading-relaxed">
                    {soc.description ??
                      "Active university student organization hosting campus workshops and official collegiate merchandise."}
                  </p>
                </div>

                {meta?.highlights ? (
                  <ul className="space-y-2 pt-2 border-t border-outline-variant/40">
                    {meta.highlights.map((h: string) => (
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
                ) : null}
              </div>

              <div className="space-y-4 pt-4 border-t border-outline-variant/40">
                <div className="grid grid-cols-2 gap-2 text-center tabular-nums">
                  <div className="rounded-lg bg-surface-low p-2">
                    <span className="text-headline-sm font-bold text-on-surface block">
                      {soc.eventCount}
                    </span>
                    <span className="text-[10.5px] text-on-surface-variant">
                      Active Events
                    </span>
                  </div>
                  <div className="rounded-lg bg-surface-low p-2">
                    <span className="text-headline-sm font-bold text-secondary block">
                      {soc.productCount}
                    </span>
                    <span className="text-[10.5px] text-on-surface-variant">
                      Catalog SKUs
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/demo?org=${soc.slug}`}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-colors col-span-2 shadow-2xs"
                  >
                    <span>Visit Society Storefront</span>
                    <span className="material-symbols-outlined text-[16px] ml-1">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
