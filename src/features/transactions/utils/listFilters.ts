import type { TransactionType } from "@/features/transactions/types";

export type TransactionListTypeFilter = "all" | TransactionType;

export type ListTransactionsFilters = {
  type?: TransactionListTypeFilter;
};

export function parseTransactionTypeFilter(
  value: string | undefined | null,
): TransactionListTypeFilter {
  if (value === "EXPENSE" || value === "INCOME") return value;
  return "all";
}
