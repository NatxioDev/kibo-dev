import { z } from "zod";

export const CATEGORY_NAME_MAX_LENGTH = 40;
export const CATEGORY_ICON_MAX_LENGTH = 16;

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(
      CATEGORY_NAME_MAX_LENGTH,
      `Usa como máximo ${CATEGORY_NAME_MAX_LENGTH} caracteres.`,
    ),
  icon: z
    .string()
    .trim()
    .max(
      CATEGORY_ICON_MAX_LENGTH,
      `Usa como máximo ${CATEGORY_ICON_MAX_LENGTH} caracteres.`,
    )
    .optional()
    .transform((value) => (value == null || value === "" ? null : value)),
  type: z.enum(["EXPENSE", "INCOME"], {
    error: "Selecciona un tipo.",
  }),
});

export type CategoryFormValues = z.output<typeof categoryFormSchema>;
