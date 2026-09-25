import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DashboardQuery,
  DashboardRepository,
} from "@/features/dashboard/domain/Dashboard.repository";
import type {
  ServiceResult,
  TransactionWithRelations,
} from "@/features/transactions/domain/models";
import {
  toTransactionWithRelations,
  type TransactionWithRelationsRow,
} from "@/features/transactions/infrastructure/supabase/mappers/Transaction.mapper";
import { mapTransactionError } from "@/features/transactions/infrastructure/supabase/mapTransactionError";

export class SupabaseDashboardRepository implements DashboardRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listConfirmedInRange(
    query: DashboardQuery,
  ): Promise<ServiceResult<TransactionWithRelations[]>> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select(
        `
      *,
      category:categories(id, name, icon)
    `,
      )
      .eq("status", "CONFIRMED")
      .eq("currency", query.currency)
      .gte("date", query.from)
      .lte("date", query.to)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: mapTransactionError(error) };
    }

    const rows = (data ?? []) as TransactionWithRelationsRow[];
    return {
      success: true,
      data: rows.map(toTransactionWithRelations),
    };
  }
}
