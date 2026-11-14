import { PAYMENT_QR_LABEL_MAX } from "@/features/payment-qr/domain/constants";

export function parsePaymentQrLabel(
  value: string,
): { ok: true; label: string | null } | { ok: false; error: string } {
  const label = value.trim();
  if (!label) return { ok: true, label: null };
  if (label.length > PAYMENT_QR_LABEL_MAX || /[\n\r]/.test(label)) {
    return { ok: false, error: "La etiqueta puede tener hasta 40 caracteres." };
  }
  return { ok: true, label };
}

export function parseManualExpiry(
  value: string,
): { ok: true; date: string | null } | { ok: false; error: string } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, date: null };
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return { ok: false, error: "La fecha de vigencia no es válida." };

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 2000 || year > 2100) {
    return { ok: false, error: "La fecha de vigencia no es válida." };
  }

  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return { ok: false, error: "La fecha de vigencia no es válida." };
  }

  return { ok: true, date: trimmed };
}
