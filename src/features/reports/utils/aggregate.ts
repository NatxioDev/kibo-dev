import type {
  ReportBucket,
  ReportCategory,
  ReportData,
  ReportPeriod,
  ReportRange,
} from "@/features/reports/types";
import {
  MONTHS_LONG,
  MONTHS_SHORT,
  addDays,
  daysBetween,
  daysInMonth,
  parseYmd,
  ymdOf,
} from "@/features/reports/utils/period";
import type { TransactionWithRelations } from "@/features/transactions/types";

const WEEKDAY_INITIALS = ["D", "L", "M", "X", "J", "V", "S"] as const;
const WEEKDAYS_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"] as const;

type Totals = { income: number; expense: number };

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toBucket(
  key: string,
  label: string,
  title: string,
  totals: Totals | undefined,
  future: boolean,
): ReportBucket {
  const income = totals?.income ?? 0;
  const expense = totals?.expense ?? 0;
  return { key, label, title, income, expense, balance: income - expense, future };
}

function sumBy(
  transactions: TransactionWithRelations[],
  keyOf: (date: string) => string,
): Map<string, Totals> {
  const totals = new Map<string, Totals>();
  for (const tx of transactions) {
    const key = keyOf(tx.date);
    const entry = totals.get(key) ?? { income: 0, expense: 0 };
    if (tx.type === "INCOME") entry.income += tx.amount;
    else if (tx.type === "EXPENSE") entry.expense += tx.amount;
    totals.set(key, entry);
  }
  return totals;
}

function dailyBuckets(
  transactions: TransactionWithRelations[],
  period: ReportPeriod,
  range: ReportRange,
  today: string,
): ReportBucket[] {
  const totals = sumBy(transactions, (date) => date);
  const count = daysBetween(range.from, range.to);

  return Array.from({ length: count }, (_, index) => {
    const key = addDays(range.from, index);
    const [year, monthIndex, day] = parseYmd(key);
    const weekday = new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
    const label = period === "S" ? WEEKDAY_INITIALS[weekday] : String(day);
    const title = `${WEEKDAYS_SHORT[weekday]} ${day} ${MONTHS_SHORT[monthIndex]}`;
    return toBucket(key, label, title, totals.get(key), key > today);
  });
}

function monthlyBuckets(
  transactions: TransactionWithRelations[],
  range: ReportRange,
  today: string,
): ReportBucket[] {
  const totals = sumBy(transactions, (date) => date.slice(0, 7));
  const [fromYear, fromMonth] = parseYmd(range.from);
  const [toYear, toMonth] = parseYmd(range.to);
  const count = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
  const currentMonth = today.slice(0, 7);

  return Array.from({ length: count }, (_, index) => {
    const key = ymdOf(fromYear, fromMonth + index, 1).slice(0, 7);
    const [year, monthIndex] = parseYmd(`${key}-01`);
    return toBucket(
      key,
      capitalize(MONTHS_SHORT[monthIndex]),
      `${MONTHS_LONG[monthIndex]} ${year}`,
      totals.get(key),
      key > currentMonth,
    );
  });
}

function weeklyBuckets(days: ReportBucket[], range: ReportRange): ReportBucket[] {
  const [year, monthIndex] = parseYmd(range.from);
  const lastDay = daysInMonth(year, monthIndex);
  const month = MONTHS_SHORT[monthIndex];
  const weeks: ReportBucket[] = [];

  for (let start = 1; start <= lastDay; start += 7) {
    const end = Math.min(start + 6, lastDay);
    const slice = days.slice(start - 1, end);
    const totals = slice.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 },
    );
    weeks.push(
      toBucket(
        slice[0].key,
        `${start}–${end}`,
        `${start} – ${end} ${month}`,
        totals,
        slice[0].future,
      ),
    );
  }

  return weeks;
}

function categoriesOf(
  transactions: TransactionWithRelations[],
  totalExpense: number,
): ReportCategory[] {
  const byCategory = new Map<string, ReportCategory>();

  for (const tx of transactions) {
    if (tx.type !== "EXPENSE") continue;
    const key = tx.category_id ?? "none";
    const existing = byCategory.get(key);
    if (existing) {
      existing.amount += tx.amount;
      continue;
    }
    byCategory.set(key, {
      categoryId: tx.category_id,
      name: tx.category?.name?.trim() || "Sin categoría",
      icon: tx.category?.icon?.trim() || "📦",
      amount: tx.amount,
      percentage: 0,
    });
  }

  return Array.from(byCategory.values())
    .map((item) => ({
      ...item,
      percentage: totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** Future buckets don't count, so a half-elapsed month isn't diluted by empty days. */
function averagePerBucket(total: number, buckets: ReportBucket[]): number {
  const elapsed = buckets.filter((bucket) => !bucket.future).length;
  return elapsed > 0 ? total / elapsed : 0;
}

export function aggregateReport(
  transactions: TransactionWithRelations[],
  period: ReportPeriod,
  range: ReportRange,
  today: string,
): ReportData {
  let income = 0;
  let expense = 0;
  for (const tx of transactions) {
    if (tx.type === "INCOME") income += tx.amount;
    else if (tx.type === "EXPENSE") expense += tx.amount;
  }

  const buckets =
    period === "S" || period === "M"
      ? dailyBuckets(transactions, period, range, today)
      : monthlyBuckets(transactions, range, today);
  const weeks = period === "M" ? weeklyBuckets(buckets, range) : null;

  return {
    range,
    income,
    expense,
    balance: income - expense,
    average: averagePerBucket(expense, buckets),
    weeklyAverage: weeks ? averagePerBucket(expense, weeks) : null,
    buckets,
    weeklyBuckets: weeks,
    categories: categoriesOf(transactions, expense),
    isEmpty: transactions.length === 0,
  };
}
