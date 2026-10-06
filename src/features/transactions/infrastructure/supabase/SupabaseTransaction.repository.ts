import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  Transaction,
  TransactionFormValues,
  TransactionPage,
  TransactionPageCursor,
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

const TRANSACTION_WITH_RELATIONS_SELECT = `
      *,
      account:accounts(id, name, currency, type),
      category:categories(id, name, icon),
      payment_method:payment_methods(id, name)
    `;

/** PostgREST `or()` values containing `,`, `:` or `+` must be double-quoted. */
function quoteFilterValue(value: string): string {
  return `"${value.replace(/["\\]/g, "\\$&")}"`;
}

export class SupabaseTransactionRepository implements TransactionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private listQuery(filters: ListTransactionsFilters) {
    let query = this.supabase
      .from("transactions")
      .select(TRANSACTION_WITH_RELATIONS_SELECT)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (filters.type && filters.type !== "all") {
      query = query.eq("type", filters.type);
    }

    const accounts = filters.accounts;
    if (accounts?.mode === "none") {
      query = query.is("account_id", null);
    } else if (accounts?.mode === "ids" && accounts.ids.length > 0) {
      query = query.in("account_id", accounts.ids);
    }

    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters.from) {
      query = query.gte("date", filters.from);
    }
    if (filters.to) {
      query = query.lte("date", filters.to);
    }

    return query;
  }

  async list(
    filters: ListTransactionsFilters = {},
  ): Promise<ServiceResult<TransactionWithRelations[]>> {
    const { data, error } = await this.listQuery(filters);

    if (error) {
      return { success: false, error: mapTransactionError(error) };
    }

    const rows = (data ?? []) as TransactionWithRelationsRow[];
    return {
      success: true,
      data: rows.map(toTransactionWithRelations),
    };
  }

  async listPage(
    filters: ListTransactionsFilters,
    cursor: TransactionPageCursor | null,
    limit: number,
  ): Promise<ServiceResult<TransactionPage>> {
    let query = this.listQuery(filters).limit(limit);

    if (cursor) {
      const date = quoteFilterValue(cursor.date);
      const createdAt = quoteFilterValue(cursor.created_at);
      const id = quoteFilterValue(cursor.id);
      query = query.or(
        [
          `date.lt.${date}`,
          `and(date.eq.${date},created_at.lt.${createdAt})`,
          `and(date.eq.${date},created_at.eq.${createdAt},id.lt.${id})`,
        ].join(","),
      );
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: mapTransactionError(error) };
    }

    const items = ((data ?? []) as TransactionWithRelationsRow[]).map(
      toTransactionWithRelations,
    );
    const last = items.at(-1);
    return {
      success: true,
      data: {
        items,
        nextCursor:
          last && items.length === limit
            ? { date: last.date, created_at: last.created_at, id: last.id }
            : null,
      },
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
      .select(TRANSACTION_WITH_RELATIONS_SELECT)
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
        account_id: values.account_id,
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
        account_id: values.account_id,
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
