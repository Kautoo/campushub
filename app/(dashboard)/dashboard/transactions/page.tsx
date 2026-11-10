import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { StatStrip } from "@/components/ui/kpi-card";
import { TxnGrid, type TxnRow } from "@/components/workspaces/txn-grid";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { transactions } from "@/lib/db/repo";

export const metadata = { title: "Transactions & Webhooks — CampusHub" };

export default async function TransactionsPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="transactions" />;
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const txns = (await transactions.list(session.orgIds, 200)) as TxnRow[];

  const completedPaymentsCents = txns
    .filter((t) => t.type === "payment" && t.status === "completed")
    .reduce((s, t) => s + t.amount_cents, 0);
  const refundsCents = txns
    .filter((t) => t.type === "refund" && t.status === "completed")
    .reduce((s, t) => s + t.amount_cents, 0);
  const verifiedCount = txns.filter((t) => t.verified).length;
  const unverifiedCount = txns.length - verifiedCount;
  const verificationRate =
    txns.length > 0 ? Math.round((verifiedCount / txns.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="account_balance_wallet"
        eyebrow="Payment Gateway Reconciliation"
        title="Transactions & PayPal Webhook Ledger"
        subtitle="Audit captured PayPal Orders v2 payments, refund settlements, and cryptographic webhook signature verification status."
      />

      <StatStrip
        items={[
          {
            label: "Captured Payments",
            value: completedPaymentsCents,
            icon: "payments",
            format: "money",
            tone: "teal",
            sublabel: "Settled into bursary escrow",
          },
          {
            label: "Issued Refunds",
            value: refundsCents,
            icon: "currency_exchange",
            tone: "neutral",
            format: "money",
            sublabel: "Completed refund reversals",
          },
          {
            label: "HMAC Verified",
            value: verifiedCount,
            icon: "verified",
            tone: "success",
            sublabel: `${verificationRate}% webhook signature match`,
          },
          {
            label: "Pending Verification",
            value: unverifiedCount,
            icon: "gpp_maybe",
            tone: "neutral",
            sublabel: "Awaiting webhook callback",
          },
        ]}
      />

      <section className="rounded-2xl border border-outline-variant/45 bg-surface-lowest shadow-xs overflow-hidden">
        {txns.length === 0 ? (
          <EmptyState
            icon="payments"
            title="No transactions yet"
            body="Captured PayPal payments and refunds will appear here."
            className="m-5"
          />
        ) : (
          <TxnGrid rows={txns} />
        )}
      </section>
    </div>
  );
}
