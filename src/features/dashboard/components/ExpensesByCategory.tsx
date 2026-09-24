import type { CategoryExpense } from "@/features/dashboard/types";
import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import type { TransactionCurrency } from "@/features/transactions/types";

type ExpensesByCategoryProps = {
  items: CategoryExpense[];
  currency: TransactionCurrency;
};

export function ExpensesByCategory({
  items,
  currency,
}: ExpensesByCategoryProps) {
  const maxAmount = items.reduce((max, item) => Math.max(max, item.amount), 0);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Gastos por categoría
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No hay gastos en este período para esta moneda.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => {
            const widthPercent =
              maxAmount > 0 ? Math.round((item.amount / maxAmount) * 100) : 0;

            return (
              <li key={item.categoryId ?? "none"} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {item.icon} {item.name}
                  </p>
                  <p className="shrink-0 text-sm text-zinc-600 dark:text-zinc-300">
                    {formatMoneyAmount(item.amount, currency)}
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {" "}
                      · {item.percentage.toFixed(1)}%
                    </span>
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-zinc-400 dark:bg-zinc-300"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
