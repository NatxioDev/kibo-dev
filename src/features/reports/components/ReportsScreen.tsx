"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition, type ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Button, buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Segmented } from "@/components/ui/Segmented";
import {
  CategoryBreakdown,
  type ColoredReportCategory,
} from "@/features/reports/components/CategoryBreakdown";
import { IncomeExpenseChart } from "@/features/reports/components/IncomeExpenseChart";
import { PeriodNavigator } from "@/features/reports/components/PeriodNavigator";
import { HeroStat, SummaryCards } from "@/features/reports/components/ReportSummary";
import type { ReportData, ReportPeriod } from "@/features/reports/types";
import { currencyName, formatReportAmount } from "@/features/reports/utils/format";
import {
  MONTHS_LONG,
  formatRangeLabel,
  formatRelativeLabel,
  getReportRange,
  parseYmd,
} from "@/features/reports/utils/period";
import type { TransactionCurrency } from "@/features/transactions/types";

export type ScreenReport = Omit<ReportData, "categories"> & {
  categories: ColoredReportCategory[];
};

type Selection = {
  period: ReportPeriod;
  offset: number;
  currency: TransactionCurrency;
};

type ReportsScreenProps = Selection & {
  today: string;
  report: ScreenReport | null;
};

const CURRENCY_OPTIONS = (["BOB", "USD"] as const).map((value) => ({
  value,
  label: (
    <>
      <span aria-hidden>{value === "BOB" ? "🇧🇴" : "🇺🇸"}</span>
      {currencyName(value)}
    </>
  ),
}));

export function ReportsScreen({ period, offset, currency, today, report }: ReportsScreenProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useOptimistic<Selection, Partial<Selection>>(
    { period, offset, currency },
    (state, patch) => ({ ...state, ...patch }),
  );

  function navigate(patch: Partial<Selection>) {
    const next = { ...selected, ...patch };
    const params = new URLSearchParams();
    if (next.period !== "6M") params.set("period", next.period);
    if (next.offset !== 0) params.set("offset", String(next.offset));
    if (next.currency !== "BOB") params.set("currency", next.currency);
    const query = params.toString();
    startTransition(() => {
      setSelected(next);
      router.replace(query ? `/reportes?${query}` : "/reportes", { scroll: false });
    });
  }

  const range = getReportRange(selected.period, selected.offset, today);
  const relativeLabel = formatRelativeLabel(selected.period, selected.offset);
  const currencySwitch = (
    <Segmented
      label="Moneda"
      value={selected.currency}
      options={CURRENCY_OPTIONS}
      onChange={(next) => navigate({ currency: next })}
      size="lg"
    />
  );

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 pt-6 pb-16 sm:pt-10">
      <Stagger className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Reveal as="header" className="flex items-center justify-between gap-3">
          <h1 className="font-display text-4xl font-black tracking-[-0.045em] text-foreground sm:text-5xl">
            Reportes
          </h1>
          <ExportButton />
        </Reveal>

        <Reveal>
          <PeriodNavigator
            period={selected.period}
            offset={selected.offset}
            rangeLabel={formatRangeLabel(selected.period, range)}
            relativeLabel={relativeLabel}
            onPeriodChange={(next) => navigate({ period: next, offset: 0 })}
            onStep={(direction) => navigate({ offset: selected.offset + direction })}
          />
        </Reveal>

        <div
          aria-busy={pending}
          className={`flex flex-col gap-4 transition-opacity duration-200 ${pending ? "opacity-55" : ""}`}
        >
          {report === null ? (
            <Reveal>
              <ReportsErrorState />
            </Reveal>
          ) : report.isEmpty ? (
            <>
              <Reveal className="sm:max-w-sm">{currencySwitch}</Reveal>
              <Reveal>
                <EmptyState
                  icon="📊"
                  title="Todavía no hay datos para reportar"
                  description={`Registra ingresos y gastos en ${currencyName(currency)} para ver tendencias, balances y el desglose por categoría.`}
                  action={<Button href="/transactions/new">+ Registrar movimiento</Button>}
                />
              </Reveal>
            </>
          ) : (
            <ReportContent
              report={report}
              period={period}
              offset={offset}
              currency={currency}
              today={today}
              currencySwitch={currencySwitch}
            />
          )}
        </div>
      </Stagger>
    </main>
  );
}

type ReportContentProps = Selection & {
  report: ScreenReport;
  today: string;
  currencySwitch: ReactNode;
};

function ReportContent({
  report,
  period,
  offset,
  currency,
  today,
  currencySwitch,
}: ReportContentProps) {
  const [year, monthIndex] = parseYmd(report.range.from);
  const total = formatReportAmount(report.expense, currency);
  const weekly = report.weeklyBuckets;

  const hero = {
    S: {
      tag: "Promedio diario · gastos",
      amount: report.average,
      footnote: `Total semana ${total}`,
    },
    M: {
      tag: "Promedio semanal · gastos",
      amount: report.weeklyAverage ?? 0,
      footnote: `Total ${MONTHS_LONG[monthIndex]} ${total}`,
    },
    "6M": {
      tag: "Promedio mensual · gastos",
      amount: report.average,
      footnote: `Total período ${total}`,
    },
    A: {
      tag: `Total gastos · ${year}`,
      amount: report.expense,
      footnote: `Promedio mensual ${formatReportAmount(report.average, currency)}`,
    },
  }[period];

  const centerLabel = {
    S: formatRelativeLabel("S", offset),
    M: MONTHS_LONG[monthIndex],
    "6M": "total gastos",
    A: `año ${year}`,
  }[period];

  return (
    <>
      <Reveal>
        {period === "M" ? (
          <>
            <HeroStat {...hero} currency={currency} className="lg:hidden" />
            <HeroStat
              {...hero}
              tag="Promedio diario · gastos"
              amount={report.average}
              currency={currency}
              className="hidden lg:block"
            />
          </>
        ) : (
          <HeroStat {...hero} currency={currency} />
        )}
      </Reveal>

      <Reveal className="sm:max-w-sm">{currencySwitch}</Reveal>

      <Reveal className="sm:max-w-xl">
        <SummaryCards
          income={report.income}
          expense={report.expense}
          balance={report.balance}
          currency={currency}
        />
      </Reveal>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal as="section" className="flex min-w-0 flex-col gap-2.5">
          {weekly ? (
            <>
              <SectionHeading title="Ingresos vs gastos" caption="por semana" className="lg:hidden" />
              <SectionHeading title="Ingresos vs gastos" caption="por día" className="hidden lg:flex" />
              <div className="lg:hidden">
                <IncomeExpenseChart buckets={weekly} currency={currency} today={today} />
              </div>
              <div className="hidden lg:block">
                <IncomeExpenseChart
                  buckets={report.buckets}
                  currency={currency}
                  today={today}
                  sparseTicks
                />
              </div>
            </>
          ) : (
            <>
              <SectionHeading
                title="Ingresos vs gastos"
                caption={period === "S" ? "por día" : "por mes"}
              />
              <IncomeExpenseChart buckets={report.buckets} currency={currency} today={today} />
            </>
          )}
        </Reveal>

        <Reveal as="section" className="flex min-w-0 flex-col gap-2.5">
          <SectionHeading title="Gastos por categoría" caption="del período" />
          <CategoryBreakdown
            categories={report.categories}
            total={report.expense}
            centerLabel={centerLabel}
            currency={currency}
          />
        </Reveal>
      </div>
    </>
  );
}

function SectionHeading({
  title,
  caption,
  className = "",
}: {
  title: string;
  caption: string;
  className?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-3 px-1 ${className}`}>
      <h2 className="font-display text-lg font-extrabold tracking-[-0.03em] text-balance text-foreground">
        {title}
      </h2>
      <span className="shrink-0 text-xs text-muted-foreground">{caption}</span>
    </div>
  );
}

function ExportButton() {
  return (
    <button
      type="button"
      disabled
      className={buttonClassName({ variant: "secondary", size: "sm", className: "shrink-0" })}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M12 4v11" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 20h14" />
      </svg>
      Exportar
      <span className="rounded-md bg-track px-1.5 py-0.5 text-[0.625rem] font-bold tracking-[0.06em] text-muted-foreground uppercase">
        Pronto
      </span>
    </button>
  );
}

function ReportsErrorState() {
  return (
    <div className="rounded-card border border-expense-border bg-expense-soft px-6 py-8 text-center">
      <p className="text-base font-medium text-expense-strong">
        No pudimos cargar tus reportes.
      </p>
      <p className="mt-1 text-sm text-expense/80">
        Revisa tu conexión e intenta nuevamente.
      </p>
      <Button href="/reportes" variant="secondary" className="mt-5">
        Reintentar
      </Button>
    </div>
  );
}
