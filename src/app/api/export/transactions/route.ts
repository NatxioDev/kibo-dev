import type { NextRequest } from "next/server";
import { z } from "zod";
import { createServerDependenciesWithFriendship } from "@/core/infrastructure/factories/createServerDependenciesWithFriendship";
import { parseDashboardCurrency } from "@/features/dashboard/application/GetDashboardData.application";
import {
  getReportRange,
  parseReportOffset,
  parseReportPeriod,
} from "@/features/reports/utils/period";
import { todayDateInputValue } from "@/features/transactions/components/formatters";
import { ExportTransactions } from "@/features/transactions/export/application/ExportTransactions.application";
import { EXPORT_FORMATS } from "@/features/transactions/export/domain/models";
import { CSV_CONTENT_TYPE, createCsvStream } from "@/features/transactions/export/utils/csv";
import { exportFilename } from "@/features/transactions/export/utils/filename";
import { XLSX_CONTENT_TYPE, createXlsxStream } from "@/features/transactions/export/utils/xlsx";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const formatSchema = z.enum(EXPORT_FORMATS);

/** Exports the same dataset the reports screen aggregates for period/offset/currency. */
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
      { error: "Tu sesión expiró. Vuelve a iniciar sesión para exportar." },
      { status: 401 },
    );
  }

  const range = getReportRange(
    parseReportPeriod(params.get("period")),
    parseReportOffset(params.get("offset")),
    todayDateInputValue(),
  );

  const { transactionRepository } =
    createServerDependenciesWithFriendship(supabase);
  const result = await new ExportTransactions(transactionRepository).execute({
    currency: parseDashboardCurrency(params.get("currency")),
    status: "CONFIRMED",
    from: range.from,
    to: range.to,
  });

  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 });
  }
  if (!result.data) {
    return Response.json(
      { error: "No hay movimientos en este período para exportar." },
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
