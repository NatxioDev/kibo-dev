import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListTransactions } from "@/features/transactions/application/ListTransactions.application";
import { TransactionList } from "@/features/transactions/components/TransactionList";
import { TransactionListFilters } from "@/features/transactions/components/TransactionListFilters";
import { parseTransactionTypeFilter } from "@/features/transactions/utils/listFilters";

type TransactionsPageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const type = parseTransactionTypeFilter(params.type);
  const filtersActive = type !== "all";
  const { transactionRepository } = await createServerDependencies();
  const result = await new ListTransactions(transactionRepository).execute({
    type,
  });

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          breadcrumbs={[{ href: "/", label: "Inicio" }]}
          fallbackHref="/"
          title="Transacciones"
          actions={
            <Link
              href="/transactions/new"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span className="hidden md:inline">Nueva transacción</span>
            </Link>
          }
        />

        <Suspense
          fallback={
            <div className="h-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          }
        >
          <TransactionListFilters type={type} />
        </Suspense>

        {!result.success ? (
          <p className="rounded-lg border border-expense-border bg-expense-soft px-4 py-3 text-sm text-expense">
            {result.error}
          </p>
        ) : (
          <TransactionList
            transactions={result.data}
            filtersActive={filtersActive}
          />
        )}
      </div>
    </main>
  );
}
