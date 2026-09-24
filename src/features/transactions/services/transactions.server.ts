import { createClient } from "@/lib/supabase/server";
import type {
  ServiceResult,
  Transaction,
  TransactionWithRelations,
} from "@/features/transactions/types";
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

export async function listTransactions(): Promise<
  ServiceResult<TransactionWithRelations[]>
> {
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
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

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
