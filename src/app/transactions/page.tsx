import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { TransactionList } from "@/features/transactions/components/TransactionList";
import { listTransactions } from "@/features/transactions/services/transactions.server";

export default async function TransactionsPage() {
  const result = await listTransactions();

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <Link href="/" className="text-sm text-zinc-500 dark:text-zinc-400 underline">
              Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Transacciones
            </h1>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <Link
              href="/transactions/new"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              + Nueva transacción
            </Link>
          </div>
        </header>

        {!result.success ? (
          <p className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {result.error}
          </p>
        ) : (
          <TransactionList transactions={result.data} />
        )}

        <LogoutButton />
      </div>
    </main>
  );
}
