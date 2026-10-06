import "server-only";

import { PassThrough, Readable } from "node:stream";
import ExcelJS from "exceljs";
import {
  EXPORT_COLUMNS,
  type ExportRow,
} from "@/features/transactions/export/domain/models";

export const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const SHEET_NAME = "Transacciones";
const DATE_FORMAT = "dd/mm/yyyy";
const AMOUNT_FORMAT = "#,##0.00";

/** Midnight UTC keeps the stored calendar day; exceljs serializes dates as UTC. */
function toExcelDate(date: string): Date | string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return new Date(Date.UTC(year, month - 1, day));
}

function toSheetRow(row: ExportRow): Record<keyof ExportRow, unknown> {
  return { ...row, date: toExcelDate(row.date) };
}

async function writeWorkbook(
  pages: AsyncIterable<ExportRow[]>,
  output: PassThrough,
): Promise<void> {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: output,
    useStyles: true,
    useSharedStrings: false,
  });
  const sheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = EXPORT_COLUMNS.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
    style:
      column.key === "date"
        ? { numFmt: DATE_FORMAT }
        : column.key === "amount"
          ? { numFmt: AMOUNT_FORMAT }
          : undefined,
  }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).commit();

  for await (const rows of pages) {
    for (const row of rows) {
      sheet.addRow(toSheetRow(row)).commit();
    }
  }

  sheet.commit();
  await workbook.commit();
}

/** Streams the XLSX workbook row by row instead of buffering it in memory. */
export function createXlsxStream(
  pages: AsyncIterable<ExportRow[]>,
): ReadableStream<Uint8Array> {
  const output = new PassThrough();
  writeWorkbook(pages, output).catch((error: unknown) => {
    output.destroy(error instanceof Error ? error : new Error(String(error)));
  });
  return Readable.toWeb(output) as ReadableStream<Uint8Array>;
}
