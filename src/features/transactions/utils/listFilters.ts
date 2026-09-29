import type { TransactionType } from "@/features/transactions/types";

export type TransactionListTypeFilter = "all" | TransactionType;

/** `all` = sin filtro; `none` = sin cuenta; uuid = cuenta concreta. */
export type TransactionListAccountFilter = "all" | "none" | string;

export type ListTransactionsFilters = {
  type?: TransactionListTypeFilter;
  accountId?: TransactionListAccountFilter;
};

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
