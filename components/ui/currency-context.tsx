"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { formatMoney, formatMoneyCompact } from "@/lib/money";

export type CurrencyCode = "MYR" | "USD" | "SGD" | "EUR" | "GBP";

export const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { code: CurrencyCode; symbol: string; label: string; rateFromMyr: number }
> = {
  MYR: { code: "MYR", symbol: "RM", label: "MYR (RM)", rateFromMyr: 1 },
  USD: { code: "USD", symbol: "$", label: "USD ($)", rateFromMyr: 0.23 },
  SGD: { code: "SGD", symbol: "S$", label: "SGD (S$)", rateFromMyr: 0.31 },
  EUR: { code: "EUR", symbol: "€", label: "EUR (€)", rateFromMyr: 0.21 },
  GBP: { code: "GBP", symbol: "£", label: "GBP (£)", rateFromMyr: 0.18 },
};

const STORAGE_KEY = "ch-active-currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (next: CurrencyCode) => void;
  format: (myrCents: number) => string;
  formatCompact: (myrCents: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "MYR",
  setCurrency: () => {},
  format: (cents) => formatMoney(cents, "MYR"),
  formatCompact: (cents) => formatMoneyCompact(cents, "MYR"),
});

export function CurrencyProvider({
  children,
  initialCurrency = "MYR",
}: {
  children: React.ReactNode;
  initialCurrency?: CurrencyCode;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (saved && saved in CURRENCY_CONFIG) {
      const raf = requestAnimationFrame(() => setCurrencyState(saved));
      return () => cancelAnimationFrame(raf);
    }
  }, []);

  const setCurrency = (next: CurrencyCode) => {
    setCurrencyState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `ch-currency=${next}; path=/; max-age=31536000`;
      window.dispatchEvent(new Event("ch-currency-changed"));
    }
  };

  const value = useMemo<CurrencyContextValue>(() => {
    const meta = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.MYR;
    return {
      currency,
      setCurrency,
      format: (myrCents: number) => {
        const converted = Math.round(myrCents * meta.rateFromMyr);
        return formatMoney(converted, currency);
      },
      formatCompact: (myrCents: number) => {
        const converted = Math.round(myrCents * meta.rateFromMyr);
        return formatMoneyCompact(converted, currency);
      },
    };
  }, [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

/** Reactive currency selector for Dashboard header and Storefront. */
export function UniversalCurrencySelector({
  className,
}: {
  className?: string;
}) {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="relative inline-flex items-center">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        aria-label="Select active currency"
        className={
          "focus-aura h-9 appearance-none rounded-lg border border-outline-variant/60 bg-surface-low/80 pl-2.5 pr-7 text-label-sm font-bold text-on-surface outline-none hover:bg-surface-container transition-colors cursor-pointer tabular-nums " +
          (className ?? "")
        }
      >
        {(Object.keys(CURRENCY_CONFIG) as CurrencyCode[]).map((code) => (
          <option key={code} value={code}>
            {CURRENCY_CONFIG[code].label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined text-[15px] text-on-surface-variant pointer-events-none absolute right-2">
        expand_more
      </span>
    </div>
  );
}
