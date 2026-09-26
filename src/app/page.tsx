import { Suspense } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListCategories } from "@/features/categories/application/ListCategories.application";
import { categoryColors } from "@/features/categories/categoryColor";
import {
  GetDashboardData,
  parseDashboardCurrency,
} from "@/features/dashboard/application/GetDashboardData.application";
import { DashboardEmptyState } from "@/features/dashboard/components/DashboardEmptyState";
import { DashboardErrorState } from "@/features/dashboard/components/DashboardErrorState";
import { DashboardFilters } from "@/features/dashboard/components/DashboardFilters";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardSummary } from "@/features/dashboard/components/DashboardSummary";
import { ExpensesByCategory } from "@/features/dashboard/components/ExpensesByCategory";
import { RecentTransactions } from "@/features/dashboard/components/RecentTransactions";
import { parseDashboardPeriod } from "@/features/dashboard/utils/period";
import { GetCurrentProfile } from "@/features/profile/application/GetCurrentProfile.application";

type HomePageProps = {
  searchParams: Promise<{ period?: string; currency?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const period = parseDashboardPeriod(params.period);
  const currency = parseDashboardCurrency(params.currency);
  const { dashboardRepository, profileRepository, categoryRepository } =
    await createServerDependencies();
  const [result, profileResult, categoriesResult] = await Promise.all([
    new GetDashboardData(dashboardRepository).execute({ period, currency }),
    new GetCurrentProfile(profileRepository).execute(),
    new ListCategories(categoryRepository).execute(),
  ]);
  const displayName = profileResult.success
    ? profileResult.data.display_name
    : null;
  const colors = categoryColors(
    categoriesResult.success ? categoriesResult.data : [],
  );

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 pt-10 pb-16">
      <Stagger className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <Reveal
          as="header"
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <DashboardHeader displayName={displayName} />
          <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
            <Button href="/transactions/new">+ Registrar</Button>
            <Button href="/transactions" variant="secondary">
              Transacciones
            </Button>
          </div>
        </Reveal>

        <Reveal>
          <Suspense
            fallback={
              <div className="h-11 animate-pulse rounded-control bg-surface-muted" />
            }
          >
            <DashboardFilters period={period} currency={currency} />
          </Suspense>
        </Reveal>

        {!result.success ? (
          <Reveal>
            <DashboardErrorState />
          </Reveal>
        ) : (
          <>
            <DashboardSummary
              income={result.data.income}
              expense={result.data.expense}
              balance={result.data.balance}
              currency={result.data.currency}
              periodLabel={result.data.periodLabel}
            />

            {result.data.isEmpty ? (
              <Reveal>
                <DashboardEmptyState />
              </Reveal>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Reveal>
                  <ExpensesByCategory
                    items={result.data.expensesByCategory}
                    currency={result.data.currency}
                    colors={colors}
                  />
                </Reveal>
                <Reveal>
                  <RecentTransactions
                    transactions={result.data.recent}
                    colors={colors}
                  />
                </Reveal>
              </div>
            )}
          </>
        )}
      </Stagger>
    </main>
  );
}
