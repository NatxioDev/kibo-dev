import { Money } from "@/core/domain/value-objects";
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

/** App timezone (Bolivia). Avoids UTC server rendering showing the wrong day/time. */
export const APP_TIME_ZONE = "America/La_Paz";

const transactionTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: APP_TIME_ZONE,
});

const appDatePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

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

  const parts = transactionTimeFormatter.formatToParts(parsed);
  const hours = parts.find((part) => part.type === "hour")?.value;
  const minutes = parts.find((part) => part.type === "minute")?.value;
  if (!hours || !minutes) return "";

  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
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
  return Money.of(Math.abs(amount), currency).format({
    sign: type === "INCOME" ? "+" : "-",
  });
}

export function formatMoneyAmount(
  amount: number,
  currency: TransactionCurrency,
): string {
  return Money.of(amount, currency).format();
}

export function todayDateInputValue(now: Date = new Date()): string {
  const parts = appDatePartsFormatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}
