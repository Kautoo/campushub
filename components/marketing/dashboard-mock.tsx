import { BorderBeam } from "@/components/magicui";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

type MockOrder = {
  order_number: string;
  customer: string;
  item: string;
  total_cents: number;
  status: "paid" | "pending" | "fulfilled";
};

const ORDERS: MockOrder[] = [
  { order_number: "CH-1040", customer: "Aminah H.", item: "Hoodie — Midnight × 1", total_cents: 11900, status: "paid" },
  { order_number: "CH-1039", customer: "Wei Jian L.", item: "Innovation Week — VIP Pass × 2", total_cents: 39800, status: "fulfilled" },
  { order_number: "CH-1038", customer: "Priya N.", item: "Sticker Pack × 3", total_cents: 2400, status: "pending" },
];

const SPARK = [12, 18, 14, 22, 19, 28, 24, 34, 30, 42, 38, 52];
const SPARK_W = 280;
const SPARK_H = 72;

function sparklinePath(values: number[]): string {
  const max = Math.max(...values);
  const step = SPARK_W / (values.length - 1);
  return values
    .map((v, i) => {
      const x = (i * step).toFixed(1);
      const y = (SPARK_H - (v / max) * (SPARK_H - 8) - 4).toFixed(1);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

/**
 * The product's own UI as live HTML (taste rule for software): a miniature
 * CampusHub dashboard — KPI tiles, revenue sparkline, order rows. Real seed
 * figures; no screenshots.
 */
export function DashboardMock() {
  const statusTone = { paid: "success", pending: "warning", fulfilled: "teal" } as const;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-lowest shadow-[0_24px_80px_-24px_rgba(0,22,46,0.35)] dark:shadow-[0_24px_80px_-24px_rgba(87,241,219,0.12)]">
      <BorderBeam size={90} duration={10} />

      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-low px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-3 rounded-md bg-surface-container px-3 py-1 font-mono text-[11px] text-muted">
          campushub.app/dashboard
        </span>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-5">
        {/* KPI tiles */}
        <div className="space-y-3 sm:col-span-2">
          <div className="rounded-xl border border-outline-variant bg-surface-lowest p-4">
            <p className="text-label-sm text-muted uppercase tracking-wide">Revenue</p>
            <p className="text-headline-md text-ink mt-1 tabular-nums">RM 45,230</p>
            <div className="mt-2">
              <svg viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} className="h-12 w-full" aria-hidden>
                <defs>
                  <linearGradient id="mockSpark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--st-gradient-a)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--st-gradient-a)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${sparklinePath(SPARK)} L${SPARK_W},${SPARK_H} L0,${SPARK_H} Z`} fill="url(#mockSpark)" />
                <path d={sparklinePath(SPARK)} fill="none" stroke="var(--st-gradient-a)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-outline-variant bg-surface-lowest p-4">
              <p className="text-label-sm text-muted uppercase tracking-wide">Tickets</p>
              <p className="text-headline-sm text-ink mt-1 tabular-nums">1,420</p>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-lowest p-4">
              <p className="text-label-sm text-muted uppercase tracking-wide">Members</p>
              <p className="text-headline-sm text-ink mt-1 tabular-nums">2,847</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-xl border border-outline-variant bg-surface-lowest sm:col-span-3">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-label-md text-ink font-semibold">Recent orders</p>
            <Badge tone="teal" icon="bolt">live</Badge>
          </div>
          <ul>
            {ORDERS.map((o) => (
              <li key={o.order_number} className="flex items-center justify-between gap-3 border-t border-outline-variant px-4 py-3">
                <div className="min-w-0">
                  <p className="font-mono text-[12px] text-muted">{o.order_number}</p>
                  <p className="text-body-sm text-ink truncate">{o.item}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-body-sm text-ink font-semibold tabular-nums">
                    {formatMoney(o.total_cents)}
                  </p>
                  <Badge tone={statusTone[o.status]}>{o.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
