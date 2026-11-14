import type { PaymentQrMutationResult } from "@/features/payment-qr/domain/models";

export function mapPaymentQrMutation(error: { message?: string }): PaymentQrMutationResult {
  const message = error.message ?? "";
  if (message.includes("REAUTH_REQUIRED")) {
    return {
      success: false,
      code: "reauth_required",
      error: "Para reemplazar el QR, confirma que eres tú.",
    };
  }
  if (message.includes("CONSENT_REQUIRED")) {
    return { success: false, error: "Para guardar el QR, acepta el consentimiento." };
  }
  if (message.includes("RATE_LIMIT")) {
    return {
      success: false,
      error: "Ya cambiaste el QR varias veces. Espera un rato e intenta de nuevo.",
    };
  }
  if (message.includes("INVALID_PATH") || message.includes("INVALID_FILE")) {
    return { success: false, error: "No pudimos guardar ese archivo." };
  }
  if (message.includes("La etiqueta") || message.includes("La fecha") || message.includes("Primero sube")) {
    return { success: false, error: message };
  }
  if (message.includes("No hay un QR")) {
    return { success: false, error: "No hay un QR para eliminar." };
  }
  if (message.includes("Debes iniciar sesión")) {
    return { success: false, error: "Debes iniciar sesión." };
  }
  return { success: false, error: "No pudimos guardar el QR. Intenta de nuevo." };
}

export function mapPaymentQrStorageError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("size") || lower.includes("exceeded") || lower.includes("too large")) {
    return "Usa una imagen PNG, JPG o WEBP de hasta 2 MB. Kibo no modifica el archivo.";
  }
  if (lower.includes("mime") || lower.includes("content type") || lower.includes("invalid")) {
    return "Usa una imagen PNG, JPG o WEBP de hasta 2 MB. Kibo no modifica el archivo.";
  }
  return "No pudimos guardar el archivo. Intenta de nuevo.";
}
