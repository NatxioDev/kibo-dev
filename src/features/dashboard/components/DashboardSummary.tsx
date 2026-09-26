import { GrowBar } from "@/components/motion/GrowBar";
import { Reveal } from "@/components/motion/Reveal";
import { StatCard } from "@/components/ui/StatCard";
import type { TransactionCurrency } from "@/features/transactions/types";

type DashboardSummaryProps = {
  income: number;
  expense: number;
  balance: number;
  currency: TransactionCurrency;
  periodLabel: string;
};

export function DashboardSummary({
  income,
  expense,
  balance,
  currency,
  periodLabel,
}: DashboardSummaryProps) {
  const total = income + expense;
  const incomePercent = total > 0 ? Math.round((income / total) * 100) : 50;

  return (
    <section className="flex flex-col gap-3">
      <Reveal>
        <StatCard
          variant="hero"
          label={`Balance · ${periodLabel}`}
          amount={balance}
          currency={currency}
          footer={
            <div className="flex flex-col gap-2">
              <div className="flex h-1.5 overflow-hidden rounded-full bg-hero-foreground/15">
                <GrowBar
                  percent={incomePercent}
                  delay={0.35}
                  className="h-full rounded-full bg-hero-foreground/85"
                />
              </div>
              <div className="flex justify-between text-xs text-hero-muted">
                <span>Ingresos {incomePercent}%</span>
                <span>Gastos {100 - incomePercent}%</span>
              </div>
            </div>
          }
        />
      </Reveal>
      <Reveal className="grid grid-cols-2 gap-3">
        <StatCard
          label="Ingresos"
          icon="↓"
          amount={income}
          currency={currency}
          accent="income"
        />
        <StatCard
          label="Gastos"
          icon="↑"
          amount={expense}
          currency={currency}
          accent="expense"
        />
      </Reveal>
    </section>
  );
}
