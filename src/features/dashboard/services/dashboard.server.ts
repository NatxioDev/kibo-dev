import { aggregateDashboardData } from "@/features/dashboard/utils/aggregate";
import {
  getPeriodLabel,
  getPeriodRange,
  parseDashboardPeriod,
} from "@/features/dashboard/utils/period";
import type { DashboardData, DashboardPeriod } from "@/features/dashboard/types";
import { createClient } from "@/lib/supabase/server";
import type {
  ServiceResult,
  TransactionCurrency,
  TransactionWithRelations,
} from "@/features/transactions/types";
import { mapTransactionError } from "@/features/transactions/services/mapTransactionError";

type TransactionWithRelationsRow = Omit<TransactionWithRelations, "amount"> & {
  amount: number | string;
};

function normalize(
  row: TransactionWithRelationsRow,
): TransactionWithRelations {
  return {
    ...row,
    amount: typeof row.amount === "string" ? Number(row.amount) : row.amount,
  };
}

export function parseDashboardCurrency(
  value: string | undefined | null,
): TransactionCurrency {
  if (value === "BOB" || value === "USD") return value;
  return "BOB";
}

export async function getDashboardData(options: {
  period?: string | null;
  currency?: string | null;
}): Promise<ServiceResult<DashboardData>> {
  const period: DashboardPeriod = parseDashboardPeriod(options.period);
  const currency = parseDashboardCurrency(options.currency);
  const range = getPeriodRange(period);
  const periodLabel = getPeriodLabel(period);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      category:categories(id, name, icon)
    `,
    )
    .eq("status", "CONFIRMED")
    .eq("currency", currency)
    .gte("date", range.from)
    .lte("date", range.to)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: mapTransactionError(error) };
  }

  const rows = (data ?? []) as TransactionWithRelationsRow[];
  const transactions = rows.map(normalize);

  return {
    success: true,
    data: aggregateDashboardData(transactions, period, currency, periodLabel),
  };
}
