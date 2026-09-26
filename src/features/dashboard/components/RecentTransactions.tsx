import Link from "next/link";
import { Pressable } from "@/components/motion/Pressable";
import { Card } from "@/components/ui/Card";
import {
  type CategoryColorMap,
  categoryColorOf,
  categoryTint,
} from "@/features/categories/categoryColor";
import {
  formatTransactionAmount,
  formatTransactionDate,
  formatTransactionTime,
} from "@/features/transactions/components/formatters";
import type { TransactionWithRelations } from "@/features/transactions/types";

type RecentTransactionsProps = {
  transactions: TransactionWithRelations[];
  colors: CategoryColorMap;
};

export function RecentTransactions({
  transactions,
  colors,
}: RecentTransactionsProps) {
  return (
    <Card as="section" className="flex flex-col gap-3 px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-[-0.03em] text-foreground">
          Últimas transacciones
        </h2>
        <Link
          href="/transactions"
          className="text-sm font-medium text-primary hover:opacity-80"
        >
          Ver todas →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay transacciones en este período.
        </p>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === "INCOME";
            const categoryName = transaction.category?.name ?? "Sin categoría";
            const merchant = transaction.merchant?.trim() || categoryName;
            const categoryIcon =
              transaction.category?.icon?.trim() || (isIncome ? "💰" : "📦");
            const timeLabel = formatTransactionTime(transaction.created_at);
            const dateLabel = timeLabel
              ? `${formatTransactionDate(transaction.date)} · ${timeLabel}`
              : formatTransactionDate(transaction.date);

            return (
              <li key={transaction.id}>
                <Pressable>
                  <Link
                    href={`/transactions/${transaction.id}`}
                    className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-surface-muted"
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                      style={{
                        backgroundColor: categoryTint(
                          categoryColorOf(colors, transaction.category_id),
                        ),
                      }}
                    >
                      {categoryIcon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {merchant}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {categoryName} · {dateLabel}
                      </p>
                    </div>
                    <p
                      className={`shrink-0 font-display text-sm font-bold tabular-nums ${
                        isIncome ? "text-income" : "text-foreground"
                      }`}
                    >
                      {formatTransactionAmount(
                        transaction.amount,
                        transaction.currency,
                        transaction.type,
                      )}
                    </p>
                  </Link>
                </Pressable>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
