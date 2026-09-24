import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import type { TransactionCurrency } from "@/features/transactions/types";

type DashboardSummaryCardProps = {
  label: string;
  emoji: string;
  amount: number;
  currency: TransactionCurrency;
  accent?: "default" | "income" | "expense" | "balance";
};

const accentClass: Record<
  NonNullable<DashboardSummaryCardProps["accent"]>,
  string
> = {
  default: "text-zinc-900 dark:text-zinc-50",
  income: "text-income",
  expense: "text-expense",
  balance: "text-zinc-900 dark:text-zinc-50",
};

export function DashboardSummaryCard({
  label,
  emoji,
  amount,
  currency,
  accent = "default",
}: DashboardSummaryCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {emoji} {label}
      </p>
      <p className={`mt-2 text-xl font-semibold ${accentClass[accent]}`}>
        {formatMoneyAmount(amount, currency)}
      </p>
    </div>
  );
}
