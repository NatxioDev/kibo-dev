"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { ChipScroller, ChoiceChip } from "@/components/ui/ChoiceChip";
import { Segmented } from "@/components/ui/Segmented";
import { accountIcon } from "@/features/accounts/components/accountIcon";
import type { Account } from "@/features/transactions/types";
import type {
  TransactionListAccountFilter,
  TransactionListTypeFilter,
} from "@/features/transactions/utils/listFilters";

type TransactionListFiltersProps = {
  type: TransactionListTypeFilter;
  accountId: TransactionListAccountFilter;
  accounts: Account[];
};

const TYPE_OPTIONS: { value: TransactionListTypeFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "EXPENSE", label: "Gastos" },
  { value: "INCOME", label: "Ingresos" },
];

export function TransactionListFilters({
  type,
  accountId,
  accounts,
}: TransactionListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [optimisticType, setOptimisticType] = useOptimistic(type);
  const [optimisticAccountId, setOptimisticAccountId] = useOptimistic(accountId);
  const [, startTransition] = useTransition();

  function replaceParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("currency");
    mutate(params);
    const query = params.toString();
    router.replace(query ? `/transactions?${query}` : "/transactions", {
      scroll: false,
    });
  }

  function updateType(value: TransactionListTypeFilter) {
    startTransition(() => {
      setOptimisticType(value);
      replaceParams((params) => {
        if (value === "all") {
          params.delete("type");
        } else {
          params.set("type", value);
        }
      });
    });
  }

  function updateAccount(value: TransactionListAccountFilter) {
    startTransition(() => {
      setOptimisticAccountId(value);
      replaceParams((params) => {
        if (value === "all") {
          params.delete("account");
        } else {
          params.set("account", value);
        }
      });
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Segmented
        label="Filtrar por tipo"
        value={optimisticType}
        options={TYPE_OPTIONS}
        onChange={updateType}
      />

      {accounts.length > 0 ? (
        <ChipScroller>
          <div
            role="group"
            aria-label="Filtrar por cuenta"
            className="flex gap-2"
          >
            <ChoiceChip
              selected={optimisticAccountId === "all"}
              onSelect={() => updateAccount("all")}
              className="h-10 min-w-24 px-3 text-sm"
            >
              Todas
            </ChoiceChip>
            <ChoiceChip
              selected={optimisticAccountId === "none"}
              onSelect={() => updateAccount("none")}
              className="h-10 min-w-24 px-3 text-sm"
            >
              Sin cuenta
            </ChoiceChip>
            {accounts.map((account) => (
              <ChoiceChip
                key={account.id}
                icon={accountIcon(account.type)}
                selected={optimisticAccountId === account.id}
                onSelect={() => updateAccount(account.id)}
                className="h-10 min-w-24 px-3 text-sm"
              >
                {account.name}
              </ChoiceChip>
            ))}
          </div>
        </ChipScroller>
      ) : null}
    </div>
  );
}
