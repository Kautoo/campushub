"use client";

import {
  CurrencyProvider,
  useCurrency,
  CURRENCY_CONFIG,
  type CurrencyCode,
} from "@/components/ui/currency-context";
import { useRouter } from "next/navigation";

export type StoreCurrencyCode = CurrencyCode;
export const STORE_CURRENCIES = CURRENCY_CONFIG;

export function StoreCurrencyProvider({
  children,
  initialCurrency = "MYR",
}: {
  children: React.ReactNode;
  initialCurrency?: StoreCurrencyCode;
}) {
  return (
    <CurrencyProvider initialCurrency={initialCurrency}>
      {children}
    </CurrencyProvider>
  );
}

export function useStoreCurrency() {
  return useCurrency();
}

/** Reactive price formatter component for Server and Client storefront pages. */
export function StorePrice({
  cents,
  className,
}: {
  cents: number;
  className?: string;
}) {
  const { format } = useCurrency();
  return <span className={className}>{format(cents)}</span>;
}

/** Compact currency selector pill for the storefront navbar. */
export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const router = useRouter();

  return (
    <div className="relative inline-flex items-center">
      <select
        value={currency}
        onChange={(e) => {
          const next = e.target.value as StoreCurrencyCode;
          setCurrency(next);
          try {
            router.refresh();
          } catch {}
        }}
        aria-label="Select storefront currency"
        className="focus-aura h-9 appearance-none rounded-full border border-outline-variant/60 bg-surface-low/80 pl-3 pr-7 text-label-sm font-bold text-on-surface outline-none hover:bg-surface-container transition-colors cursor-pointer tabular-nums"
      >
        {(Object.keys(STORE_CURRENCIES) as StoreCurrencyCode[]).map((code) => (
          <option key={code} value={code}>
            {STORE_CURRENCIES[code].label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined text-[15px] text-on-surface-variant pointer-events-none absolute right-2">
        expand_more
      </span>
    </div>
  );
}
