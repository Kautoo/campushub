import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { StatStrip } from "@/components/ui/kpi-card";
import { TxnGrid, type TxnRow } from "@/components/workspaces/txn-grid";

export const metadata = { title: "Transactions — CampusHub 2.0" };

export default async function TransactionsPage() {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return <SetupNotice what="transactions" />;

  const { data } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const txns = (data ?? []) as TxnRow[];

  const completedPaymentsCents = txns
    .filter((t) => t.type === "payment" && t.status === "completed")
    .reduce((s, t) => s + t.amount_cents, 0);
  const refundsCents = txns
    .filter((t) => t.type === "refund" && t.status === "completed")
    .reduce((s, t) => s + t.amount_cents, 0);
  const verifiedCount = txns.filter((t) => t.verified).length;
  const unverifiedCount = txns.length - verifiedCount;

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="payments"
        title="Transactions"
        subtitle="PayPal payments and refunds with server-side verification status"
      />

      <StatStrip
        items={[
          {
            label: "Completed payments",
            value: completedPaymentsCents,
            icon: "payments",
            format: "money",
          },
          {
            label: "Refunds",
            value: refundsCents,
            icon: "currency_exchange",
            tone: "neutral",
            format: "money",
          },
          {
            label: "Verified",
            value: verifiedCount,
            icon: "verified",
          },
          {
            label: "Unverified",
            value: unverifiedCount,
            icon: "gpp_maybe",
            tone: "neutral",
          },
        ]}
      />

      <section className="rounded-xl border border-outline-variant bg-surface-lowest">
        {txns.length === 0 ? (
          <EmptyState
            icon="payments"
            title="No transactions yet"
            body="Captured PayPal payments and refunds will appear here."
            className="m-4"
          />
        ) : (
          <TxnGrid rows={txns} />
        )}
      </section>
    </div>
  );
}
