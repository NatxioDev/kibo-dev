"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_PERIODS } from "@/features/dashboard/types";
import type { DashboardPeriod } from "@/features/dashboard/types";
import type { TransactionCurrency } from "@/features/transactions/types";

type DashboardFiltersProps = {
  period: DashboardPeriod;
  currency: TransactionCurrency;
};

const selectClassName =
  "h-11 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-50 outline-none focus:border-zinc-500";

export function DashboardFilters({ period, currency }: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: "period" | "currency", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`/?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-zinc-500">Período</span>
        <select
          className={selectClassName}
          value={period}
          onChange={(event) => updateParam("period", event.target.value)}
          aria-label="Período"
        >
          {DASHBOARD_PERIODS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-zinc-500">Moneda</span>
        <select
          className={selectClassName}
          value={currency}
          onChange={(event) => updateParam("currency", event.target.value)}
          aria-label="Moneda"
        >
          <option value="BOB">BOB</option>
          <option value="USD">USD</option>
        </select>
      </label>
    </div>
  );
}
