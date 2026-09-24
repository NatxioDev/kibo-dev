import Link from "next/link";
import { Suspense } from "react";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { DashboardEmptyState } from "@/features/dashboard/components/DashboardEmptyState";
import { DashboardErrorState } from "@/features/dashboard/components/DashboardErrorState";
import { DashboardFilters } from "@/features/dashboard/components/DashboardFilters";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardSummary } from "@/features/dashboard/components/DashboardSummary";
import { ExpensesByCategory } from "@/features/dashboard/components/ExpensesByCategory";
import { RecentTransactions } from "@/features/dashboard/components/RecentTransactions";
import {
  getDashboardData,
  parseDashboardCurrency,
} from "@/features/dashboard/services/dashboard.server";
import { parseDashboardPeriod } from "@/features/dashboard/utils/period";

type HomePageProps = {
  searchParams: Promise<{ period?: string; currency?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const period = parseDashboardPeriod(params.period);
  const currency = parseDashboardCurrency(params.currency);
  const result = await getDashboardData({ period, currency });

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <DashboardHeader
            periodLabel={
              result.success ? result.data.periodLabel : "Tu resumen"
            }
          />
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/transactions/new"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-900"
            >
              + Registrar transacción
            </Link>
            <Link
              href="/transactions"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-100"
            >
              Transacciones
            </Link>
            <Link
              href="/settings"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-100"
            >
              Configuración
            </Link>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-3">
              <div className="h-11 animate-pulse rounded-lg bg-zinc-800" />
              <div className="h-11 animate-pulse rounded-lg bg-zinc-800" />
            </div>
          }
        >
          <DashboardFilters period={period} currency={currency} />
        </Suspense>

        {!result.success ? (
          <DashboardErrorState />
        ) : (
          <>
            <DashboardSummary
              income={result.data.income}
              expense={result.data.expense}
              balance={result.data.balance}
              currency={result.data.currency}
            />

            {result.data.isEmpty ? (
              <DashboardEmptyState />
            ) : (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <ExpensesByCategory
                  items={result.data.expensesByCategory}
                  currency={result.data.currency}
                />
                <RecentTransactions transactions={result.data.recent} />
              </div>
            )}
          </>
        )}

        <LogoutButton />
      </div>
    </main>
  );
}
