import type {
  TransactionCurrency,
  TransactionWithRelations,
} from "@/features/transactions/types";

export type DashboardPeriod = "this_month" | "last_month" | "last_3_months";

export type CategoryExpense = {
  categoryId: string | null;
  name: string;
  icon: string;
  amount: number;
  percentage: number;
};

export type DashboardData = {
  period: DashboardPeriod;
  currency: TransactionCurrency;
  periodLabel: string;
  income: number;
  expense: number;
  balance: number;
  expensesByCategory: CategoryExpense[];
  recent: TransactionWithRelations[];
  isEmpty: boolean;
};

export const DASHBOARD_PERIODS: {
  value: DashboardPeriod;
  label: string;
}[] = [
  { value: "this_month", label: "Este mes" },
  { value: "last_month", label: "Mes pasado" },
  { value: "last_3_months", label: "Últimos 3 meses" },
];
