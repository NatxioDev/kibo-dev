import { z } from "zod";

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio.")
  .max(50, "Usa como máximo 50 caracteres.");
