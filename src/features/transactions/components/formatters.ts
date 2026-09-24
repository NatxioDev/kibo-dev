import type {
  TransactionCurrency,
  TransactionType,
} from "@/features/transactions/types";

const MONTHS_SHORT = [
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

const WEEKDAYS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const;

export function formatTransactionDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;

  const monthLabel = MONTHS_SHORT[month - 1];
  // Capitalized short form for list/group labels: "24 Sep"
  const monthTitle =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  return `${day} ${monthTitle}`;
}

export function formatTransactionTime(isoTimestamp: string): string {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) return "";

  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatTransactionDateTime(
  date: string,
  isoTimestamp: string,
): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;

  const localDate = new Date(year, month - 1, day);
  const weekday = WEEKDAYS[localDate.getDay()];
  const monthLabel = MONTHS_SHORT[month - 1];
  const dateLabel = `${weekday} ${day} de ${monthLabel}`;
  const timeLabel = formatTransactionTime(isoTimestamp);
  return timeLabel ? `${dateLabel}, ${timeLabel}` : dateLabel;
}

export function formatTransactionAmount(
  amount: number,
  currency: TransactionCurrency,
  type: TransactionType,
): string {
  const sign = type === "INCOME" ? "+" : "-";
  return `${sign}${formatMoneyAmount(amount, currency)}`;
}

export function formatMoneyAmount(
  amount: number,
  currency: TransactionCurrency,
): string {
  const prefix = currency === "BOB" ? "Bs " : "$";
  const formatted = amount.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${prefix}${formatted}`;
}

export function todayDateInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
