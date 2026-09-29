import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountRepository } from "@/features/accounts/domain/Account.repository";
import { mapAccountError } from "@/features/accounts/infrastructure/supabase/mapAccountError";
import type { AccountFormValues } from "@/features/accounts/schemas/accountSchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { Account } from "@/features/transactions/domain/models";

export class SupabaseAccountRepository implements AccountRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(): Promise<ServiceResult<Account[]>> {
    const { data, error } = await this.supabase
      .from("accounts")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: mapAccountError(error) };
    }

    return { success: true, data: (data ?? []) as Account[] };
  }

  async listActive(): Promise<ServiceResult<Account[]>> {
    const { data, error } = await this.supabase
      .from("accounts")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: mapAccountError(error) };
    }

    return { success: true, data: (data ?? []) as Account[] };
  }

  async getById(id: string): Promise<ServiceResult<Account>> {
    const { data, error } = await this.supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { success: false, error: mapAccountError(error) };
    }

    if (!data) {
      return { success: false, error: "Cuenta no encontrada." };
    }

    return { success: true, data: data as Account };
  }

  async create(values: AccountFormValues): Promise<ServiceResult<Account>> {
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Debes iniciar sesión para crear una cuenta.",
      };
    }

    const { data, error } = await this.supabase
      .from("accounts")
      .insert({
        user_id: user.id,
        name: values.name,
        type: values.type,
        currency: values.currency,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      return { success: false, error: mapAccountError(error) };
    }

    return { success: true, data: data as Account };
  }

  async update(
    id: string,
    values: AccountFormValues,
  ): Promise<ServiceResult<Account>> {
    const { data, error } = await this.supabase
      .from("accounts")
      .update({
        name: values.name,
        type: values.type,
        currency: values.currency,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: mapAccountError(error) };
    }

    return { success: true, data: data as Account };
  }

  async setActive(
    id: string,
    isActive: boolean,
  ): Promise<ServiceResult<Account>> {
    const { data, error } = await this.supabase
      .from("accounts")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: mapAccountError(error) };
    }

    return { success: true, data: data as Account };
  }
}
