import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { TransactionList } from "@/features/transactions/components/TransactionList";
import { listTransactions } from "@/features/transactions/services/transactions.server";

export default async function HomePage() {
  const result = await listTransactions();

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
              Kibo
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Transacciones</p>
          </div>
          <Link
            href="/transactions/new"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-900"
          >
            + Nueva transacción
          </Link>
        </header>

        {!result.success ? (
          <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
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
