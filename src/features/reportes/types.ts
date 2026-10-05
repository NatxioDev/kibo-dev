import type { TransactionCurrency } from "@/features/transactions/types";

export type ReportesPeriod = "S" | "M" | "6M" | "A";

export type PeriodRange = {
  from: string;
  to: string;
};

export type IncomeVsExpensesDataPoint = {
  label: string;
  income: number;
  expense: number;
  balance: number;
};

export type CategoryExpense = {
  categoryId: string | null;
  name: string;
  icon: string;
  amount: number;
  percentage: number;
  color: string;
};

export type ReportesData = {
  period: ReportesPeriod;
  currency: TransactionCurrency;
  periodLabel: string;
  rangeLabel: string;
  averageExpense: number;
  averageLabel: string;
  totalPeriod: number;
  income: number;
  expense: number;
  balance: number;
  incomeVsExpenses: IncomeVsExpensesDataPoint[];
  expensesByCategory: CategoryExpense[];
  isEmpty: boolean;
  canNavigateForward: boolean;
};
