import Link from "next/link";

/** Rendered when a hard prerequisite (DATABASE_URL / org data) is missing. */
export function SetupNotice({
  what,
  hint,
}: {
  what: string;
  hint?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg rounded-xl bg-surface-container-lowest shadow-sm p-8 text-center">
        <span className="material-symbols-outlined text-[36px] text-warning">
          settings_alert
        </span>
        <h1 className="text-headline-md text-on-surface mt-3">
          Setup needed for {what}
        </h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          CampusHub needs a Postgres database to run. Set{" "}
          <code className="font-mono text-[12px]">DATABASE_URL</code> and{" "}
          <code className="font-mono text-[12px]">AUTH_SECRET</code> in{" "}
          <code className="font-mono text-[12px]">.env.local</code>, then apply
          the SQL in <code className="font-mono text-[12px]">db/schema.sql</code>{" "}
          and <code className="font-mono text-[12px]">db/seed.sql</code>. See the
          README for the full setup.
        </p>
        {hint ? (
          <p className="text-body-sm text-on-surface-variant mt-3">{hint}</p>
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
