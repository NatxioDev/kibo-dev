import { z } from "zod";

export const USERNAME_MAX_LENGTH = 20;

export const RESERVED_USERNAMES = [
  "admin",
  "kibo",
  "settings",
  "login",
  "onboarding",
  "api",
  "auth",
  "support",
];

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Usa al menos 3 caracteres.")
  .max(USERNAME_MAX_LENGTH, `Usa como máximo ${USERNAME_MAX_LENGTH} caracteres.`)
  .regex(/^[a-z0-9_]+$/, "Solo letras minúsculas, números y guion bajo.")
  .refine(
    (value) => !RESERVED_USERNAMES.includes(value),
    "Ese nombre de usuario no está disponible.",
  );

export function sanitizeUsernameInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, USERNAME_MAX_LENGTH);
}
