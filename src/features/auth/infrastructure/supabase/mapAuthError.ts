import type { AuthError } from "@supabase/supabase-js";

const FRIENDLY_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email o contraseña incorrectos.",
  invalid_login_credentials: "Email o contraseña incorrectos.",
  email_not_confirmed: "Debes confirmar tu email antes de iniciar sesión.",
  user_already_exists: "Este email ya está registrado.",
  user_already_registered: "Este email ya está registrado.",
  email_exists: "Este email ya está registrado.",
  weak_password: "La contraseña es demasiado débil.",
  over_request_rate_limit:
    "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  signup_disabled: "El registro no está disponible en este momento.",
};

export function mapAuthError(
  error: AuthError | { message: string; code?: string },
): string {
  const code = "code" in error && error.code ? error.code : undefined;
  const message = error.message.toLowerCase();

  if (code && FRIENDLY_MESSAGES[code]) {
    return FRIENDLY_MESSAGES[code];
  }

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return FRIENDLY_MESSAGES.invalid_credentials;
  }

  if (
    message.includes("user already registered") ||
    message.includes("already been registered") ||
    message.includes("email address is already")
  ) {
    return FRIENDLY_MESSAGES.user_already_registered;
  }

  if (message.includes("email not confirmed")) {
    return FRIENDLY_MESSAGES.email_not_confirmed;
  }

  if (message.includes("password")) {
    return "Revisa la contraseña e inténtalo de nuevo.";
  }

  return "No pudimos completar la operación. Inténtalo de nuevo.";
}
