import type { Transaction, TransactionCurrency } from "@/features/transactions/domain/models";
import type { MascotSignals } from "./types";

export const RECENT_INCOME_DAYS = 3;
export const INCOME_HISTORY_DAYS = 90;
export const MIN_INCOME_HISTORY = 3;
export const UNEXPECTED_INCOME_FACTOR = 1.5;
export const MANY_EXPENSES_TODAY = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

export type MascotSignalTransaction = Pick<Transaction, "type" | "amount" | "currency" | "date">;

function toDayNumber(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

function fromDayNumber(dayNumber: number): string {
  return new Date(dayNumber * DAY_MS).toISOString().slice(0, 10);
}

/** Fecha local `YYYY-MM-DD`, con el mismo criterio de zona horaria que `dashboard/utils/period`. */
export function toLocalDateString(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Rango a consultar: cubre los 90 días previos al ingreso reciente más antiguo. */
export function getMascotSignalsRange(today: string): { from: string; to: string } {
  const from = toDayNumber(today) - (RECENT_INCOME_DAYS - 1) - INCOME_HISTORY_DAYS;
  return { from: fromDayNumber(from), to: today };
}

export function computeMascotSignals(
  transactions: MascotSignalTransaction[],
  options: { today: string; currency: TransactionCurrency },
): MascotSignals {
  const today = toDayNumber(options.today);
  const sameCurrency = transactions.filter((t) => t.currency === options.currency);

  const incomes = sameCurrency
    .filter((t) => t.type === "INCOME")
    .map((t) => ({ day: toDayNumber(t.date), amount: t.amount }));

  const unexpectedIncome = incomes.some((income) => {
    const isRecent = income.day <= today && income.day > today - RECENT_INCOME_DAYS;
    if (!isRecent) return false;

    const history = incomes.filter(
      (other) => other.day < income.day && other.day >= income.day - INCOME_HISTORY_DAYS,
    );
    if (history.length < MIN_INCOME_HISTORY) return false;

    const average = history.reduce((sum, other) => sum + other.amount, 0) / history.length;
    return income.amount > UNEXPECTED_INCOME_FACTOR * average;
  });

  const expensesToday = sameCurrency.filter(
    (t) => t.type === "EXPENSE" && toDayNumber(t.date) === today,
  ).length;

  return {
    unexpectedIncome,
    manyExpensesToday: expensesToday >= MANY_EXPENSES_TODAY,
  };
}
