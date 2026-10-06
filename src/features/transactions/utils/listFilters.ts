import type {
  TransactionCurrency,
  TransactionStatus,
  TransactionType,
} from "@/features/transactions/types";
import {
  getTransactionPeriodRange,
  isDefaultTransactionPeriod,
  resolveTransactionListPeriod,
  type TransactionListPeriod,
} from "@/features/transactions/utils/period";

export type TransactionListTypeFilter = "all" | TransactionType;

/**
 * `all` = sin filtro de cuenta;
 * `none` = solo sin cuenta;
 * `ids` = una o más cuentas concretas.
 */
export type TransactionListAccountsFilter =
  | { mode: "all" }
  | { mode: "none" }
  | { mode: "ids"; ids: string[] };

export type ListTransactionsFilters = {
  type?: TransactionListTypeFilter;
  accounts?: TransactionListAccountsFilter;
  categoryId?: string;
  currency?: TransactionCurrency;
  status?: TransactionStatus;
  from?: string;
  to?: string;
};

/** UI + URL state for the transactions list filters. */
export type TransactionListFilterState = {
  type: TransactionListTypeFilter;
  period: TransactionListPeriod;
  accounts: TransactionListAccountsFilter;
  categoryId?: string;
  from?: string;
  to?: string;
};

const DATE_PARAM_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseTransactionTypeFilter(
  value: string | undefined | null,
): TransactionListTypeFilter {
  if (value === "EXPENSE" || value === "INCOME") return value;
  return "all";
}

export function parseTransactionAccountsFilter(
  value: string | undefined | null,
): TransactionListAccountsFilter {
  if (!value || value === "all") return { mode: "all" };
  if (value === "none") return { mode: "none" };

  const ids = value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => UUID_RE.test(part));

  if (ids.length === 0) return { mode: "all" };
  return { mode: "ids", ids: Array.from(new Set(ids)) };
}

/** @deprecated Prefer parseTransactionAccountsFilter (multi-select). */
export function parseTransactionAccountFilter(
  value: string | undefined | null,
): "all" | "none" | string {
  const parsed = parseTransactionAccountsFilter(value);
  if (parsed.mode === "all") return "all";
  if (parsed.mode === "none") return "none";
  return parsed.ids[0] ?? "all";
}

export function parseTransactionCategoryFilter(
  value: string | undefined | null,
): string | undefined {
  if (!value || !UUID_RE.test(value)) return undefined;
  return value;
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

export function parseTransactionListFilterState(params: {
  type?: string | null;
  account?: string | null;
  category?: string | null;
  period?: string | null;
  from?: string | null;
  to?: string | null;
}): TransactionListFilterState {
  const type = parseTransactionTypeFilter(params.type);
  const accounts = parseTransactionAccountsFilter(params.account);
  const categoryId = parseTransactionCategoryFilter(params.category);
  const period = resolveTransactionListPeriod({
    period: params.period,
    from: params.from,
    to: params.to,
  });
  const customRange = parseTransactionDateRange({
    from: params.from,
    to: params.to,
  });

  if (period === "custom") {
    return {
      type,
      period,
      accounts,
      categoryId,
      from: customRange.from,
      to: customRange.to,
    };
  }

  const range = getTransactionPeriodRange(period);
  return {
    type,
    period,
    accounts,
    categoryId,
    from: range.from,
    to: range.to,
  };
}

export function toListTransactionsFilters(
  state: TransactionListFilterState,
): ListTransactionsFilters {
  return {
    type: state.type,
    accounts: state.accounts,
    categoryId: state.categoryId,
    from: state.from,
    to: state.to,
  };
}

export function accountsFilterToParam(
  accounts: TransactionListAccountsFilter,
): string | undefined {
  if (accounts.mode === "all") return undefined;
  if (accounts.mode === "none") return "none";
  if (accounts.ids.length === 0) return undefined;
  return accounts.ids.join(",");
}

export function transactionFiltersToHref(
  state: TransactionListFilterState,
): string {
  const params = new URLSearchParams();
  if (state.type !== "all") params.set("type", state.type);
  if (!isDefaultTransactionPeriod(state.period)) {
    params.set("period", state.period);
  }
  if (state.period === "custom") {
    if (state.from) params.set("from", state.from);
    if (state.to) params.set("to", state.to);
  }
  const accountParam = accountsFilterToParam(state.accounts);
  if (accountParam) params.set("account", accountParam);
  if (state.categoryId) params.set("category", state.categoryId);
  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

export function defaultTransactionListFilterState(): TransactionListFilterState {
  const range = getTransactionPeriodRange("this_month");
  return {
    type: "all",
    period: "this_month",
    accounts: { mode: "all" },
    categoryId: undefined,
    from: range.from,
    to: range.to,
  };
}

export function isTransactionListFiltered(
  state: Pick<
    TransactionListFilterState,
    "type" | "period" | "accounts" | "categoryId"
  >,
): boolean {
  return (
    state.type !== "all" ||
    !isDefaultTransactionPeriod(state.period) ||
    state.accounts.mode !== "all" ||
    Boolean(state.categoryId)
  );
}
