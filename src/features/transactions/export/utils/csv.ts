import {
  EXPORT_COLUMNS,
  type ExportRow,
} from "@/features/transactions/export/domain/models";

const BOM = "\uFEFF";
const SEPARATOR = ";";
const LINE_END = "\r\n";
/** OWASP CSV injection: spreadsheet apps evaluate cells starting with these. */
const FORMULA_TRIGGER_RE = /^[=+\-@\t\r]/;

export const CSV_CONTENT_TYPE = "text/csv; charset=utf-8";

export function escapeCsvText(value: string): string {
  const safe = FORMULA_TRIGGER_RE.test(value) ? `\t${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

function formatCsvCell(row: ExportRow, key: keyof ExportRow): string {
  if (key === "amount") return row.amount.toFixed(2);
  return escapeCsvText(String(row[key]));
}

export function csvHeaderLine(): string {
  return (
    BOM +
    EXPORT_COLUMNS.map((column) => escapeCsvText(column.header)).join(
      SEPARATOR,
    ) +
    LINE_END
  );
}

export function csvRowLines(rows: ExportRow[]): string {
  return rows
    .map(
      (row) =>
        EXPORT_COLUMNS.map((column) => formatCsvCell(row, column.key)).join(
          SEPARATOR,
        ) + LINE_END,
    )
    .join("");
}

/** Streams the CSV pulling one page at a time (respects backpressure). */
export function createCsvStream(
  pages: AsyncIterable<ExportRow[]>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const iterator = pages[Symbol.asyncIterator]();
  let headerSent = false;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (!headerSent) {
        headerSent = true;
        controller.enqueue(encoder.encode(csvHeaderLine()));
        return;
      }
      try {
        const { value, done } = await iterator.next();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(csvRowLines(value)));
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });
}
