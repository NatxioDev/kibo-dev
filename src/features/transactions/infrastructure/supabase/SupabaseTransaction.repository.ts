import type { SupabaseClient } from "@supabase/supabase-js";
import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";
import type {
  ServiceResult,
  Transaction,
  TransactionFormValues,
  TransactionWithRelations,
} from "@/features/transactions/domain/models";
import {
  toTransaction,
  toTransactionWithRelations,
  type TransactionRow,
  type TransactionWithRelationsRow,
} from "@/features/transactions/infrastructure/supabase/mappers/Transaction.mapper";
import { mapTransactionError } from "@/features/transactions/infrastructure/supabase/mapTransactionError";
import type { ListTransactionsFilters } from "@/features/transactions/utils/listFilters";

export class SupabaseTransactionRepository implements TransactionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(
    filters: ListTransactionsFilters = {},
  ): Promise<ServiceResult<TransactionWithRelations[]>> {
    let query = this.supabase
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
      data: rows.map(toTransactionWithRelations),
    };
  }

  async getById(id: string): Promise<ServiceResult<Transaction>> {
    const { data, error } = await this.supabase
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
      data: toTransaction(data as TransactionRow),
    };
  }

  async getByIdWithRelations(
    id: string,
  ): Promise<ServiceResult<TransactionWithRelations>> {
    const { data, error } = await this.supabase
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
      data: toTransactionWithRelations(data as TransactionWithRelationsRow),
    };
  }

  async create(
    values: TransactionFormValues,
  ): Promise<ServiceResult<Transaction>> {
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Debes iniciar sesión para crear una transacción.",
      };
    }

    const { data, error } = await this.supabase
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
      data: toTransaction(data as TransactionRow),
    };
  }

  async update(
    id: string,
    values: TransactionFormValues,
  ): Promise<ServiceResult<Transaction>> {
    const { data, error } = await this.supabase
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
      data: toTransaction(data as TransactionRow),
    };
  }

  async delete(id: string): Promise<ServiceResult<null>> {
    const { error } = await this.supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: mapTransactionError(error) };
    }

    return { success: true, data: null };
  }
}
