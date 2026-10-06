"use client";

import { useReducedMotion } from "motion/react";
import { Pie, PieChart } from "recharts";
import { GrowBar } from "@/components/motion/GrowBar";
import { Card } from "@/components/ui/Card";
import { ChartContainer } from "@/components/ui/Chart";
import { categoryTint } from "@/features/categories/categoryColor";
import type { ReportCategory } from "@/features/reports/types";
import { formatReportAmount } from "@/features/reports/utils/format";
import type { TransactionCurrency } from "@/features/transactions/types";

export type ColoredReportCategory = ReportCategory & { color: string };

type CategoryBreakdownProps = {
  categories: ColoredReportCategory[];
  total: number;
  centerLabel: string;
  currency: TransactionCurrency;
};

export function CategoryBreakdown({
  categories,
  total,
  centerLabel,
  currency,
}: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return (
      <Card className="px-5 py-8 text-center text-sm text-pretty text-muted-foreground">
        Sin gastos en este período. Solo hubo ingresos.
      </Card>
    );
  }

  // The donut sits beside the list only when the card is wide enough for
  // category names to stay readable.
  return (
    <Card className="@container px-4 py-5">
      <div className="flex flex-col items-center gap-6 @[30rem]:flex-row @[30rem]:items-start @[30rem]:gap-5">
        <CategoryDonut
          categories={categories}
          total={total}
          centerLabel={centerLabel}
          currency={currency}
        />
        <CategoryList categories={categories} currency={currency} />
      </div>
    </Card>
  );
}

function CategoryDonut({ categories, total, centerLabel, currency }: CategoryBreakdownProps) {
  const reduceMotion = useReducedMotion();
  const slices = categories.map((category) => ({
    name: category.name,
    amount: category.amount,
    fill: category.color,
  }));

  return (
    <div className="relative aspect-square w-44 shrink-0 @[30rem]:mt-1 @[30rem]:w-36">
      <ChartContainer config={{}} className="h-full w-full" aria-hidden>
        <PieChart>
          <Pie
            data={slices}
            dataKey="amount"
            nameKey="name"
            innerRadius="64%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={slices.length > 1 ? 1.5 : 0}
            cornerRadius={3}
            stroke="none"
            isAnimationActive={!reduceMotion}
          />
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-7 text-center">
        <span className="font-display text-base leading-tight font-extrabold tracking-[-0.03em] break-all text-foreground tabular-nums @[30rem]:text-sm">
          {formatReportAmount(total, currency)}
        </span>
        <span className="mt-0.5 text-[0.6875rem] text-muted-foreground">{centerLabel}</span>
      </div>
    </div>
  );
}

function CategoryList({
  categories,
  currency,
}: {
  categories: ColoredReportCategory[];
  currency: TransactionCurrency;
}) {
  const maxAmount = categories[0]?.amount ?? 0;

  return (
    <ul className="flex w-full min-w-0 flex-col gap-4">
      {categories.map((category, index) => (
        <li key={category.categoryId ?? "none"} className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
            style={{ backgroundColor: categoryTint(category.color) }}
          >
            {category.icon}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">{category.name}</p>
              <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                {formatReportAmount(category.amount, currency)}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-track">
              <GrowBar
                percent={maxAmount > 0 ? (category.amount / maxAmount) * 100 : 0}
                delay={0.2 + index * 0.05}
                className="h-full rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </div>
            <div className="flex justify-between text-[0.6875rem] text-muted-foreground tabular-nums">
              <span>{formatPercentage(category.percentage)}</span>
              {index === 0 && categories.length > 1 ? <span>mayor gasto</span> : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatPercentage(value: number): string {
  if (value > 0 && value < 1) return "<1%";
  return `${Math.round(value)}%`;
}
