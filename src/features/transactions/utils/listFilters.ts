import type { TransactionType } from "@/features/transactions/types";

export type TransactionListTypeFilter = "all" | TransactionType;

/** `all` = sin filtro; `none` = sin cuenta; uuid = cuenta concreta. */
export type TransactionListAccountFilter = "all" | "none" | string;

export type ListTransactionsFilters = {
  type?: TransactionListTypeFilter;
  accountId?: TransactionListAccountFilter;
  from?: string;
  to?: string;
};

const DATE_PARAM_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseTransactionTypeFilter(
  value: string | undefined | null,
): TransactionListTypeFilter {
  if (value === "EXPENSE" || value === "INCOME") return value;
  return "all";
}

export function parseTransactionAccountFilter(
  value: string | undefined | null,
): TransactionListAccountFilter {
  if (!value || value === "all") return "all";
  if (value === "none") return "none";
  // Loose UUID check; invalid ids simply yield an empty list from the query.
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    return value;
  }
  return "all";
}

export function parseTransactionDateParam(
  value: string | undefined | null,
): string | undefined {
  if (!value || !DATE_PARAM_RE.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return undefined;
  }
  return value;
}

export function parseTransactionDateRange(params: {
  from?: string | null;
  to?: string | null;
}): { from?: string; to?: string } {
  let from = parseTransactionDateParam(params.from);
  let to = parseTransactionDateParam(params.to);
  if (from && to && from > to) {
    [from, to] = [to, from];
  }
  return { from, to };
}

export function isTransactionListFiltered(
  filters: ListTransactionsFilters,
): boolean {
  return (
    (filters.type != null && filters.type !== "all") ||
    (filters.accountId != null && filters.accountId !== "all") ||
    Boolean(filters.from) ||
    Boolean(filters.to)
  );
}
