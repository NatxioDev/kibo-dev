import type {
  TransactionCurrency,
  TransactionType,
} from "@/features/transactions/types";

const MONTHS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

export function formatTransactionDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;

  const monthLabel = MONTHS_SHORT[month - 1];
  return `${day} ${monthLabel}`;
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
