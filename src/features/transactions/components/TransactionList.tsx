import { TransactionListItem } from "@/features/transactions/components/TransactionListItem";
import type { TransactionWithRelations } from "@/features/transactions/types";

type TransactionListProps = {
  transactions: TransactionWithRelations[];
};

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 px-4 py-10 text-center">
        <p className="text-base text-zinc-300">
          Todavía no tienes transacciones.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Registra tu primer gasto o ingreso.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {transactions.map((transaction) => (
        <TransactionListItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}
