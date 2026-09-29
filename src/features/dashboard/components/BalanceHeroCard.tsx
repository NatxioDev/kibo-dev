"use client";

import { GrowBar } from "@/components/motion/GrowBar";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Card } from "@/components/ui/Card";
import { useBalanceVisibility } from "@/features/dashboard/hooks/useBalanceVisibility";
import type { TransactionCurrency } from "@/features/transactions/types";

type BalanceHeroCardProps = {
  balance: number;
  currency: TransactionCurrency;
  periodLabel: string;
  incomePercent: number | null;
};

const MASK = "••••••";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
      <path d="M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-4.2 4.9" />
      <path d="M6.1 6.1C4 7.8 2.5 10 2 12s3.5 7 10 7a10.5 10.5 0 0 0 4.1-.8" />
    </svg>
  );
}

export function BalanceHeroCard({
  balance,
  currency,
  periodLabel,
  incomePercent,
}: BalanceHeroCardProps) {
  const { visible, toggle } = useBalanceVisibility();

  return (
    <Card
      variant="hero"
      className="relative overflow-hidden px-7 py-8"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-[0.14em] text-hero-muted uppercase">
          {`Balance · ${periodLabel}`}
        </p>
        <button
          type="button"
          onClick={toggle}
          aria-label={visible ? "Ocultar balance" : "Mostrar balance"}
          aria-pressed={!visible}
          className="-mr-1.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-hero-muted transition-colors hover:bg-hero-foreground/10 hover:text-hero-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-foreground"
        >
          <EyeIcon open={visible} />
        </button>
      </div>

      {visible ? (
        <AnimatedNumber
          value={balance}
          currency={currency}
          className="mt-3 block font-display text-6xl font-extrabold tracking-[-0.045em] tabular-nums sm:text-7xl"
        />
      ) : (
        <span
          className="mt-3 block font-display text-6xl font-extrabold tracking-[-0.045em] tabular-nums sm:text-7xl"
          aria-label="Balance oculto"
        >
          {MASK}
        </span>
      )}

      {incomePercent !== null && (
        <div className="mt-6 flex flex-col gap-2">
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
      )}
    </Card>
  );
}
