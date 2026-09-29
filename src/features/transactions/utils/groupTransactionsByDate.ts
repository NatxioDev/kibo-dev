import {
  formatTransactionDate,
  todayDateInputValue,
} from "@/features/transactions/components/formatters";
import type { TransactionWithRelations } from "@/features/transactions/types";

const WEEKDAYS_SHORT = [
  "dom.",
  "lun.",
  "mar.",
  "mié.",
  "jue.",
  "vie.",
  "sáb.",
] as const;

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

export type TransactionDateGroup = {
  key: string;
  label: string;
  /** Secondary date line, e.g. "mar., 29 de sep." for Hoy/Ayer. */
  dateLabel?: string;
  items: TransactionWithRelations[];
};

function toDateKey(date: string): string {
  return date;
}

function shiftYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day + days));
  const y = probe.getUTCFullYear();
  const m = String(probe.getUTCMonth() + 1).padStart(2, "0");
  const d = String(probe.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatGroupDateLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  const localDate = new Date(year, month - 1, day);
  const weekday = WEEKDAYS_SHORT[localDate.getDay()];
  const monthLabel = MONTHS_SHORT[month - 1];
  return `${weekday}, ${day} de ${monthLabel}.`;
}

function labelForDate(
  date: string,
  today: string,
  yesterday: string,
): Pick<TransactionDateGroup, "label" | "dateLabel"> {
  if (date === today) {
    return { label: "Hoy", dateLabel: formatGroupDateLabel(date) };
  }
  if (date === yesterday) {
    return { label: "Ayer", dateLabel: formatGroupDateLabel(date) };
  }
  return { label: formatTransactionDate(date) };
}

export function groupTransactionsByDate(
  transactions: TransactionWithRelations[],
  now: Date = new Date(),
): TransactionDateGroup[] {
  const today = todayDateInputValue(now);
  const yesterday = shiftYmd(today, -1);
  const groups = new Map<string, TransactionDateGroup>();

  for (const tx of transactions) {
    const key = toDateKey(tx.date);
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(tx);
      continue;
    }

    const { label, dateLabel } = labelForDate(key, today, yesterday);
    groups.set(key, {
      key,
      label,
      dateLabel,
      items: [tx],
    });
  }

  return Array.from(groups.values());
}
