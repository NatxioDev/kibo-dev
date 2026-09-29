import { z } from "zod";
import { CURRENCY_CODES } from "@/core/domain/value-objects";

export const ACCOUNT_NAME_MAX_LENGTH = 40;

export const ACCOUNT_TYPES = [
  "SAVINGS",
  "CHECKING",
  "CASH",
  "EXPENSES",
  "OTHER",
] as const;

export const ACCOUNT_TYPE_LABELS: Record<(typeof ACCOUNT_TYPES)[number], string> =
  {
    SAVINGS: "Ahorros",
    CHECKING: "Corriente",
    CASH: "Efectivo",
    EXPENSES: "Gastos",
    OTHER: "Otra",
  };

export const accountFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(
      ACCOUNT_NAME_MAX_LENGTH,
      `Usa como máximo ${ACCOUNT_NAME_MAX_LENGTH} caracteres.`,
    ),
  type: z.enum(ACCOUNT_TYPES, {
    error: "Selecciona un tipo.",
  }),
  currency: z.enum(CURRENCY_CODES, {
    error: "Selecciona una moneda.",
  }),
});

export type AccountFormValues = z.output<typeof accountFormSchema>;
