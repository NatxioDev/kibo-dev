"use client";

import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { Reveal } from "@/components/motion/Reveal";
import { KiboLoader } from "@/components/mascot/KiboLoader";
import { Segmented } from "@/components/ui/Segmented";
import { AccountsFilterSheet } from "@/features/transactions/components/filters/AccountsFilterSheet";
import { CategoryFilterSheet } from "@/features/transactions/components/filters/CategoryFilterSheet";
import { PeriodFilterSheet } from "@/features/transactions/components/filters/PeriodFilterSheet";
import type { Account, Category } from "@/features/transactions/types";
import {
  defaultTransactionListFilterState,
  isTransactionListFiltered,
  transactionFiltersToHref,
  type TransactionListFilterState,
  type TransactionListTypeFilter,
} from "@/features/transactions/utils/listFilters";
import {
  getPeriodChipLabel,
  isDefaultTransactionPeriod,
} from "@/features/transactions/utils/period";

type TransactionListFiltersProps = {
  filters: TransactionListFilterState;
  accounts: Account[];
  categories: Category[];
  resultCount: number | null;
  children: ReactNode;
};

type SheetId = "period" | "accounts" | "category" | null;

const TYPE_OPTIONS: { value: TransactionListTypeFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "EXPENSE", label: "Gastos" },
  { value: "INCOME", label: "Ingresos" },
];

function FilterChip({
  label,
  active,
  onClick,
  onClear,
  clearLabel,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onClear?: () => void;
  clearLabel?: string;
}) {
  return (
    <div
      className={`inline-flex h-9 shrink-0 items-center rounded-full border text-sm font-semibold whitespace-nowrap transition ${
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "glass border-border bg-surface text-foreground"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="inline-flex h-full items-center gap-1 px-3.5 transition active:scale-95"
      >
        <span>{label}</span>
        {!active ? (
          <span aria-hidden className="text-muted-foreground">
            ▾
          </span>
        ) : null}
      </button>
      {active && onClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label={clearLabel ?? `Quitar filtro ${label}`}
          className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden
            className="h-3 w-3"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

function accountsChipLabel(
  accountsFilter: TransactionListFilterState["accounts"],
  accounts: Account[],
): string {
  if (accountsFilter.mode === "all") return "Cuentas";
  if (accountsFilter.mode === "none") return "Sin cuenta";
  if (accountsFilter.ids.length === 1) {
    return (
      accounts.find((account) => account.id === accountsFilter.ids[0])?.name ??
      "1 cuenta"
    );
  }
  return `${accountsFilter.ids.length} cuentas`;
}

export function TransactionListFilters({
  filters: initialFilters,
  accounts,
  categories,
  resultCount,
  children,
}: TransactionListFiltersProps) {
  const router = useRouter();
  const [filters, setFilters] =
    useOptimistic<TransactionListFilterState>(initialFilters);
  const [isPending, startTransition] = useTransition();
  const [sheet, setSheet] = useState<SheetId>(null);

  const filtersActive = isTransactionListFiltered(filters);
  const periodActive = !isDefaultTransactionPeriod(filters.period);
  const accountsActive = filters.accounts.mode !== "all";
  const categoryActive = Boolean(filters.categoryId);

  const periodLabel = getPeriodChipLabel(filters.period, {
    from: filters.from ?? "",
    to: filters.to ?? "",
  });
  const categoryLabel =
    categories.find((category) => category.id === filters.categoryId)?.name ??
    "Categoría";

  function apply(next: Partial<TransactionListFilterState>) {
    const merged = { ...filters, ...next };
    startTransition(() => {
      setFilters(merged);
      router.replace(transactionFiltersToHref(merged), { scroll: false });
    });
  }

  function clearAll() {
    const defaults = defaultTransactionListFilterState();
    apply(defaults);
  }

  return (
    <>
      <Reveal className="flex flex-col gap-2.5">
        <Segmented
          label="Filtrar por tipo"
          value={filters.type}
          options={TYPE_OPTIONS}
          onChange={(value) => apply({ type: value })}
        />

        <div className="relative -mx-4">
          <div
            role="group"
            aria-label="Filtros de transacciones"
            className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <FilterChip
              label={periodLabel}
              active={periodActive}
              onClick={() => setSheet("period")}
              onClear={
                periodActive
                  ? () => {
                      const range = defaultTransactionListFilterState();
                      apply({
                        period: "this_month",
                        from: range.from,
                        to: range.to,
                      });
                    }
                  : undefined
              }
              clearLabel="Quitar filtro de período"
            />
            {accounts.length > 0 ? (
              <FilterChip
                label={accountsChipLabel(filters.accounts, accounts)}
                active={accountsActive}
                onClick={() => setSheet("accounts")}
                onClear={
                  accountsActive
                    ? () => apply({ accounts: { mode: "all" } })
                    : undefined
                }
                clearLabel="Quitar filtro de cuentas"
              />
            ) : null}
            {categories.length > 0 ? (
              <FilterChip
                label={categoryActive ? categoryLabel : "Categoría"}
                active={categoryActive}
                onClick={() => setSheet("category")}
                onClear={
                  categoryActive
                    ? () => apply({ categoryId: undefined })
                    : undefined
                }
                clearLabel="Quitar filtro de categoría"
              />
            ) : null}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent"
          />
        </div>

        {resultCount !== null && (resultCount > 0 || filtersActive) ? (
          <div className="flex min-h-7 items-center justify-between gap-3 px-1 text-sm">
            <p
              className="inline-flex items-center gap-2 text-muted-foreground tabular-nums"
              aria-live="polite"
            >
              {isPending ? (
                <>
                  <KiboLoader size={16} label={null} />
                  Filtrando…
                </>
              ) : (
                `${resultCount} ${resultCount === 1 ? "movimiento" : "movimientos"}`
              )}
            </p>
            {filtersActive ? (
              <button
                type="button"
                onClick={clearAll}
                className="font-semibold text-primary transition-opacity hover:opacity-80"
              >
                Limpiar
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

      <PeriodFilterSheet
        open={sheet === "period"}
        period={filters.period}
        from={filters.from}
        to={filters.to}
        onClose={() => setSheet(null)}
        onApply={(next) => {
          apply(next);
          setSheet(null);
        }}
      />

      <AccountsFilterSheet
        open={sheet === "accounts"}
        accounts={accounts}
        value={filters.accounts}
        onClose={() => setSheet(null)}
        onApply={(accountsNext) => apply({ accounts: accountsNext })}
      />

      <CategoryFilterSheet
        open={sheet === "category"}
        categories={categories}
        value={filters.categoryId}
        onClose={() => setSheet(null)}
        onApply={(categoryId) => apply({ categoryId })}
      />
    </>
  );
}
