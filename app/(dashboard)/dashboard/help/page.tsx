import { SectionHeader } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeading,
  AccordionTrigger,
  AccordionIndicator,
  AccordionPanel,
  AccordionBody,
} from "@heroui/react";

export const metadata = { title: "Documentation & Runbook — CampusHub 2.0" };

const FAQS: {
  id: string;
  icon: string;
  question: string;
  answer: React.ReactNode;
}[] = [
  {
    id: "database",
    icon: "database",
    question: "How do I connect my Postgres database and apply the seed?",
    answer: (
      <>
        <p>
          CampusHub 2.0 uses a vanilla Postgres connection pool (
          <code className="font-mono text-xs">pg</code>) with explicit
          application-layer organization scoping in{" "}
          <code className="font-mono text-xs">lib/db/repo.ts</code>.
        </p>
        <p className="mt-2">
          Set <code className="font-mono text-xs">DATABASE_URL</code> in{" "}
          <code className="font-mono text-xs">.env.local</code>, then apply the
          schema and demo seed:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-container p-3 font-mono text-xs">
          psql &quot;$DATABASE_URL&quot; -f db/schema.sql -f db/seed.sql
        </pre>
      </>
    ),
  },
  {
    id: "paypal",
    icon: "account_balance_wallet",
    question: "How do PayPal Orders v2 and cryptographic webhooks work?",
    answer: (
      <>
        <p>
          Checkout validates cart items server-side via the{" "}
          <code className="font-mono text-xs">place_order</code> Postgres RPC
          function, builds the PayPal order from the authoritative database
          total, and verifies <code className="font-mono text-xs">COMPLETED</code>{" "}
          status before marking orders paid.
        </p>
        <p className="mt-2">
          Configure <code className="font-mono text-xs">PAYPAL_CLIENT_ID</code>,{" "}
          <code className="font-mono text-xs">PAYPAL_CLIENT_SECRET</code>,{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>
          , and <code className="font-mono text-xs">PAYPAL_WEBHOOK_ID</code>.
        </p>
      </>
    ),
  },
  {
    id: "bryntum-aggrid",
    icon: "view_timeline",
    question:
      "How are Bryntum Scheduler and AG Grid Community integrated?",
    answer: (
      <>
        <p>
          <strong>Bryntum Scheduler 8.0</strong> powers the interactive Event
          Timeline &amp; Calendar views on{" "}
          <code className="font-mono text-xs">/dashboard/events</code> (supporting
          Venue, Category, and Initiative tracks, Day/Week/Multi-Week/Semester
          presets, Horizontal Timeline &amp; Vertical Calendar modes, and
          drag-and-drop rescheduling).
        </p>
        <p className="mt-2">
          <strong>AG Grid Community 36</strong> powers all structured data
          management tables across Events, Registrations, Products, Orders,
          Transactions, and Members with instant quick-filtering, status pills,
          density controls, and CSV export.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    icon: "auto_awesome",
    question: "How does Grounded AI prevent hallucinated numbers?",
    answer: (
      <>
        <p>
          Every AI request fetches a fresh metrics pack from{" "}
          <code className="font-mono text-xs">POST /api/insights/pack</code>{" "}
          containing aggregated Postgres figures (daily revenue, tier
          sell-through, refund totals, and low-stock counts). Raw customer PII
          is never sent to the model, and the system prompt forbids citing
          numbers outside the pack.
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
    <div className="space-y-6">
      <SectionHeader
        icon="help"
        eyebrow="Operations Runbook & Architecture"
        title="Help & Administrator Documentation"
        subtitle="Reference guides for Postgres database provisioning, PayPal Orders v2 webhook verification, Bryntum Scheduler, AG Grid Community, and Grounded AI."
        actions={<Badge tone="teal">CampusHub v2.0</Badge>}
      />

      {/* Stack Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-secondary-container/50 text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[19px]">
              view_timeline
            </span>
          </div>
          <h3 className="text-headline-sm font-bold text-on-surface">
            Bryntum Scheduler 8.0
          </h3>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            Dedicated to event scheduling, multi-venue capacity planning,
            horizontal timelines, and vertical calendar views.
          </p>
        </div>

        <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-primary-fixed/60 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[19px]">
              table_chart
            </span>
          </div>
          <h3 className="text-headline-sm font-bold text-on-surface">
            AG Grid Community 36
          </h3>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            Dedicated to high-density transactional ledgers across Events,
            Registrations, Products, Orders, and Transactions.
          </p>
        </div>

        <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-tertiary-fixed/35 text-on-tertiary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[19px]">
              account_balance_wallet
            </span>
          </div>
          <h3 className="text-headline-sm font-bold text-on-surface">
            PayPal Orders v2 &amp; AI
          </h3>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            Atomic Postgres <code className="font-mono text-xs">place_order</code>{" "}
            checkout, HMAC webhook verification, and grounded AI analytics.
          </p>
        </div>
      </div>

      {/* Interactive FAQ Accordion */}
      <section className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
        <h3 className="text-headline-sm font-bold text-on-surface mb-4">
          Frequently Asked Operational Questions
        </h3>
        <AccordionRoot className="divide-y divide-outline-variant/40">
          {FAQS.map((f) => (
            <AccordionItem key={f.id} id={f.id} className="py-2">
              <AccordionHeading>
                <AccordionTrigger className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-body-lg font-semibold text-on-surface hover:text-primary">
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-secondary">
                      {f.icon}
                    </span>
                    {f.question}
                  </span>
                  <AccordionIndicator />
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel>
                <AccordionBody className="pb-3 pl-8 text-body-md text-on-surface-variant leading-relaxed">
                  {f.answer}
                </AccordionBody>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </AccordionRoot>
      </section>

      {/* Support Card */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
        <div>
          <h3 className="text-headline-sm font-bold text-on-surface">
            Need direct institutional support?
          </h3>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Contact the CampusHub platform engineering desk for bursary settlement or custom webhook onboarding.
          </p>
        </div>
        <a
          href={`mailto:support@campushub.hyria.top?subject=${subject}&body=${body}`}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:bg-primary-container transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[17px]">mail</span>
          <span>Contact Engineering Desk</span>
        </a>
      </section>
    </div>
  );
}
