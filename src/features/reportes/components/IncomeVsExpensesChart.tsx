"use client";

import { Card } from "@/components/ui/Card";
import type {
  IncomeVsExpensesDataPoint,
  ReportesPeriod,
} from "@/features/reportes/types";
import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import type { TransactionCurrency } from "@/features/transactions/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type IncomeVsExpensesChartProps = {
  data: IncomeVsExpensesDataPoint[];
  currency: TransactionCurrency;
  period: ReportesPeriod;
  isMobile?: boolean;
};

export function IncomeVsExpensesChart({
  data,
  currency,
  period,
  isMobile = false,
}: IncomeVsExpensesChartProps) {
  // For mobile M view, group by weeks
  const chartData =
    period === "M" && isMobile ? groupByWeeks(data) : data;

  return (
    <Card as="section" className="flex flex-col gap-4 px-4 py-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold tracking-[-0.03em] text-foreground">
          Ingresos vs gastos
        </h2>
        <span className="text-xs text-muted-foreground">
          {period === "S" && "por día"}
          {period === "M" && (isMobile ? "por semana" : "por día")}
          {period === "6M" && "por mes"}
          {period === "A" && "por mes"}
        </span>
      </div>

      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#3E9A52]" />
          <span className="text-xs font-semibold text-muted-foreground">
            Ingresos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">
            Gastos
          </span>
        </div>
      </div>

      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(0,0,0,0.05)"
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#7a7266", fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#7a7266", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="income" fill="#3E9A52" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#141210" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {chartData.map((item, index) => (
          <div
            key={index}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              item.balance < 0
                ? "bg-[#FDECEA] text-[#C0392B]"
                : "bg-surface-muted text-muted-foreground"
            }`}
          >
            <span>{item.label}</span>
            <span>
              {item.balance >= 0 ? "+" : ""}
              {formatMoneyAmount(item.balance, currency)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Group daily data by weeks for mobile month view
 */
function groupByWeeks(
  data: IncomeVsExpensesDataPoint[]
): IncomeVsExpensesDataPoint[] {
  const weeks: IncomeVsExpensesDataPoint[] = [];
  const weekRanges = [
    { start: 1, end: 7, label: "1-7" },
    { start: 8, end: 14, label: "8-14" },
    { start: 15, end: 21, label: "15-21" },
    { start: 22, end: 28, label: "22-28" },
    { start: 29, end: 31, label: "29-31" },
  ];

  weekRanges.forEach((range) => {
    let income = 0;
    let expense = 0;

    data.forEach((item, index) => {
      const day = index + 1;
      if (day >= range.start && day <= range.end) {
        income += item.income;
        expense += item.expense;
      }
    });

    if (income > 0 || expense > 0 || weeks.length < 4) {
      weeks.push({
        label: range.label,
        income,
        expense,
        balance: income - expense,
      });
    }
  });

  return weeks;
}
