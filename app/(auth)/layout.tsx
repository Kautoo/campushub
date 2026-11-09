import Link from "next/link";
import { DotPattern } from "@/components/magicui";

/**
 * CampusHub 2.0 Auth Portal Layout:
 * Left panel uses explicit deep navy (#00162e) and crisp white text so dark mode never loses contrast.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8 lg:px-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-outline-variant/60 bg-surface-lowest shadow-xl overflow-hidden">
        {/* LEFT brand panel — explicit dark navy background for guaranteed contrast in both themes */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between overflow-hidden bg-[#00162e] p-8 lg:p-10 text-white">
          <div
            aria-hidden
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#16a6a0]/25 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute -bottom-28 -right-24 w-96 h-96 rounded-full bg-[#5eead4]/15 blur-3xl pointer-events-none"
          />
          <DotPattern className="absolute inset-0 text-white/10 [mask-image:radial-gradient(400px_at_30%_30%,white,transparent)]" />

          {/* Top branding block */}
          <Link href="/" className="relative flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-[#5eead4] text-[#00162e] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[24px]">
                school
              </span>
            </span>
            <span className="flex flex-col">
              <span className="flex items-center gap-2">
                <span className="text-headline-sm font-bold tracking-tight text-white">
                  CampusHub
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#5eead4]/20 text-[#5eead4] text-label-sm font-bold">
                  2.0
                </span>
              </span>
              <span className="text-label-sm text-slate-300">
                Higher Ed Commerce &amp; SaaS Suite
              </span>
            </span>
          </Link>

          {/* Hero headline + feature pods */}
          <div className="relative max-w-md space-y-5">
            <h2 className="text-headline-lg font-bold text-white tracking-tight leading-snug">
              Empowering Student Societies, Hackathons &amp; Campus Commerce
            </h2>
            <p className="text-body-md text-slate-300 leading-relaxed">
              Manage venue schedules with Bryntum Scheduler 8.0, audit financial
              ledgers in AG Grid Community 36, and power multi-page student
              storefronts with PayPal Orders v2.
            </p>
            <div className="space-y-2.5 pt-2">
              {[
                {
                  icon: "view_timeline",
                  text: "Bryntum Scheduler 8.0 venue & calendar timelines",
                },
                {
                  icon: "table_chart",
                  text: "AG Grid Community 36 financial & inventory ledgers",
                },
                {
                  icon: "account_balance_wallet",
                  text: "PayPal Orders v2 escrow & HMAC webhook verification",
                },
              ].map((f) => (
                <div
                  key={f.text}
                  className="p-3 rounded-xl bg-white/8 border border-white/15 backdrop-blur-md flex items-center gap-3"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#5eead4]/20 text-[#5eead4] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      {f.icon}
                    </span>
                  </span>
                  <span className="text-body-sm font-medium text-white">
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-body-sm text-slate-400">
            © CampusHub 2.0 · Tech Society Workspace
          </p>
        </div>

        {/* RIGHT form column — lg:col-span-7 */}
        <div className="lg:col-span-7 flex items-center justify-center bg-surface-lowest px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
