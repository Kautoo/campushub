import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-outline-variant bg-surface-lowest/90 px-4 backdrop-blur lg:px-8">
        <Link href="/demo" className="flex items-center gap-2">
          <span className="bg-primary-container flex h-9 w-9 items-center justify-center rounded-lg text-white dark:bg-primary dark:text-[#00201c]">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </span>
          <span className="text-headline-sm text-ink">CampusHub Store</span>
        </Link>
        <nav className="ml-6 hidden gap-4 md:flex">
          <Link
            href="/demo"
            className="text-label-lg text-muted hover:text-ink"
          >
            Merch
          </Link>
          <Link
            href="/demo#events"
            className="text-label-lg text-muted hover:text-ink"
          >
            Events
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-label-lg text-muted hover:text-ink hidden sm:block"
          >
            Organizer login
          </Link>
          <ThemeToggle />
        </div>
      </header>
      {children}
      <footer className="border-t border-outline-variant px-4 py-8 lg:px-8">
        <p className="text-body-sm text-muted">
          CampusHub 2.0 · Powered by PayPal · Guest checkout, no account needed
        </p>
      </footer>
    </div>
  );
}
