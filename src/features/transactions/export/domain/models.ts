import type { TransactionCurrency } from "@/features/transactions/domain/models";

export type ExportFormat = "csv" | "xlsx";

export const EXPORT_FORMATS = ["csv", "xlsx"] as const satisfies readonly ExportFormat[];

/** Flat, presentation-ready transaction row shared by every export format. */
export type ExportRow = {
  /** `YYYY-MM-DD` as stored, without timezone shifts. */
  date: string;
  type: "Ingreso" | "Gasto";
  amount: number;
  currency: TransactionCurrency;
  category: string;
  merchant: string;
  note: string;
  account: string;
  paymentMethod: string;
};

export type ExportColumn = {
  key: keyof ExportRow;
  header: string;
  width: number;
};

export const EXPORT_COLUMNS: readonly ExportColumn[] = [
  { key: "date", header: "Fecha", width: 12 },
  { key: "type", header: "Tipo", width: 10 },
  { key: "amount", header: "Monto", width: 14 },
  { key: "currency", header: "Moneda", width: 9 },
  { key: "category", header: "Categoría", width: 20 },
  { key: "merchant", header: "Comercio", width: 24 },
  { key: "note", header: "Nota", width: 36 },
  { key: "account", header: "Cuenta", width: 20 },
  { key: "paymentMethod", header: "Método de pago", width: 20 },
];

export const NO_ACCOUNT_LABEL = "Sin cuenta";
