import { SectionHeader } from "@/components/ui/primitives";
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeading,
  AccordionTrigger,
  AccordionIndicator,
  AccordionPanel,
  AccordionBody,
} from "@heroui/react";

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
            agents/astropods.yml
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
    <div className="space-y-space-lg">
      <SectionHeader
        icon="help"
        title="Help & Support Center"
        subtitle="Setup guides, FAQs, and how to reach the CampusHub team."
      />

      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <AccordionRoot className="flex flex-col">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.id} id={faq.id} className="group">
              <AccordionHeading>
                <AccordionTrigger className="flex w-full cursor-pointer items-center gap-3 px-space-md py-space-md text-left">
                  <span className="material-symbols-outlined text-[20px] text-secondary">
                    {faq.icon}
                  </span>
                  <span className="flex-1 font-headline-sm text-headline-sm text-on-surface">
                    {faq.question}
                  </span>
                  <AccordionIndicator className="text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">
                      expand_more
                    </span>
                  </AccordionIndicator>
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel className="border-t border-outline-variant px-space-md py-space-md">
                <AccordionBody className="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant [&_p]:leading-relaxed">
                  {faq.answer}
                </AccordionBody>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </AccordionRoot>
      </section>

      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Contact support</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-4">
          Email us and we’ll get back to you within one business day.
        </p>
        <a
          href={`mailto:support@campushub.app?subject=${subject}&body=${body}`}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-label-lg font-semibold text-white transition hover:opacity-90 dark:text-on-primary-container"
        >
          <span className="material-symbols-outlined text-[18px]">mail</span>
          Email support
        </a>
        <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">
          Note: in-app support tickets are not yet wired to a backend — email is
          the supported channel for now.
        </p>
      </section>
    </div>
  );
}
