import { createClient } from "@/lib/supabase/client";
import type {
  ServiceResult,
  Transaction,
  TransactionFormValues,
} from "@/features/transactions/types";
import { mapTransactionError } from "./mapTransactionError";

type TransactionRow = Omit<Transaction, "amount"> & {
  amount: number | string;
};

function normalizeTransaction(row: TransactionRow): Transaction {
  return {
    ...row,
    amount: typeof row.amount === "string" ? Number(row.amount) : row.amount,
  };
}

export async function createTransaction(
  values: TransactionFormValues,
): Promise<ServiceResult<Transaction>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Debes iniciar sesión para crear una transacción.",
    };
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      category_id: values.category_id,
      payment_method_id: values.payment_method_id,
      type: values.type,
      amount: values.amount,
      currency: values.currency,
      date: values.date,
      merchant: values.merchant,
      description: values.description,
      source: "MANUAL",
      status: "CONFIRMED",
    })
    .select("*")
    .single();

  if (error) {
    return { success: false, error: mapTransactionError(error) };
  }

  return {
    success: true,
    data: normalizeTransaction(data as TransactionRow),
  };
}

export async function updateTransaction(
  id: string,
  values: TransactionFormValues,
): Promise<ServiceResult<Transaction>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("transactions")
    .update({
      category_id: values.category_id,
      payment_method_id: values.payment_method_id,
      type: values.type,
      amount: values.amount,
      currency: values.currency,
      date: values.date,
      merchant: values.merchant,
      description: values.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: mapTransactionError(error) };
  }

  return {
    success: true,
    data: normalizeTransaction(data as TransactionRow),
  };
}

export async function deleteTransaction(
  id: string,
): Promise<ServiceResult<null>> {
  const supabase = createClient();

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    return { success: false, error: mapTransactionError(error) };
  }

  return { success: true, data: null };
}
