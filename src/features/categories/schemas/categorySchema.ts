import { z } from "zod";

export const CATEGORY_NAME_MAX_LENGTH = 40;

const graphemeSegmenter = new Intl.Segmenter("es", { granularity: "grapheme" });

export function graphemesOf(value: string): string[] {
  return [...graphemeSegmenter.segment(value)].map((part) => part.segment);
}

/** Keeps a single grapheme (the last one), so picking a new emoji replaces the previous. */
export function toSingleGrapheme(value: string): string {
  const graphemes = graphemesOf(value);
  return graphemes.at(-1) ?? "";
}

function isSingleEmoji(value: string): boolean {
  const graphemes = graphemesOf(value);
  if (graphemes.length !== 1) return false;
  // Flags (regional indicators) or any extended pictographic sequence (ZWJ, skin tones, etc.).
  return /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(graphemes[0]);
}

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
    .refine((value) => value === "" || isSingleEmoji(value), "Usa un solo emoji.")
    .optional()
    .transform((value) => (value == null || value === "" ? null : value)),
  type: z.enum(["EXPENSE", "INCOME"], {
    error: "Selecciona un tipo.",
  }),
});

export type CategoryFormValues = z.output<typeof categoryFormSchema>;
