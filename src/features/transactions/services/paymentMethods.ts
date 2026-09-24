import { createClient } from "@/lib/supabase/client";
import type {
  PaymentMethod,
  ServiceResult,
} from "@/features/transactions/types";
import { mapTransactionError } from "./mapTransactionError";

export async function listActivePaymentMethods(): Promise<
  ServiceResult<PaymentMethod[]>
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return { success: false, error: mapTransactionError(error) };
  }

  return { success: true, data: (data ?? []) as PaymentMethod[] };
}
