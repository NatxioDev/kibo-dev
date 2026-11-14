import { formatTransactionTime } from "@/features/transactions/components/formatters";
import { todayInBolivia } from "@/features/payment-qr/domain/validity";

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

export function formatQrDay(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const label = MONTHS[month - 1];
  if (!label) return isoDate;
  return `${day} ${label} ${year}`;
}

export function formatQrTimestamp(isoTimestamp: string, now = new Date(isoTimestamp)): string {
  if (Number.isNaN(now.getTime())) return isoTimestamp;
  const day = formatQrDay(todayInBolivia(now));
  const time = formatTransactionTime(isoTimestamp);
  return time ? `${day}, ${time}` : day;
}
