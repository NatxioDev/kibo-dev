import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentMethodRepository } from "@/features/payment-methods/domain/PaymentMethod.repository";
import { mapPaymentMethodError } from "@/features/payment-methods/infrastructure/supabase/mapPaymentMethodError";
import type { PaymentMethodFormValues } from "@/features/payment-methods/schemas/paymentMethodSchema";
import type {
  PaymentMethod,
  ServiceResult,
} from "@/features/transactions/domain/models";

export class SupabasePaymentMethodRepository
  implements PaymentMethodRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async list(): Promise<ServiceResult<PaymentMethod[]>> {
    const { data, error } = await this.supabase
      .from("payment_methods")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: mapPaymentMethodError(error) };
    }

    return { success: true, data: (data ?? []) as PaymentMethod[] };
  }

  async listActive(): Promise<ServiceResult<PaymentMethod[]>> {
    const { data, error } = await this.supabase
      .from("payment_methods")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: mapPaymentMethodError(error) };
    }

    return { success: true, data: (data ?? []) as PaymentMethod[] };
  }

  async getById(id: string): Promise<ServiceResult<PaymentMethod>> {
    const { data, error } = await this.supabase
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

  async create(
    values: PaymentMethodFormValues,
  ): Promise<ServiceResult<PaymentMethod>> {
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Debes iniciar sesión para crear un método de pago.",
      };
    }

    const { data, error } = await this.supabase
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

  async update(
    id: string,
    values: PaymentMethodFormValues,
  ): Promise<ServiceResult<PaymentMethod>> {
    const { data, error } = await this.supabase
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

  async setActive(
    id: string,
    isActive: boolean,
  ): Promise<ServiceResult<PaymentMethod>> {
    const { data, error } = await this.supabase
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
}
