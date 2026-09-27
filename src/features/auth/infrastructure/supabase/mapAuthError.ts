import type { AuthError } from "@supabase/supabase-js";

const FRIENDLY_MESSAGES: Record<string, string> = {
  over_request_rate_limit:
    "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  provider_disabled: "El inicio de sesión con Google no está disponible.",
  signup_disabled: "El registro no está disponible en este momento.",
  webauthn_challenge_expired:
    "La solicitud de Passkey expiró. Inténtalo de nuevo.",
  ERROR_CEREMONY_ABORTED: "Cancelaste el inicio de sesión con Passkey.",
  ERROR_INVALID_DOMAIN:
    "Este dominio no está autorizado para usar Passkeys. Revisa la configuración.",
  ERROR_INVALID_RP_ID:
    "La configuración de Passkeys (RP ID) no coincide con este dominio.",
  ERROR_AUTHENTICATOR_GENERAL_ERROR:
    "No pudimos usar la Passkey de este dispositivo. Inténtalo de nuevo.",
  ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT:
    "Este dispositivo no admite Passkeys discoverables.",
  ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT:
    "Este dispositivo no admite la verificación necesaria para Passkeys.",
  ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED:
    "Esta Passkey ya está registrada en tu cuenta.",
  NotAllowedError: "Cancelaste la operación de Passkey o no está permitida.",
};

function messageHintsPasskeyCancel(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("not allowed") ||
    lower.includes("timed out") ||
    lower.includes("abort") ||
    lower.includes("cancel")
  );
}

export function mapAuthError(
  error: AuthError | { message: string; code?: string; name?: string },
): string {
  const code = "code" in error && error.code ? error.code : undefined;

  if (code && FRIENDLY_MESSAGES[code]) {
    return FRIENDLY_MESSAGES[code];
  }

  if (error.message.toLowerCase().includes("provider is not enabled")) {
    return FRIENDLY_MESSAGES.provider_disabled;
  }

  if (
    ("name" in error && error.name === "NotAllowedError") ||
    messageHintsPasskeyCancel(error.message)
  ) {
    return FRIENDLY_MESSAGES.NotAllowedError;
  }

  if (
    error.message.toLowerCase().includes("passkey") ||
    error.message.toLowerCase().includes("webauthn")
  ) {
    return "No pudimos completar la operación con Passkey. Inténtalo de nuevo.";
  }

  return "No pudimos completar la operación. Inténtalo de nuevo.";
}
