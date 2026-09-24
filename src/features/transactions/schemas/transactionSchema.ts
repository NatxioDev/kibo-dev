import { z } from "zod";

const optionalUuid = z
  .union([z.string().uuid(), z.literal("")])
  .optional()
  .nullable()
  .transform((value) => (value === "" || value == null ? null : value));

const optionalText = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  });

export const transactionFormSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"], {
    error: "Selecciona un tipo.",
  }),
  amount: z.coerce
    .number({ error: "El monto es obligatorio." })
    .positive("El monto debe ser mayor que 0."),
  currency: z.enum(["BOB", "USD"], {
    error: "Selecciona una moneda.",
  }),
  date: z
    .string()
    .min(1, "La fecha es obligatoria.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
  category_id: optionalUuid,
  payment_method_id: optionalUuid,
  merchant: optionalText,
  description: optionalText,
});
