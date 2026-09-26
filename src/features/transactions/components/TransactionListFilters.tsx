"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Segmented } from "@/components/ui/Segmented";
import type { TransactionListTypeFilter } from "@/features/transactions/utils/listFilters";

type TransactionListFiltersProps = {
  type: TransactionListTypeFilter;
};

const TYPE_OPTIONS: { value: TransactionListTypeFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "EXPENSE", label: "Gastos" },
  { value: "INCOME", label: "Ingresos" },
];

export function TransactionListFilters({ type }: TransactionListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [optimisticType, setOptimisticType] = useOptimistic(type);
  const [, startTransition] = useTransition();

  function updateType(value: TransactionListTypeFilter) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("currency");
    if (value === "all") {
      params.delete("type");
    } else {
      params.set("type", value);
    }
    const query = params.toString();
    startTransition(() => {
      setOptimisticType(value);
      router.replace(query ? `/transactions?${query}` : "/transactions", {
        scroll: false,
      });
    });
  }

  return (
    <Segmented
      label="Filtrar por tipo"
      value={optimisticType}
      options={TYPE_OPTIONS}
      onChange={updateType}
    />
  );
}
