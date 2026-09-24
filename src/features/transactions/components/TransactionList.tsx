import { TransactionListItem } from "@/features/transactions/components/TransactionListItem";
import type { TransactionWithRelations } from "@/features/transactions/types";
import { groupTransactionsByDate } from "@/features/transactions/utils/groupTransactionsByDate";

type TransactionListProps = {
  transactions: TransactionWithRelations[];
  filtersActive?: boolean;
};

export function TransactionList({
  transactions,
  filtersActive = false,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-10 text-center dark:border-zinc-700">
        {filtersActive ? (
          <>
            <p className="text-base text-zinc-600 dark:text-zinc-300">
              No hay resultados para estos filtros.
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Prueba con otro tipo.
            </p>
          </>
        ) : (
          <>
            <p className="text-base text-zinc-600 dark:text-zinc-300">
              Todavía no tienes transacciones.
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Registra tu primer gasto o ingreso.
            </p>
          </>
        )}
      </div>
    );
  }

  const groups = groupTransactionsByDate(transactions);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`tx-day-${group.key}`}>
          <h2
            id={`tx-day-${group.key}`}
            className="mb-1 px-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            {group.label}
          </h2>
          <div className="flex flex-col">
            {group.items.map((transaction) => (
              <TransactionListItem
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
