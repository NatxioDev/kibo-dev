import { createClient } from "@/lib/supabase/server";
import type {
  PaymentMethod,
  ServiceResult,
} from "@/features/transactions/types";
import { mapPaymentMethodError } from "./mapPaymentMethodError";

export async function listPaymentMethods(): Promise<
  ServiceResult<PaymentMethod[]>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return { success: false, error: mapPaymentMethodError(error) };
  }

  return { success: true, data: (data ?? []) as PaymentMethod[] };
}

export async function getPaymentMethod(
  id: string,
): Promise<ServiceResult<PaymentMethod>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { success: false, error: mapPaymentMethodError(error) };
  }

  if (!data) {
    return { success: false, error: "Método de pago no encontrado." };
  }

  return { success: true, data: data as PaymentMethod };
}
