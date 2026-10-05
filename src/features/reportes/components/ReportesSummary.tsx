import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import type { TransactionCurrency } from "@/features/transactions/types";

type ReportesSummaryProps = {
  income: number;
  expense: number;
  balance: number;
  currency: TransactionCurrency;
};

export function ReportesSummary({
  income,
  expense,
  balance,
  currency,
}: ReportesSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="glass rounded-card border border-border bg-surface px-3 py-3 text-center shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Ingresos
        </p>
        <p className="mt-1.5 text-sm font-bold tracking-tight text-foreground">
          {formatMoneyAmount(income, currency)}
        </p>
      </div>

      <div className="glass rounded-card border border-border bg-surface px-3 py-3 text-center shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Gastos
        </p>
        <p className="mt-1.5 text-sm font-bold tracking-tight text-foreground">
          {formatMoneyAmount(expense, currency)}
        </p>
      </div>

      <div className="glass rounded-card border border-border bg-surface px-3 py-3 text-center shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Balance
        </p>
        <p
          className={`mt-1.5 text-sm font-bold tracking-tight ${
            balance >= 0 ? "text-[#3E9A52]" : "text-[#C0392B]"
          }`}
        >
          {balance >= 0 ? "+" : ""}
          {formatMoneyAmount(balance, currency)}
        </p>
      </div>
    </div>
  );
}
