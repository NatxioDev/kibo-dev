import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListAccounts } from "@/features/accounts/application/ListAccounts.application";
import { ListCategories } from "@/features/categories/application/ListCategories.application";
import { ListTransactions } from "@/features/transactions/application/ListTransactions.application";
import { TransactionList } from "@/features/transactions/components/TransactionList";
import { TransactionListFilters } from "@/features/transactions/components/TransactionListFilters";
import {
  isTransactionListFiltered,
  parseTransactionListFilterState,
  toListTransactionsFilters,
} from "@/features/transactions/utils/listFilters";

type TransactionsPageProps = {
  searchParams: Promise<{
    type?: string;
    account?: string;
    category?: string;
    period?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const filterState = parseTransactionListFilterState(params);
  const listFilters = toListTransactionsFilters(filterState);
  const filtersActive = isTransactionListFiltered(filterState);
  const { transactionRepository, accountRepository, categoryRepository } =
    await createServerDependencies();
  const [result, accountsResult, categoriesResult] = await Promise.all([
    new ListTransactions(transactionRepository).execute(listFilters),
    new ListAccounts(accountRepository).execute(),
    new ListCategories(categoryRepository).execute(),
  ]);
  const accounts = accountsResult.success ? accountsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

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

      <TransactionListFilters
        filters={filterState}
        accounts={accounts}
        categories={categories}
        resultCount={result.success ? result.data.length : null}
      >
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
      </TransactionListFilters>
    </PageShell>
  );
}
