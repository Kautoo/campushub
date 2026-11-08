import { SectionHeader } from "@/components/ui/primitives";

export const metadata = { title: "Help — CampusHub 2.0" };

const FAQS: { id: string; icon: string; question: string; answer: React.ReactNode }[] = [
  {
    id: "database",
    icon: "database",
    question: "How do I connect my Postgres database?",
    answer: (
      <>
        <p>
          CampusHub runs on any Postgres database (Render Postgres on
          production). Set{" "}
          <code className="font-mono text-[12px]">DATABASE_URL</code> and{" "}
          <code className="font-mono text-[12px]">AUTH_SECRET</code> in your{" "}
          <code className="font-mono text-[12px]">.env.local</code>. On Render,
          the blueprint wires{" "}
          <code className="font-mono text-[12px]">DATABASE_URL</code> from the{" "}
          <code className="font-mono text-[12px]">campushub-db</code> service
          automatically.
        </p>
        <p>
          Apply the schema by running{" "}
          <code className="font-mono text-[12px]">db/schema.sql</code> then{" "}
          <code className="font-mono text-[12px]">db/seed.sql</code> against
          your database (see the README for the psql invocation).
        </p>
      </>
    ),
  },
  {
    id: "paypal",
    icon: "account_balance_wallet",
    question: "How do I set up PayPal sandbox and webhooks?",
    answer: (
      <>
        <p>
          Create a sandbox app in the{" "}
          <a
            href="https://developer.paypal.com/dashboard/applications/sandbox"
            className="text-secondary underline"
            target="_blank"
            rel="noreferrer"
          >
            PayPal Developer Dashboard
          </a>{" "}
          and set{" "}
          <code className="font-mono text-[12px]">PAYPAL_CLIENT_ID</code>,{" "}
          <code className="font-mono text-[12px]">PAYPAL_CLIENT_SECRET</code>, and{" "}
          <code className="font-mono text-[12px]">PAYPAL_ENV=sandbox</code> (set{" "}
          <code className="font-mono text-[12px]">PAYPAL_CURRENCY</code> if your
          account rejects MYR).
        </p>
        <p>
          Add a webhook pointing to{" "}
          <code className="font-mono text-[12px]">/api/paypal/webhook</code>{" "}
          subscribed to <em>CHECKOUT.ORDER.APPROVED</em>,{" "}
          <em>PAYMENT.CAPTURE.COMPLETED</em>, and{" "}
          <em>PAYMENT.CAPTURE.REFUNDED</em>, and copy its webhook ID into{" "}
          <code className="font-mono text-[12px]">PAYPAL_WEBHOOK_ID</code> —
          signature verification uses it to reject forged payloads.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    icon: "auto_awesome",
    question: "How do AI gateway keys work?",
    answer: (
      <p>
        The AI Commerce Intelligence features call an OpenAI-compatible endpoint.
        Set <code className="font-mono text-[12px]">AI_BASE_URL</code>,{" "}
        <code className="font-mono text-[12px]">AI_API_KEY</code>, and optionally{" "}
        <code className="font-mono text-[12px]">AI_MODEL</code> (default{" "}
        <code className="font-mono text-[12px]">glm-5.3-flash</code>). Without a
        key the insights page shows a setup notice and the generate buttons are
        disabled — CampusHub never fabricates AI results. Insights are grounded
        in real database aggregates only.
      </p>
    ),
  },
  {
    id: "sponsors",
    icon: "extension",
    question: "Where do Channel3, Astropods, and Bryntum keys go?",
    answer: (
      <>
        <p>
          <strong>Channel3</strong> (market discovery): set{" "}
          <code className="font-mono text-[12px]">CHANNEL3_API_KEY</code>; the
          discovery widget stays hidden without it.
        </p>
        <p>
          <strong>Astropods</strong> (analyst agent): set{" "}
          <code className="font-mono text-[12px]">ASTROPODS_API_KEY</code>; the
          agent spec lives in{" "}
          <code className="font-mono text-[12px]">
            agents/campushub-analyst.yaml
          </code>
          .
        </p>
        <p>
          <strong>Bryntum Scheduler</strong> (events timeline): set{" "}
          <code className="font-mono text-[12px]">BRYNTUM_LICENSE_KEY</code>.
          Without a valid license the trial build is used and says so — it never
          pretends to be licensed.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    icon: "undo",
    question: "What is the refunds workflow?",
    answer: (
      <>
        <p>
          Refunds start in PayPal (sandbox or live): issue a refund for a capture
          from the PayPal Dashboard or API. When the refund completes, PayPal
          sends a <em>PAYMENT.CAPTURE.REFUNDED</em> webhook; CampusHub verifies
          its signature, marks the order{" "}
          <code className="font-mono text-[12px]">refunded</code>, records a{" "}
          <code className="font-mono text-[12px]">refund</code> transaction, and
          restores event ticket stock.
        </p>
        <p>
          Refunded orders are excluded from revenue KPIs and appear with a
          “refunded” badge in the orders workspace.
        </p>
      </>
    ),
  },
];

export default function HelpPage() {
  const subject = encodeURIComponent("CampusHub 2.0 support request");
  const body = encodeURIComponent(
    "Hi CampusHub team,\n\nOrganization: \nIssue/question: \n\nThanks,",
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="help"
        title="Help & Support"
        subtitle="Setup guides, FAQs, and how to reach us"
      />

      <section className="space-y-2">
        {FAQS.map((faq) => (
          <details
            key={faq.id}
            className="group overflow-hidden rounded-xl border border-outline-variant bg-surface-lowest open:border-secondary/50"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
              <span className="material-symbols-outlined text-[20px] text-secondary">
                {faq.icon}
              </span>
              <span className="flex-1 text-headline-sm text-ink">
                {faq.question}
              </span>
              <span className="material-symbols-outlined text-[20px] text-muted transition-transform group-open:rotate-180">
                expand_more
              </span>
            </summary>
            <div className="space-y-2 border-t border-outline-variant px-4 py-3 text-body-md text-muted [&_p]:leading-relaxed">
              {faq.answer}
            </div>
          </details>
        ))}
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-lowest p-6">
        <h3 className="text-headline-sm text-ink mb-1">Contact support</h3>
        <p className="text-body-md text-muted mb-4">
          Email us and we’ll get back to you within one business day.
        </p>
        <a
          href={`mailto:support@campushub.app?subject=${subject}&body=${body}`}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-label-lg font-semibold text-white transition hover:opacity-90 dark:text-on-primary-container"
        >
          <span className="material-symbols-outlined text-[18px]">mail</span>
          Email support
        </a>
        <p className="mt-3 text-body-sm text-muted">
          Note: in-app support tickets are not yet wired to a backend — email is
          the supported channel for now.
        </p>
      </section>
    </div>
  );
}
