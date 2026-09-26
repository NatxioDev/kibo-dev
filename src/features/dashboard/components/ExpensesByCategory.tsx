import { GrowBar } from "@/components/motion/GrowBar";
import { Card } from "@/components/ui/Card";
import {
  type CategoryColorMap,
  categoryColorOf,
  categoryTint,
} from "@/features/categories/categoryColor";
import type { CategoryExpense } from "@/features/dashboard/types";
import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import type { TransactionCurrency } from "@/features/transactions/types";

type ExpensesByCategoryProps = {
  items: CategoryExpense[];
  currency: TransactionCurrency;
  colors: CategoryColorMap;
};

export function ExpensesByCategory({
  items,
  currency,
  colors,
}: ExpensesByCategoryProps) {
  const maxAmount = items.reduce((max, item) => Math.max(max, item.amount), 0);

  return (
    <Card as="section" className="flex flex-col gap-5 px-5 py-5">
      <h2 className="font-display text-xl font-bold tracking-[-0.03em] text-foreground">
        Gastos por categoría
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay gastos en este período para esta moneda.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item, index) => {
            const widthPercent =
              maxAmount > 0 ? Math.round((item.amount / maxAmount) * 100) : 0;
            const color = categoryColorOf(colors, item.categoryId);

            return (
              <li key={item.categoryId ?? "none"} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: categoryTint(color) }}
                >
                  {item.icon}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {formatMoneyAmount(item.amount, currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-track">
                      <GrowBar
                        percent={widthPercent}
                        delay={0.3 + index * 0.06}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
