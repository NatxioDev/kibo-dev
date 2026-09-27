import { z } from "zod";

export const PAYMENT_METHOD_NAME_MAX_LENGTH = 40;

export const paymentMethodFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(
      PAYMENT_METHOD_NAME_MAX_LENGTH,
      `Usa como máximo ${PAYMENT_METHOD_NAME_MAX_LENGTH} caracteres.`,
    ),
});

export type PaymentMethodFormValues = z.output<typeof paymentMethodFormSchema>;
