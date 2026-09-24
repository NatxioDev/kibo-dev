import { formatTransactionDate } from "@/features/transactions/components/formatters";
import type { TransactionWithRelations } from "@/features/transactions/types";

export type TransactionDateGroup = {
  key: string;
  label: string;
  items: TransactionWithRelations[];
};

function toDateKey(date: string): string {
  return date;
}

function shiftLocalDate(base: Date, days: number): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const today = shiftLocalDate(now, 0);
  const yesterday = shiftLocalDate(now, -1);
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
