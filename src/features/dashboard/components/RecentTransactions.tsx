import Link from "next/link";
import { formatCategoryLabel } from "@/features/categories/components/formatCategoryLabel";
import {
  formatTransactionAmount,
  formatTransactionDate,
} from "@/features/transactions/components/formatters";
import type { TransactionWithRelations } from "@/features/transactions/types";

type RecentTransactionsProps = {
  transactions: TransactionWithRelations[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Últimas transacciones
        </h2>
        <Link
          href="/transactions"
          className="text-sm font-medium text-zinc-500 dark:text-zinc-400 underline"
        >
          Ver todas →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No hay transacciones en este período.
        </p>
      ) : (
        <ul className="flex flex-col">
          {transactions.map((transaction) => {
            const merchant =
              transaction.merchant?.trim() ||
              formatCategoryLabel(transaction.category);
            const categoryLabel = formatCategoryLabel(transaction.category);
            const amountClass =
              transaction.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-zinc-900 dark:text-zinc-50";

            return (
              <li
                key={transaction.id}
                className="flex items-start justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 py-3 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatTransactionDate(transaction.date)}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {merchant}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {categoryLabel}
                  </p>
                </div>
                <p className={`shrink-0 text-sm font-semibold ${amountClass}`}>
                  {formatTransactionAmount(
                    transaction.amount,
                    transaction.currency,
                    transaction.type,
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
