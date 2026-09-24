import { z } from "zod";

export const paymentMethodFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio."),
});

export type PaymentMethodFormValues = z.output<typeof paymentMethodFormSchema>;
