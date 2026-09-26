import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Card } from "@/components/ui/Card";
import type { TransactionCurrency } from "@/features/transactions/types";

type StatCardProps = {
  label: string;
  amount: number;
  currency: TransactionCurrency;
  icon?: ReactNode;
  accent?: "default" | "income" | "expense";
  variant?: "default" | "hero";
  footer?: ReactNode;
  className?: string;
};

const accentClass = {
  default: "text-foreground",
  income: "text-income",
  expense: "text-expense",
};

const iconAccentClass = {
  default: "bg-surface-muted text-foreground",
  income: "bg-income/15 text-income",
  expense: "bg-expense/15 text-expense",
};

const labelClass =
  "text-[0.6875rem] font-semibold tracking-[0.14em] uppercase";

export function StatCard({
  label,
  amount,
  currency,
  icon,
  accent = "default",
  variant = "default",
  footer,
  className = "",
}: StatCardProps) {
  if (variant === "hero") {
    return (
      <Card
        variant="hero"
        className={`relative overflow-hidden px-7 py-8 ${className}`}
      >
        <p className={`text-sm text-hero-muted ${labelClass}`}>{label}</p>
        <AnimatedNumber
          value={amount}
          currency={currency}
          className="mt-3 block font-display text-6xl font-extrabold tracking-[-0.045em] tabular-nums sm:text-7xl"
        />
        {footer ? <div className="mt-6">{footer}</div> : null}
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col gap-2.5 px-4 py-4 ${className}`}>
      <div className="flex items-center gap-2">
        {icon ? (
          <span
            aria-hidden
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${iconAccentClass[accent]}`}
          >
            {icon}
          </span>
        ) : null}
        <p className={`text-xs text-muted-foreground ${labelClass}`}>{label}</p>
      </div>
      <AnimatedNumber
        value={amount}
        currency={currency}
        className={`block font-display text-xl font-extrabold sm:text-2xl tracking-[-0.035em] break-words tabular-nums ${accentClass[accent]}`}
      />
    </Card>
  );
}
