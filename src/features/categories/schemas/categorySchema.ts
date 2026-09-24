import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio."),
  icon: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value == null || value === "" ? null : value)),
  type: z.enum(["EXPENSE", "INCOME"], {
    error: "Selecciona un tipo.",
  }),
});

export type CategoryFormValues = z.output<typeof categoryFormSchema>;
