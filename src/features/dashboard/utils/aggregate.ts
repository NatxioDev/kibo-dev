import type {
  CategoryExpense,
  DashboardData,
} from "@/features/dashboard/types";
import type {
  TransactionCurrency,
  TransactionWithRelations,
} from "@/features/transactions/types";
import type { DashboardPeriod } from "@/features/dashboard/types";

export function aggregateDashboardData(
  transactions: TransactionWithRelations[],
  period: DashboardPeriod,
  currency: TransactionCurrency,
  periodLabel: string,
): DashboardData {
  let income = 0;
  let expense = 0;

  for (const tx of transactions) {
    if (tx.type === "INCOME") {
      income += tx.amount;
    } else if (tx.type === "EXPENSE") {
      expense += tx.amount;
    }
  }

  const categoryMap = new Map<
    string,
    { categoryId: string | null; name: string; icon: string; amount: number }
  >();

  for (const tx of transactions) {
    if (tx.type !== "EXPENSE") continue;

    const key = tx.category_id ?? "none";
    const existing = categoryMap.get(key);
    const name = tx.category?.name?.trim() || "Sin categoría";
    const icon = tx.category?.icon?.trim() || "📦";

    if (existing) {
      existing.amount += tx.amount;
    } else {
      categoryMap.set(key, {
        categoryId: tx.category_id,
        name,
        icon,
        amount: tx.amount,
      });
    }
  }

  const expensesByCategory: CategoryExpense[] = Array.from(
    categoryMap.values(),
  )
    .map((item) => ({
      ...item,
      percentage:
        expense > 0 ? Math.round((item.amount / expense) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    period,
    currency,
    periodLabel,
    income,
    expense,
    balance: income - expense,
    expensesByCategory,
    recent: transactions.slice(0, 5),
    isEmpty: transactions.length === 0,
  };
}
