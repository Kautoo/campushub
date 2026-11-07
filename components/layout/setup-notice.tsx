import Link from "next/link";

/** Rendered when a hard prerequisite (Supabase env / org data) is missing. */
export function SetupNotice({
  what,
  hint,
}: {
  what: string;
  hint?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg rounded-xl border border-outline-variant bg-surface-lowest p-8 text-center">
        <span className="material-symbols-outlined text-[36px] text-warning">
          settings_alert
        </span>
        <h1 className="text-headline-md text-ink mt-3">
          Setup needed for {what}
        </h1>
        <p className="text-body-md text-muted mt-2">
          CampusHub needs Supabase credentials to run. Set{" "}
          <code className="font-mono text-[12px]">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="font-mono text-[12px]">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          in <code className="font-mono text-[12px]">.env.local</code>, then
          apply the SQL in{" "}
          <code className="font-mono text-[12px]">supabase/migrations/</code>.
          See the README for the full setup.
        </p>
        {hint ? (
          <p className="text-body-sm text-muted mt-3">{hint}</p>
        ) : null}
        <Link
          href="/"
          className="text-primary mt-6 inline-block text-label-lg font-semibold"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
