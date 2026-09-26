"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { DASHBOARD_PERIODS } from "@/features/dashboard/types";
import type { DashboardPeriod } from "@/features/dashboard/types";
import type { TransactionCurrency } from "@/features/transactions/types";

type DashboardFiltersProps = {
  period: DashboardPeriod;
  currency: TransactionCurrency;
};

const CURRENCY_OPTIONS = (["BOB", "USD"] as const).map((value) => ({
  value,
  label: value,
}));

export function DashboardFilters({ period, currency }: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useOptimistic(
    { period, currency },
    (state, patch: Partial<DashboardFiltersProps>) => ({ ...state, ...patch }),
  );

  function updateParam<K extends keyof DashboardFiltersProps>(
    key: K,
    value: DashboardFiltersProps[K],
  ) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    startTransition(() => {
      setSelected({ [key]: value });
      router.replace(`/?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Segmented
        label="Período"
        value={selected.period}
        options={DASHBOARD_PERIODS}
        onChange={(value) => updateParam("period", value)}
        className="sm:flex-1"
      />
      <Segmented
        label="Moneda"
        value={selected.currency}
        options={CURRENCY_OPTIONS}
        onChange={(value) => updateParam("currency", value)}
      />
    </div>
  );
}
