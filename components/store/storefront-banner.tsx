import Link from "next/link";

export function StorefrontBanner({
  orgName,
  isCustomOrg,
}: {
  orgName: string;
  isCustomOrg?: boolean;
}) {
  return (
    <div className="bg-surface-low border-b border-outline-variant/45 px-4 py-2">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2 text-label-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-on-surface font-semibold">
            {isCustomOrg
              ? `Live Storefront: ${orgName}`
              : "CampusHub Official University Marketplace"}
          </span>
          <span className="text-outline-variant hidden sm:inline">•</span>
          <span className="text-on-surface-variant hidden sm:inline">
            {isCustomOrg
              ? "Showing real-time events & merchandise for this society"
              : "Verified campus events, digital pass ticketing & student club merchandise"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {isCustomOrg ? (
            <Link
              href="/demo?org=tech-society"
              className="text-secondary font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Default Public Showroom</span>
              <span className="material-symbols-outlined text-[13px]">
                visibility
              </span>
            </Link>
          ) : (
            <Link
              href="/demo/societies"
              className="text-secondary font-semibold hover:underline flex items-center gap-1"
            >
              <span>Browse All Student Clubs &amp; Societies</span>
              <span className="material-symbols-outlined text-[13px]">
                groups
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
