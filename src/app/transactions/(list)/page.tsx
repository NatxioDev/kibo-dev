import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
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
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/", label: "Inicio" }}
          title="Transacciones"
          actions={
            <Button href="/transactions/new" aria-label="Nueva transacción">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                aria-hidden
                className="h-4 w-4"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span aria-hidden className="hidden sm:inline">
                Registrar
              </span>
            </Button>
          }
        />
      </Reveal>

      <Reveal>
        <Suspense
          fallback={
            <div className="h-11 animate-pulse rounded-control bg-surface-muted" />
          }
        >
          <TransactionListFilters type={type} />
        </Suspense>
      </Reveal>

      {!result.success ? (
        <Reveal>
          <Alert>{result.error}</Alert>
        </Reveal>
      ) : (
        <TransactionList
          transactions={result.data}
          filtersActive={filtersActive}
        />
      )}
    </PageShell>
  );
}
