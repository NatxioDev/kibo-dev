"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useOptimistic, useTransition } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Field, inputClassName, labelClassName } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { accountIcon } from "@/features/accounts/components/accountIcon";
import { todayDateInputValue } from "@/features/transactions/components/formatters";
import type { Account } from "@/features/transactions/types";
import type {
  TransactionListAccountFilter,
  TransactionListTypeFilter,
} from "@/features/transactions/utils/listFilters";
import { isTransactionListFiltered } from "@/features/transactions/utils/listFilters";

type TransactionListFiltersProps = {
  type: TransactionListTypeFilter;
  accountId: TransactionListAccountFilter;
  from?: string;
  to?: string;
  accounts: Account[];
  resultCount: number | null;
  children: ReactNode;
};

type Filters = {
  type: TransactionListTypeFilter;
  accountId: TransactionListAccountFilter;
  from?: string;
  to?: string;
};

const TYPE_OPTIONS: { value: TransactionListTypeFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "EXPENSE", label: "Gastos" },
  { value: "INCOME", label: "Ingresos" },
];

function toHref({ type, accountId, from, to }: Filters): string {
  const params = new URLSearchParams();
  if (type !== "all") params.set("type", type);
  if (accountId !== "all") params.set("account", accountId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

function AccountPill({
  selected,
  onSelect,
  icon,
  muted = false,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: string;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap transition-[transform,background-color,border-color,color] duration-200 active:scale-95 ${
        selected
          ? "border-transparent bg-primary text-primary-foreground"
          : `glass border-border bg-surface hover:bg-surface-muted ${
              muted ? "text-muted-foreground" : "text-foreground"
            }`
      }`}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </button>
  );
}

export function TransactionListFilters({
  type,
  accountId,
  from,
  to,
  accounts,
  resultCount,
  children,
}: TransactionListFiltersProps) {
  const router = useRouter();
  const [filters, setFilters] = useOptimistic<Filters>({
    type,
    accountId,
    from,
    to,
  });
  const [isPending, startTransition] = useTransition();
  const filtersActive = isTransactionListFiltered(filters);
  const dateFilterActive = Boolean(filters.from || filters.to);
  const today = todayDateInputValue();

  const sortedAccounts = [...accounts].sort(
    (a, b) => Number(b.is_active) - Number(a.is_active),
  );

  function apply(next: Partial<Filters>) {
    const merged = { ...filters, ...next };
    startTransition(() => {
      setFilters(merged);
      router.replace(toHref(merged), { scroll: false });
    });
  }

  function updateDate(key: "from" | "to", value: string) {
    apply({ [key]: value || undefined });
  }

  return (
    <>
      <Reveal className="flex flex-col gap-3">
        <Segmented
          label="Filtrar por tipo"
          value={filters.type}
          options={TYPE_OPTIONS}
          onChange={(value) => apply({ type: value })}
        />

        {accounts.length > 0 ? (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div role="group" aria-label="Filtrar por cuenta" className="flex gap-2">
              <AccountPill
                selected={filters.accountId === "all"}
                onSelect={() => apply({ accountId: "all" })}
              >
                Todas las cuentas
              </AccountPill>
              {sortedAccounts.map((account) => (
                <AccountPill
                  key={account.id}
                  icon={accountIcon(account.type)}
                  muted={!account.is_active}
                  selected={filters.accountId === account.id}
                  onSelect={() => apply({ accountId: account.id })}
                >
                  {account.name}
                </AccountPill>
              ))}
              <AccountPill
                muted
                selected={filters.accountId === "none"}
                onSelect={() => apply({ accountId: "none" })}
              >
                Sin cuenta
              </AccountPill>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 px-1">
            <span className={labelClassName}>Rango de fechas</span>
            {dateFilterActive ? (
              <button
                type="button"
                onClick={() => apply({ from: undefined, to: undefined })}
                className="text-sm font-semibold text-primary transition-opacity hover:opacity-80"
              >
                Limpiar fechas
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label="Desde" htmlFor="filter-from">
              <input
                id="filter-from"
                name="from"
                type="date"
                value={filters.from ?? ""}
                max={filters.to && filters.to < today ? filters.to : today}
                onChange={(event) => updateDate("from", event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Hasta" htmlFor="filter-to">
              <input
                id="filter-to"
                name="to"
                type="date"
                value={filters.to ?? ""}
                min={filters.from}
                max={today}
                onChange={(event) => updateDate("to", event.target.value)}
                className={inputClassName}
              />
            </Field>
          </div>
        </div>

        {resultCount !== null && (resultCount > 0 || filtersActive) ? (
          <div className="flex min-h-8 items-center justify-between gap-3 px-1 text-sm">
            <p className="text-muted-foreground tabular-nums" aria-live="polite">
              {isPending
                ? "Filtrando…"
                : `${resultCount} ${resultCount === 1 ? "movimiento" : "movimientos"}`}
            </p>
            {filtersActive && resultCount > 0 ? (
              <button
                type="button"
                onClick={() =>
                  apply({
                    type: "all",
                    accountId: "all",
                    from: undefined,
                    to: undefined,
                  })
                }
                className="font-semibold text-primary transition-opacity hover:opacity-80"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        ) : null}
      </Reveal>

      <div
        aria-busy={isPending}
        className={`transition-opacity duration-200 ${isPending ? "pointer-events-none opacity-50" : ""}`}
      >
        {children}
      </div>
    </>
  );
}
