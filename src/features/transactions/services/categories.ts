import { createClient } from "@/lib/supabase/client";
import type {
  Category,
  ServiceResult,
  TransactionType,
} from "@/features/transactions/types";
import { mapTransactionError } from "./mapTransactionError";

export async function listActiveCategoriesByType(
  type: TransactionType,
): Promise<ServiceResult<Category[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .eq("type", type)
    .order("name", { ascending: true });

  if (error) {
    return { success: false, error: mapTransactionError(error) };
  }

  return { success: true, data: (data ?? []) as Category[] };
}
