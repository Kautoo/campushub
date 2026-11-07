import Link from "next/link";
import { DotPattern } from "@/components/magicui";

/** Stitch auth portal: split panel with teal glow on the brand side. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-container p-10 text-white lg:flex dark:bg-surface">
        <DotPattern className="text-white/20 [mask-image:radial-gradient(400px_at_30%_30%,white,transparent)]" />
        <Link href="/" className="relative flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </span>
          <span className="text-headline-sm">CampusHub 2.0</span>
        </Link>
        <div className="relative max-w-md">
          <h1 className="text-display">Run your campus empire from one hub.</h1>
          <p className="text-body-lg mt-4 opacity-80">
            Events, ticketing, storefront, and PayPal payments — with AI
            insights grounded in your real numbers.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-label-md">
            <span className="material-symbols-outlined text-[16px]">
              verified_user
            </span>
            Payments secured by PayPal
          </div>
        </div>
        <p className="relative text-body-sm opacity-60">
          © CampusHub 2.0 · Tech Society demo
        </p>
      </div>
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
