import { createClient } from "@/lib/supabase/server";
import type {
  ServiceResult,
  Transaction,
  TransactionWithRelations,
} from "@/features/transactions/types";
import type { ListTransactionsFilters } from "@/features/transactions/utils/listFilters";
import { mapTransactionError } from "./mapTransactionError";

type TransactionRow = Omit<Transaction, "amount"> & {
  amount: number | string;
};

type TransactionWithRelationsRow = Omit<TransactionWithRelations, "amount"> & {
  amount: number | string;
};

function normalizeTransaction(row: TransactionRow): Transaction {
  return {
    ...row,
    amount: typeof row.amount === "string" ? Number(row.amount) : row.amount,
  };
}

function normalizeTransactionWithRelations(
  row: TransactionWithRelationsRow,
): TransactionWithRelations {
  return {
    ...row,
    amount: typeof row.amount === "string" ? Number(row.amount) : row.amount,
  };
}

export async function listTransactions(
  filters: ListTransactionsFilters = {},
): Promise<ServiceResult<TransactionWithRelations[]>> {
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select(
      `
      *,
      category:categories(id, name, icon),
      payment_method:payment_methods(id, name)
    `,
    )
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: mapTransactionError(error) };
  }

  const rows = (data ?? []) as TransactionWithRelationsRow[];
  return {
    success: true,
    data: rows.map(normalizeTransactionWithRelations),
  };
}

export async function getTransaction(
  id: string,
): Promise<ServiceResult<Transaction>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { success: false, error: mapTransactionError(error) };
  }

  if (!data) {
    return { success: false, error: "Transacción no encontrada." };
  }

  return {
    success: true,
    data: normalizeTransaction(data as TransactionRow),
  };
}

export async function getTransactionWithRelations(
  id: string,
): Promise<ServiceResult<TransactionWithRelations>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      category:categories(id, name, icon),
      payment_method:payment_methods(id, name)
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { success: false, error: mapTransactionError(error) };
  }

  if (!data) {
    return { success: false, error: "Transacción no encontrada." };
  }

  return {
    success: true,
    data: normalizeTransactionWithRelations(data as TransactionWithRelationsRow),
  };
}
