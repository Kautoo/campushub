"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type StoreCurrencyCode = "MYR" | "USD" | "SGD" | "EUR" | "GBP";

export const STORE_CURRENCIES: Record<
  StoreCurrencyCode,
  { code: StoreCurrencyCode; symbol: string; label: string; rateFromMyr: number }
> = {
  MYR: { code: "MYR", symbol: "RM", label: "MYR (RM)", rateFromMyr: 1 },
  USD: { code: "USD", symbol: "$", label: "USD ($)", rateFromMyr: 0.23 },
  SGD: { code: "SGD", symbol: "S$", label: "SGD (S$)", rateFromMyr: 0.31 },
  EUR: { code: "EUR", symbol: "€", label: "EUR (€)", rateFromMyr: 0.21 },
  GBP: { code: "GBP", symbol: "£", label: "GBP (£)", rateFromMyr: 0.18 },
};

const STORAGE_KEY = "ch-store-currency";

type CurrencyContextValue = {
  currency: StoreCurrencyCode;
  setCurrency: (next: StoreCurrencyCode) => void;
  format: (myrCents: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "MYR",
  setCurrency: () => {},
  format: (cents) =>
    `RM ${(cents / 100).toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
});

export function StoreCurrencyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState<StoreCurrencyCode>("MYR");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as StoreCurrencyCode | null;
    if (saved && saved in STORE_CURRENCIES) {
      const raf = requestAnimationFrame(() => setCurrencyState(saved));
      return () => cancelAnimationFrame(raf);
    }
  }, []);

  const setCurrency = (next: StoreCurrencyCode) => {
    setCurrencyState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const value = useMemo<CurrencyContextValue>(() => {
    const meta = STORE_CURRENCIES[currency] ?? STORE_CURRENCIES.MYR;
    return {
      currency,
      setCurrency,
      format: (myrCents: number) => {
        const converted = (myrCents / 100) * meta.rateFromMyr;
        return `${meta.symbol} ${converted.toLocaleString("en-MY", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    };
  }, [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useStoreCurrency() {
  return useContext(CurrencyContext);
}

/** Reactive price formatter component for Server and Client storefront pages. */
export function StorePrice({
  cents,
  className,
}: {
  cents: number;
  className?: string;
}) {
  const { format } = useStoreCurrency();
  return <span className={className}>{format(cents)}</span>;
}

/** Compact currency selector pill for the storefront navbar. */
export function CurrencySelector() {
  const { currency, setCurrency } = useStoreCurrency();

  return (
    <div className="relative inline-flex items-center">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as StoreCurrencyCode)}
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
