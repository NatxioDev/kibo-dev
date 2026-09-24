"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { TransactionListTypeFilter } from "@/features/transactions/utils/listFilters";

type TransactionListFiltersProps = {
  type: TransactionListTypeFilter;
};

const TYPE_OPTIONS: { value: TransactionListTypeFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "EXPENSE", label: "Gastos" },
  { value: "INCOME", label: "Ingresos" },
];

const chipBase =
  "inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors";
const chipActive =
  "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900";
const chipIdle =
  "border border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200";

export function TransactionListFilters({ type }: TransactionListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateType(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("currency");
    if (value === "all") {
      params.delete("type");
    } else {
      params.set("type", value);
    }
    const query = params.toString();
    router.replace(query ? `/transactions?${query}` : "/transactions");
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo">
      {TYPE_OPTIONS.map((option) => {
        const active = type === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => updateType(option.value)}
            className={`${chipBase} ${active ? chipActive : chipIdle}`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
