import { z } from "zod";

export const feedbackFormSchema = z.object({
  type: z.enum(["BUG", "IDEA", "OTHER"], {
    error: "Selecciona un tipo.",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Escribe al menos 10 caracteres."),
  page: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value == null || value === "" ? null : value)),
});

export type FeedbackFormInput = z.input<typeof feedbackFormSchema>;
export type FeedbackFormOutput = z.output<typeof feedbackFormSchema>;
