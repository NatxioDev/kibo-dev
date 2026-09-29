import {
  formatTransactionDate,
  todayDateInputValue,
} from "@/features/transactions/components/formatters";
import type { TransactionWithRelations } from "@/features/transactions/types";

export type TransactionDateGroup = {
  key: string;
  label: string;
  items: TransactionWithRelations[];
};

function toDateKey(date: string): string {
  return date;
}

function shiftDateString(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function labelForDate(date: string, today: string, yesterday: string): string {
  if (date === today) return "Hoy";
  if (date === yesterday) return "Ayer";
  return formatTransactionDate(date);
}

export function groupTransactionsByDate(
  transactions: TransactionWithRelations[],
  now: Date = new Date(),
): TransactionDateGroup[] {
  const today = todayDateInputValue(now);
  const yesterday = shiftDateString(today, -1);
  const groups = new Map<string, TransactionDateGroup>();

  for (const tx of transactions) {
    const key = toDateKey(tx.date);
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(tx);
      continue;
    }

    groups.set(key, {
      key,
      label: labelForDate(key, today, yesterday),
      items: [tx],
    });
  }

  return Array.from(groups.values());
}
