import { createClient } from "@/lib/supabase/client";
import type { PaymentMethodFormValues } from "@/features/payment-methods/schemas/paymentMethodSchema";
import type {
  PaymentMethod,
  ServiceResult,
} from "@/features/transactions/types";
import { mapPaymentMethodError } from "./mapPaymentMethodError";

export async function createPaymentMethod(
  values: PaymentMethodFormValues,
): Promise<ServiceResult<PaymentMethod>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Debes iniciar sesión para crear un método de pago.",
    };
  }

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({
      user_id: user.id,
      name: values.name,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) {
    return { success: false, error: mapPaymentMethodError(error) };
  }

  return { success: true, data: data as PaymentMethod };
}

export async function updatePaymentMethod(
  id: string,
  values: PaymentMethodFormValues,
): Promise<ServiceResult<PaymentMethod>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("payment_methods")
    .update({
      name: values.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: mapPaymentMethodError(error) };
  }

  return { success: true, data: data as PaymentMethod };
}

export async function setPaymentMethodActive(
  id: string,
  isActive: boolean,
): Promise<ServiceResult<PaymentMethod>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("payment_methods")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: mapPaymentMethodError(error) };
  }

  return { success: true, data: data as PaymentMethod };
}
