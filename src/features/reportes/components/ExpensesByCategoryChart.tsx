"use client";

import { GrowBar } from "@/components/motion/GrowBar";
import { Card } from "@/components/ui/Card";
import type { CategoryExpense } from "@/features/reportes/types";
import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import type { TransactionCurrency } from "@/features/transactions/types";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

type ExpensesByCategoryChartProps = {
  data: CategoryExpense[];
  currency: TransactionCurrency;
  totalExpense: number;
};

export function ExpensesByCategoryChart({
  data,
  currency,
  totalExpense,
}: ExpensesByCategoryChartProps) {
  const maxAmount = data.reduce((max, item) => Math.max(max, item.amount), 0);

  return (
    <Card as="section" className="flex flex-col gap-5 px-4 py-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold tracking-[-0.03em] text-foreground">
          Gastos por categoría
        </h2>
        <span className="text-xs text-muted-foreground">del período</span>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay gastos en este período para esta moneda.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Donut Chart */}
          <div className="relative mx-auto h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">
                {formatMoneyAmount(totalExpense, currency)}
              </span>
              <span className="text-xs text-muted-foreground">
                {data.length > 0 ? "total gastos" : ""}
              </span>
            </div>
          </div>

          {/* Category List */}
          <ul className="flex flex-col gap-4">
            {data.map((item, index) => {
              const widthPercent =
                maxAmount > 0 ? Math.round((item.amount / maxAmount) * 100) : 0;

              return (
                <li
                  key={item.categoryId ?? "none"}
                  className="flex items-center gap-3"
                >
                  <span
                    aria-hidden
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                    style={{
                      backgroundColor: `${item.color}20`,
                    }}
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
                          style={{ backgroundColor: item.color }}
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
        </div>
      )}
    </Card>
  );
}
