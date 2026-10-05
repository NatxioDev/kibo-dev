import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ReportesQuery,
  ReportesRepository,
} from "@/features/reportes/domain/Reportes.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { TransactionWithRelations } from "@/features/transactions/domain/models";
import {
  toTransactionWithRelations,
  type TransactionWithRelationsRow,
} from "@/features/transactions/infrastructure/supabase/mappers/Transaction.mapper";
import { mapTransactionError } from "@/features/transactions/infrastructure/supabase/mapTransactionError";

export class SupabaseReportesRepository implements ReportesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listConfirmedInRange(
    query: ReportesQuery
  ): Promise<ServiceResult<TransactionWithRelations[]>> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select(
        `
      *,
      account:accounts(id, name, currency, type),
      category:categories(id, name, icon),
      payment_method:payment_methods(id, name)
    `
      )
      .eq("status", "CONFIRMED")
      .eq("currency", query.currency)
      .gte("date", query.from)
      .lte("date", query.to)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });

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
