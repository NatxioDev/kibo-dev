import type {
  CategoryExpense,
  IncomeVsExpensesDataPoint,
  ReportesPeriod,
} from "@/features/reportes/types";
import type { TransactionWithRelations } from "@/features/transactions/types";

/**
 * Group transactions by date key for chart display
 */
function getDateKey(date: string, period: ReportesPeriod): string {
  const d = new Date(date + "T00:00:00");
  const year = d.getFullYear();
  const month = d.getMonth();

  if (period === "S") {
    // Daily: return the date as-is
    return date;
  }

  if (period === "M") {
    // For month, we group by week on mobile, by day on desktop
    // We'll return the date for now and handle grouping in the component
    return date;
  }

  if (period === "6M") {
    // Monthly: return year-month
    const monthStr = String(month + 1).padStart(2, "0");
    return `${year}-${monthStr}`;
  }

  // A (year): monthly
  const monthStr = String(month + 1).padStart(2, "0");
  return `${year}-${monthStr}`;
}

/**
 * Generate label for chart data point
 */
function generateLabel(
  dateKey: string,
  period: ReportesPeriod
): string {
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
  ];

  const DAYS_SHORT = ["D", "L", "M", "X", "J", "V", "S"];

  if (period === "S") {
    const date = new Date(dateKey + "T00:00:00");
    const dayOfWeek = date.getDay();
    return DAYS_SHORT[dayOfWeek];
  }

  if (period === "M") {
    // For month view, we'll use day numbers
    const date = new Date(dateKey + "T00:00:00");
    return String(date.getDate());
  }

  if (period === "6M" || period === "A") {
    // Monthly view: use month abbreviation
    const [, monthStr] = dateKey.split("-");
    const monthIndex = parseInt(monthStr, 10) - 1;
    return MONTHS_SHORT[monthIndex];
  }

  return dateKey;
}

/**
 * Aggregate transactions into chart data
 */
export function aggregateIncomeVsExpenses(
  transactions: TransactionWithRelations[],
  period: ReportesPeriod,
  range: { from: string; to: string }
): IncomeVsExpensesDataPoint[] {
  // Group by date key
  const grouped = new Map<
    string,
    { income: number; expense: number }
  >();

  transactions.forEach((t) => {
    const key = getDateKey(t.date, period);
    const existing = grouped.get(key) || { income: 0, expense: 0 };

    if (t.type === "INCOME") {
      existing.income += t.amount;
    } else {
      existing.expense += t.amount;
    }

    grouped.set(key, existing);
  });

  // Generate all expected keys based on period
  const keys = generateDateKeys(period, range);

  // Build data points
  return keys.map((key) => {
    const data = grouped.get(key) || { income: 0, expense: 0 };
    return {
      label: generateLabel(key, period),
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    };
  });
}

/**
 * Generate all expected date keys for the period
 */
function generateDateKeys(
  period: ReportesPeriod,
  range: { from: string; to: string }
): string[] {
  const keys: string[] = [];
  const start = new Date(range.from + "T00:00:00");

  if (period === "S") {
    // 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      keys.push(`${year}-${month}-${day}`);
    }
  } else if (period === "M") {
    // All days in the month
    const year = start.getFullYear();
    const month = start.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      keys.push(`${year}-${monthStr}-${dayStr}`);
    }
  } else if (period === "6M") {
    // 6 months
    const startYear = start.getFullYear();
    const startMonth = start.getMonth();

    for (let i = 0; i < 6; i++) {
      const date = new Date(startYear, startMonth + i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      keys.push(`${year}-${month}`);
    }
  } else {
    // A (year): 12 months
    const year = start.getFullYear();
    for (let month = 1; month <= 12; month++) {
      const monthStr = String(month).padStart(2, "0");
      keys.push(`${year}-${monthStr}`);
    }
  }

  return keys;
}

/**
 * Aggregate expenses by category
 */
export function aggregateExpensesByCategory(
  transactions: TransactionWithRelations[],
  colors: ReadonlyMap<string, string>
): CategoryExpense[] {
  const categoryMap = new Map<
    string | null,
    {
      name: string;
      icon: string;
      amount: number;
    }
  >();

  let totalExpense = 0;

  transactions.forEach((t) => {
    if (t.type === "EXPENSE") {
      totalExpense += t.amount;

      const categoryId = t.category_id;
      const existing = categoryMap.get(categoryId);

      if (existing) {
        existing.amount += t.amount;
      } else {
        categoryMap.set(categoryId, {
          name: t.category?.name ?? "Sin categoría",
          icon: t.category?.icon ?? "📦",
          amount: t.amount,
        });
      }
    }
  });

  // Convert to array and calculate percentages
  const categories: CategoryExpense[] = Array.from(
    categoryMap.entries()
  ).map(([categoryId, data]) => ({
    categoryId,
    name: data.name,
    icon: data.icon,
    amount: data.amount,
    percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
    color: colors.get(categoryId || "") || "#666666",
  }));

  // Sort by amount descending
  categories.sort((a, b) => b.amount - a.amount);

  return categories;
}

/**
 * Calculate average expense based on period
 */
export function calculateAverageExpense(
  totalExpense: number,
  period: ReportesPeriod,
  range: { from: string; to: string }
): number {
  if (period === "S") {
    // Daily average over 7 days
    return totalExpense / 7;
  }

  if (period === "M") {
    // Weekly average (total / ~4.33 weeks)
    const start = new Date(range.from + "T00:00:00");
    const daysInMonth = Math.ceil(
      (new Date(range.to + "T00:00:00").getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    const weeks = daysInMonth / 7;
    return totalExpense / weeks;
  }

  if (period === "6M") {
    // Monthly average over 6 months
    return totalExpense / 6;
  }

  // A (year): monthly average over 12 months
  return totalExpense / 12;
}
