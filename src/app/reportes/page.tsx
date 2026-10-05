import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { categoryColors } from "@/features/categories/categoryColor";
import { ListCategories } from "@/features/categories/application/ListCategories.application";
import { GetReportesData } from "@/features/reportes/application/GetReportesData.application";
import { ExpensesByCategoryChart } from "@/features/reportes/components/ExpensesByCategoryChart";
import { IncomeVsExpensesChart } from "@/features/reportes/components/IncomeVsExpensesChart";
import { ReportesCurrencyToggle } from "@/features/reportes/components/ReportesCurrencyToggle";
import { ReportesEmptyState } from "@/features/reportes/components/ReportesEmptyState";
import { ReportesHeroStat } from "@/features/reportes/components/ReportesHeroStat";
import { ReportesPeriodSelector } from "@/features/reportes/components/ReportesPeriodSelector";
import { ReportesSummary } from "@/features/reportes/components/ReportesSummary";

type ReportesPageProps = {
  searchParams: Promise<{
    period?: string;
    currency?: string;
    offset?: string;
  }>;
};

export default async function ReportesPage({ searchParams }: ReportesPageProps) {
  const params = await searchParams;
  const offset = parseInt(params.offset || "0", 10);

  const { reportesRepository, categoryRepository } =
    await createServerDependencies();

  const [categoriesResult] = await Promise.all([
    new ListCategories(categoryRepository).execute(),
  ]);

  const colors = categoryColors(
    categoriesResult.success ? categoriesResult.data : []
  );

  const result = await new GetReportesData(reportesRepository).execute({
    period: params.period,
    currency: params.currency,
    offset: params.offset,
    colors,
  });

  if (!result.success) {
    return (
      <main className="flex min-h-full flex-1 flex-col px-4 pt-10 pb-16">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-center text-muted-foreground">
            Error al cargar los reportes
          </p>
        </div>
      </main>
    );
  }

  const data = result.data;

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 pt-10 pb-16">
      <Stagger className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        {/* Header */}
        <Reveal
          as="header"
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <h1 className="font-display text-4xl font-black tracking-[-0.04em] text-foreground lg:text-5xl">
            Reportes
          </h1>
          <Button variant="secondary" disabled className="sm:w-auto">
            <span className="flex items-center gap-2">
              <span>Exportar</span>
              <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Pronto
              </span>
            </span>
          </Button>
        </Reveal>

        {/* Period Selector */}
        <Reveal>
          <div className="glass rounded-card border border-border bg-surface p-4 shadow-card">
            <ReportesPeriodSelector
              period={data.period}
              offset={offset}
              canNavigateForward={data.canNavigateForward}
            />

            <div className="mt-3 text-center">
              <p className="text-base font-bold tracking-tight text-foreground">
                {data.periodLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.rangeLabel}
              </p>
            </div>

            <div className="mt-4">
              <ReportesHeroStat
                averageExpense={data.averageExpense}
                averageLabel={data.averageLabel}
                totalPeriod={data.totalPeriod}
                currency={data.currency}
              />
            </div>
          </div>
        </Reveal>

        {/* Currency Toggle */}
        <Reveal>
          <ReportesCurrencyToggle currency={data.currency} />
        </Reveal>

        {/* Summary Cards */}
        {!data.isEmpty && (
          <Reveal>
            <ReportesSummary
              income={data.income}
              expense={data.expense}
              balance={data.balance}
              currency={data.currency}
            />
          </Reveal>
        )}

        {/* Empty State */}
        {data.isEmpty ? (
          <Reveal>
            <ReportesEmptyState />
          </Reveal>
        ) : (
          <>
            {/* Desktop: side by side, Mobile: stacked */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <Reveal>
                <IncomeVsExpensesChart
                  data={data.incomeVsExpenses}
                  currency={data.currency}
                  period={data.period}
                  isMobile={false}
                />
              </Reveal>

              <Reveal>
                <ExpensesByCategoryChart
                  data={data.expensesByCategory}
                  currency={data.currency}
                  totalExpense={data.expense}
                />
              </Reveal>
            </div>
          </>
        )}
      </Stagger>
    </main>
  );
}
