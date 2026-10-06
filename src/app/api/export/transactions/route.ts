import type { NextRequest } from "next/server";
import { z } from "zod";
import { createServerDependenciesWithFriendship } from "@/core/infrastructure/factories/createServerDependenciesWithFriendship";
import { ExportTransactions } from "@/features/transactions/export/application/ExportTransactions.application";
import { EXPORT_FORMATS } from "@/features/transactions/export/domain/models";
import { CSV_CONTENT_TYPE, createCsvStream } from "@/features/transactions/export/utils/csv";
import { exportFilename } from "@/features/transactions/export/utils/filename";
import { XLSX_CONTENT_TYPE, createXlsxStream } from "@/features/transactions/export/utils/xlsx";
import {
  parseTransactionListFilterState,
  toListTransactionsFilters,
} from "@/features/transactions/utils/listFilters";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const formatSchema = z.enum(EXPORT_FORMATS);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const format = formatSchema.safeParse(params.get("format"));
  if (!format.success) {
    return Response.json(
      { error: "Formato de exportación no válido." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json(
      { error: "Debes iniciar sesión para exportar." },
      { status: 401 },
    );
  }

  const filters = toListTransactionsFilters(
    parseTransactionListFilterState({
      type: params.get("type"),
      account: params.get("account"),
      category: params.get("category"),
      period: params.get("period"),
      from: params.get("from"),
      to: params.get("to"),
    }),
  );

  const { transactionRepository } =
    createServerDependenciesWithFriendship(supabase);
  const result = await new ExportTransactions(transactionRepository).execute(
    filters,
  );

  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 });
  }
  if (!result.data) {
    return Response.json(
      { error: "No hay transacciones para exportar con estos filtros." },
      { status: 404 },
    );
  }

  const isCsv = format.data === "csv";
  const body = isCsv
    ? createCsvStream(result.data)
    : createXlsxStream(result.data);

  return new Response(body, {
    headers: {
      "Content-Type": isCsv ? CSV_CONTENT_TYPE : XLSX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="${exportFilename(format.data)}"`,
      "Cache-Control": "no-store",
    },
  });
}
