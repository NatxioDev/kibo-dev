import type { AuthError } from "@supabase/supabase-js";

const FRIENDLY_MESSAGES: Record<string, string> = {
  over_request_rate_limit:
    "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  provider_disabled: "El inicio de sesión con Google no está disponible.",
  signup_disabled: "El registro no está disponible en este momento.",
};

export function mapAuthError(
  error: AuthError | { message: string; code?: string },
): string {
  const code = "code" in error && error.code ? error.code : undefined;

  if (code && FRIENDLY_MESSAGES[code]) {
    return FRIENDLY_MESSAGES[code];
  }

  if (error.message.toLowerCase().includes("provider is not enabled")) {
    return FRIENDLY_MESSAGES.provider_disabled;
  }

  return "No pudimos completar la operación. Inténtalo de nuevo.";
}
