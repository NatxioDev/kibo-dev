"use client";

import { useReducedMotion } from "motion/react";
import { Bar, BarChart, Cell, Tooltip, XAxis, type XAxisTickContentProps } from "recharts";
import { Card } from "@/components/ui/Card";
import { ChartContainer, type ChartConfig } from "@/components/ui/Chart";
import type { ReportBucket } from "@/features/reports/types";
import { formatBalancePill, formatReportAmount } from "@/features/reports/utils/format";
import type { TransactionCurrency } from "@/features/transactions/types";

const chartConfig = {
  income: { label: "Ingresos", color: "#e0a93b" },
  expense: { label: "Gastos", color: "var(--foreground)" },
} satisfies ChartConfig;

/** Above this many groups the pills stop being legible; the tooltip takes over. */
const MAX_PILLS = 12;

type IncomeExpenseChartProps = {
  buckets: ReportBucket[];
  currency: TransactionCurrency;
  today: string;
  /** Show only these axis labels (e.g. week starts in a 31-day month). */
  sparseTicks?: boolean;
};

export function IncomeExpenseChart({
  buckets,
  currency,
  today,
  sparseTicks = false,
}: IncomeExpenseChartProps) {
  const reduceMotion = useReducedMotion();
  const showPills = buckets.length <= MAX_PILLS;
  const compactPills = buckets.length > 7;

  return (
    <Card className="flex flex-col gap-3 px-4 pt-4 pb-4">
      <ul className="flex gap-4 px-1" aria-label="Leyenda">
        {Object.entries(chartConfig).map(([key, { label, color }]) => (
          <li
            key={key}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </li>
        ))}
      </ul>

      <p className="sr-only">{chartSummary(buckets, currency)}</p>
      <ChartContainer config={chartConfig} className="h-44 w-full lg:h-60">
        <BarChart
          data={buckets}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          barGap={2}
          barCategoryGap={buckets.length > 12 ? "16%" : "22%"}
        >
          <XAxis
            dataKey="key"
            interval={0}
            tickLine={false}
            axisLine={{ stroke: "var(--track)" }}
            tickMargin={8}
            height={24}
            tick={(props: XAxisTickContentProps) => {
              const bucket = buckets[props.index];
              if (!bucket || (sparseTicks && (props.index % 7 !== 0))) {
                return <g />;
              }
              const isToday = bucket.key === today;
              return (
                <text
                  x={props.x}
                  y={props.y}
                  dy={8}
                  textAnchor="middle"
                  className={isToday ? "fill-foreground" : "fill-muted-foreground"}
                  style={{
                    fontSize: 10,
                    fontWeight: isToday ? 800 : 700,
                    opacity: bucket.future ? 0.45 : 1,
                  }}
                >
                  {bucket.label}
                </text>
              );
            }}
          />
          <Tooltip
            cursor={{ fill: "var(--track)", radius: 6 }}
            isAnimationActive={false}
            content={({ active, payload }) => (
              <BucketTooltip
                active={active}
                bucket={payload?.[0]?.payload as ReportBucket | undefined}
                currency={currency}
              />
            )}
          />
          {(["income", "expense"] as const).map((key) => (
            <Bar
              key={key}
              dataKey={key}
              name={chartConfig[key].label}
              fill={`var(--chart-${key})`}
              radius={9999}
              maxBarSize={14}
              isAnimationActive={!reduceMotion}
            >
              {buckets.map((bucket) => (
                <Cell key={bucket.key} fillOpacity={bucket.future ? 0.25 : 1} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ChartContainer>

      {showPills ? (
        <ul
          className="grid"
          style={{ gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))` }}
          aria-label="Balance por grupo"
        >
          {buckets.map((bucket) => {
            const empty = bucket.future || (bucket.income === 0 && bucket.expense === 0);
            const negative = !empty && Math.round(bucket.balance) < 0;
            return (
              <li key={bucket.key} className={compactPills ? "px-px" : "px-0.5"}>
                <span className="sr-only">
                  {bucket.title}:{" "}
                  {bucket.future
                    ? "todavía no llega"
                    : empty
                      ? "sin movimientos"
                      : formatReportAmount(bucket.balance, currency, { signed: true })}
                </span>
                <span
                  aria-hidden
                  className={`block truncate rounded-full py-1 text-center font-bold tabular-nums ${
                    compactPills ? "text-[0.5625rem] tracking-[-0.02em]" : "text-[0.625rem]"
                  } ${
                    empty
                      ? "text-muted-foreground/60"
                      : negative
                        ? "bg-track text-expense"
                        : "bg-track text-foreground"
                  }`}
                >
                  {empty ? "—" : formatBalancePill(bucket.balance, currency, compactPills)}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Card>
  );
}

type BucketTooltipProps = {
  active?: boolean;
  bucket?: ReportBucket;
  currency: TransactionCurrency;
};

function BucketTooltip({ active, bucket, currency }: BucketTooltipProps) {
  if (!active || !bucket) return null;
  const negative = Math.round(bucket.balance) < 0;

  return (
    <div className="min-w-36 rounded-2xl border border-border bg-background/95 px-3 py-2.5 text-xs shadow-card backdrop-blur">
      <p className="mb-1.5 font-semibold text-foreground">{bucket.title}</p>
      <dl className="flex flex-col gap-1 tabular-nums">
        <TooltipRow label="Ingresos" color={chartConfig.income.color}>
          {formatReportAmount(bucket.income, currency)}
        </TooltipRow>
        <TooltipRow label="Gastos" color={chartConfig.expense.color}>
          {formatReportAmount(bucket.expense, currency)}
        </TooltipRow>
        <div className="mt-0.5 flex items-center justify-between gap-4 border-t border-track pt-1.5">
          <dt className="text-muted-foreground">Balance</dt>
          <dd className={`font-bold ${negative ? "text-expense" : "text-foreground"}`}>
            {formatReportAmount(bucket.balance, currency, { signed: true })}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function TooltipRow({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </dt>
      <dd className="font-semibold text-foreground">{children}</dd>
    </div>
  );
}

function chartSummary(buckets: ReportBucket[], currency: TransactionCurrency): string {
  const income = buckets.reduce((sum, b) => sum + b.income, 0);
  const expense = buckets.reduce((sum, b) => sum + b.expense, 0);
  return `Gráfico de ingresos y gastos: ${formatReportAmount(income, currency)} de ingresos y ${formatReportAmount(expense, currency)} de gastos en ${buckets.length} grupos.`;
}
