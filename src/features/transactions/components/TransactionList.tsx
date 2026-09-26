import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
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
      <Reveal>
        {filtersActive ? (
          <EmptyState
            icon="🔎"
            title="Sin resultados"
            description="No hay transacciones de este tipo. Prueba con otro filtro."
            action={
              <Button href="/transactions" variant="secondary" size="sm">
                Ver todas
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon="🧾"
            title="Todavía no hay movimientos"
            description="Registra tu primer gasto o ingreso y aparecerá aquí."
            action={<Button href="/transactions/new">+ Registrar</Button>}
          />
        )}
      </Reveal>
    );
  }

  const groups = groupTransactionsByDate(transactions);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <Reveal
          as="section"
          key={group.key}
          className="flex flex-col gap-2"
        >
          <h2
            id={`tx-day-${group.key}`}
            className="px-4 text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase"
          >
            {group.label}
          </h2>
          <ul
            aria-labelledby={`tx-day-${group.key}`}
            className="glass flex flex-col divide-y divide-track rounded-card border border-border bg-surface py-1 shadow-card"
          >
            {group.items.map((transaction) => (
              <TransactionListItem
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
