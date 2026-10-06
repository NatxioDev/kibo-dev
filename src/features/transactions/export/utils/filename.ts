import { todayDateInputValue } from "@/features/transactions/components/formatters";
import type { ExportFormat } from "@/features/transactions/export/domain/models";

/** e.g. `kibo-transacciones-2026-10-06.csv`, dated in the app timezone. */
export function exportFilename(
  format: ExportFormat,
  now: Date = new Date(),
): string {
  return `kibo-transacciones-${todayDateInputValue(now)}.${format}`;
}
