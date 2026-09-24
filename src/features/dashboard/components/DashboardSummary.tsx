import { DashboardSummaryCard } from "@/features/dashboard/components/DashboardSummaryCard";
import type { TransactionCurrency } from "@/features/transactions/types";

type DashboardSummaryProps = {
  income: number;
  expense: number;
  balance: number;
  currency: TransactionCurrency;
};

export function DashboardSummary({
  income,
  expense,
  balance,
  currency,
}: DashboardSummaryProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <DashboardSummaryCard
        label="Ingresos"
        emoji="💰"
        amount={income}
        currency={currency}
        accent="income"
      />
      <DashboardSummaryCard
        label="Gastos"
        emoji="💸"
        amount={expense}
        currency={currency}
        accent="expense"
      />
      <DashboardSummaryCard
        label="Balance"
        emoji="💵"
        amount={balance}
        currency={currency}
        accent="balance"
      />
    </section>
  );
}
