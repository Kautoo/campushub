import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  listAllStorefrontSocieties,
  CAMPUS_SOCIETIES,
  type CampusSocietyMeta,
  type StorefrontSocietyItem,
} from "@/lib/storefront";

export const metadata = {
  title: "Accredited Campus Societies — CampusHub Storefront",
};

export default async function DemoSocietiesPage() {
  const liveOrgs = await listAllStorefrontSocieties();

  // Combine live Postgres organizations with campus highlights metadata
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
      {/* Consumer Header */}
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 shadow-xs space-y-4">
        <nav className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <Link href="/demo" className="hover:text-primary transition-colors">
            Storefront
          </Link>
          <span>/</span>
          <span className="text-on-surface font-semibold">
            Campus Societies
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <Badge tone="teal" icon="verified">
              University Student Union Accredited
            </Badge>
            <h1 className="text-display font-bold text-on-surface tracking-tight">
              Accredited Student Societies &amp; Club Organizers
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Discover official university clubs and faculty societies. Click
              any club to visit their live multi-tenant storefront, explore their
              event passes, and order official merchandise.
            </p>
          </div>
          <Link
            href="/demo/events"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:opacity-90 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              confirmation_number
            </span>
            <span>Browse All Society Events</span>
          </Link>
        </div>
      </div>

      {/* Societies Grid */}
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
                  <Badge tone={badgeTone} icon="verified">
                    {badgeLabel}
                  </Badge>
                </div>

                <div>
                  <h2 className="text-headline-md font-bold text-on-surface">
                    {soc.name}
                  </h2>
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
                      Published Events
                    </span>
                  </div>
                  <div className="rounded-lg bg-surface-low p-2">
                    <span className="text-headline-sm font-bold text-secondary block">
                      {soc.productCount}
                    </span>
                    <span className="text-[10.5px] text-on-surface-variant">
                      Active SKUs
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/demo?org=${soc.slug}`}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-colors col-span-2 shadow-2xs"
                  >
                    <span>Visit Club Storefront</span>
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
