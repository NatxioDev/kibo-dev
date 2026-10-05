"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TransactionCurrency } from "@/features/transactions/types";

type ReportesCurrencyToggleProps = {
  currency: TransactionCurrency;
};

export function ReportesCurrencyToggle({
  currency,
}: ReportesCurrencyToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCurrencyChange = (newCurrency: TransactionCurrency) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("currency", newCurrency);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex h-12 gap-1 rounded-full border border-border bg-surface p-1 shadow-sm">
      <button
        type="button"
        onClick={() => handleCurrencyChange("BOB")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-all ${
          currency === "BOB"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="text-base">🇧🇴</span>
        <span>Bolivianos</span>
      </button>
      <button
        type="button"
        onClick={() => handleCurrencyChange("USD")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-all ${
          currency === "USD"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="text-base">🇺🇸</span>
        <span>Dólares</span>
      </button>
    </div>
  );
}
