import { Card } from "@/components/ui/Card";
import { formatReportAmount, splitReportAmount } from "@/features/reports/utils/format";
import type { TransactionCurrency } from "@/features/transactions/types";

type HeroStatProps = {
  tag: string;
  amount: number;
  footnote: string;
  currency: TransactionCurrency;
  className?: string;
};

export function HeroStat({ tag, amount, footnote, currency, className = "" }: HeroStatProps) {
  const { symbol, value } = splitReportAmount(amount, currency);
  return (
    <div className={`px-1 ${className}`}>
      <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {tag}
      </p>
      <p className="mt-1 font-display text-[2.75rem] leading-none font-black tracking-[-0.045em] text-foreground tabular-nums sm:text-5xl">
        <span className="text-2xl font-extrabold tracking-[-0.03em]">{symbol}</span>
        {"\u2009"}
        {value}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">{footnote}</p>
    </div>
  );
}

type SummaryCardsProps = {
  income: number;
  expense: number;
  balance: number;
  currency: TransactionCurrency;
};

export function SummaryCards({ income, expense, balance, currency }: SummaryCardsProps) {
  const negative = Math.round(balance) < 0;
  const items = [
    { label: "Ingresos", value: formatReportAmount(income, currency), tone: "text-income" },
    { label: "Gastos", value: formatReportAmount(expense, currency), tone: "text-foreground" },
    {
      label: "Balance",
      value: formatReportAmount(balance, currency, { signed: true }),
      tone: negative ? "text-expense" : "text-income",
    },
  ];

  return (
    <dl className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <Card key={item.label} className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-3 text-center">
          <dt className="text-[0.625rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">
            {item.label}
          </dt>
          <dd
            className={`max-w-full font-display text-sm font-extrabold tracking-[-0.02em] break-words tabular-nums sm:text-base ${item.tone}`}
          >
            {item.value}
          </dd>
        </Card>
      ))}
    </dl>
  );
}
