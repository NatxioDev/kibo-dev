export const PAYMENT_QR_BUCKET = "payment-qr";

/** 2 MB. El bucket aplica el mismo tope. */
export const PAYMENT_QR_MAX_BYTES = 2 * 1024 * 1024;

export const PAYMENT_QR_SIGNED_URL_SECONDS = 120;

/** Ventana para reemplazar el QR después de un inicio de sesión real. */
export const PAYMENT_QR_REAUTH_WINDOW_MS = 10 * 60 * 1000;

export const PAYMENT_QR_LABEL_MAX = 40;

/** Cambia solo cuando el texto del consentimiento cambia de forma material. */
export const PAYMENT_QR_CONSENT_VERSION = "2026-11-14";

export const PAYMENT_QR_MIN_DIMENSION = 100;
export const PAYMENT_QR_MAX_DIMENSION = 4096;

export const PAYMENT_QR_MIMES = ["image/png", "image/jpeg", "image/webp"] as const;

export type PaymentQrMime = (typeof PAYMENT_QR_MIMES)[number];
export type PaymentQrExtension = "png" | "jpg" | "webp";
