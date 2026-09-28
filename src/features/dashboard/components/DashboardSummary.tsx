import { Reveal } from "@/components/motion/Reveal";
import { StatCard } from "@/components/ui/StatCard";
import { BalanceHeroCard } from "@/features/dashboard/components/BalanceHeroCard";
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
        <BalanceHeroCard
          balance={balance}
          currency={currency}
          periodLabel={periodLabel}
          incomePercent={incomePercent}
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
