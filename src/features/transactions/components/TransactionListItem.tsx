"use client";

import Link from "next/link";
import { useState } from "react";
import { DeleteTransactionDialog } from "@/features/transactions/components/DeleteTransactionDialog";
import { formatTransactionAmount } from "@/features/transactions/components/formatters";
import { TransactionItemMenu } from "@/features/transactions/components/TransactionItemMenu";
import type { TransactionWithRelations } from "@/features/transactions/types";

type TransactionListItemProps = {
  transaction: TransactionWithRelations;
};

export function TransactionListItem({ transaction }: TransactionListItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const categoryIcon = transaction.category?.icon?.trim() || "📦";
  const title =
    transaction.merchant?.trim() ||
    transaction.category?.name ||
    "Sin comercio";
  const categoryName = transaction.category?.name ?? "Sin categoría";
  const paymentLabel = transaction.payment_method?.name ?? "Sin método";
  const amountClass =
    transaction.type === "INCOME"
      ? "text-income"
      : "text-zinc-900 dark:text-zinc-50";
  const editHref = `/transactions/${transaction.id}/edit`;
  const detailHref = `/transactions/${transaction.id}`;

  return (
    <>
      <article className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-stretch gap-1">
          <Link
            href={detailHref}
            className="flex min-w-0 flex-1 items-center gap-3 py-3.5 pr-1"
            aria-label={`Ver detalle de ${title}`}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg dark:bg-zinc-800"
              aria-hidden
            >
              {categoryIcon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium text-zinc-900 dark:text-zinc-50">
                {title}
              </p>
              <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                {categoryName} · {paymentLabel}
              </p>
            </div>
            <p
              className={`shrink-0 text-base font-semibold tabular-nums ${amountClass}`}
            >
              {formatTransactionAmount(
                transaction.amount,
                transaction.currency,
                transaction.type,
              )}
            </p>
          </Link>

          <div className="flex items-center py-3.5 pl-1">
            <TransactionItemMenu
              editHref={editHref}
              onDelete={() => setDeleteOpen(true)}
            />
          </div>
        </div>
      </article>

      <DeleteTransactionDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        transactionId={transaction.id}
      />
    </>
  );
}
