import { APP_TIME_ZONE } from "@/features/transactions/components/formatters";

export type PaymentQrValidity = "vigente" | "vencido" | "desconocida";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Fecha civil en Bolivia, `YYYY-MM-DD`, sin depender del huso del servidor. */
export function todayInBolivia(now: Date): string {
  const parts = dateFormatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

/**
 * La vigencia sale solo de la fecha que escribió el usuario.
 * Nunca afirma que el banco siga aceptando el QR.
 */
export function paymentQrValidity(
  manualExpiresOn: string | null,
  today: string,
): PaymentQrValidity {
  if (!manualExpiresOn) return "desconocida";
  if (manualExpiresOn < today) return "vencido";
  return "vigente";
}
