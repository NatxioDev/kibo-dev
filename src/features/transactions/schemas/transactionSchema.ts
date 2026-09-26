import { z } from "zod";
import { CURRENCY_CODES } from "@/core/domain/value-objects";

// Matches the `transactions.amount numeric(12,2)` column.
const MAX_AMOUNT = 9_999_999_999.99;

const optionalUuid = z
  .union([z.string().uuid(), z.literal("")])
  .optional()
  .nullable()
  .transform((value) => (value === "" || value == null ? null : value));

export const MERCHANT_MAX_LENGTH = 80;
export const DESCRIPTION_MAX_LENGTH = 280;

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `Usa como máximo ${maxLength} caracteres.`)
    .optional()
    .nullable()
    .transform((value) => (value == null || value === "" ? null : value));

export const transactionFormSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"], {
    error: "Selecciona un tipo.",
  }),
  amount: z.coerce
    .number({ error: "El monto es obligatorio." })
    .positive("El monto debe ser mayor que 0.")
    .max(MAX_AMOUNT, "El monto no puede superar 9.999.999.999,99.")
    .refine(
      (value) => Number.isInteger(Number((value * 100).toPrecision(15))),
      "El monto admite como máximo 2 decimales.",
    ),
  currency: z.enum(CURRENCY_CODES, {
    error: "Selecciona una moneda.",
  }),
  date: z
    .string()
    .min(1, "La fecha es obligatoria.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
  category_id: optionalUuid,
  payment_method_id: optionalUuid,
  merchant: optionalText(MERCHANT_MAX_LENGTH),
  description: optionalText(DESCRIPTION_MAX_LENGTH),
});
