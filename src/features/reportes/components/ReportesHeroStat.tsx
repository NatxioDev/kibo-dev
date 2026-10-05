import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import type { TransactionCurrency } from "@/features/transactions/types";

type ReportesHeroStatProps = {
  averageExpense: number;
  averageLabel: string;
  totalPeriod: number;
  currency: TransactionCurrency;
};

export function ReportesHeroStat({
  averageExpense,
  averageLabel,
  totalPeriod,
  currency,
}: ReportesHeroStatProps) {
  return (
    <div className="flex flex-col gap-1 px-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {averageLabel}
      </p>
      <p className="font-display text-4xl font-black tracking-[-0.04em] text-foreground">
        {formatMoneyAmount(averageExpense, currency)}
      </p>
      <p className="text-xs text-muted-foreground">
        Total {currency === "BOB" ? "Bs" : "$"} {totalPeriod.toLocaleString("es-BO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}
