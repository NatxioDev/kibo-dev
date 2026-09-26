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

  const isIncome = transaction.type === "INCOME";
  const categoryIcon =
    transaction.category?.icon?.trim() || (isIncome ? "💰" : "📦");
  const categoryName = transaction.category?.name ?? "Sin categoría";
  const title = transaction.merchant?.trim() || categoryName;
  const paymentLabel = transaction.payment_method?.name ?? "Sin método";

  return (
    <li className="flex items-center gap-1 pr-2">
      <Link
        href={`/transactions/${transaction.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-3 pl-4 transition-colors hover:bg-surface-muted"
      >
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-lg"
        >
          {categoryIcon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.9375rem] font-semibold text-foreground">
            {title}
          </span>
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            {title === categoryName ? paymentLabel : `${categoryName} · ${paymentLabel}`}
          </span>
        </span>
        <span
          className={`shrink-0 font-display text-[0.9375rem] font-bold tabular-nums ${
            isIncome ? "text-income" : "text-foreground"
          }`}
        >
          {formatTransactionAmount(
            transaction.amount,
            transaction.currency,
            transaction.type,
          )}
        </span>
      </Link>

      <TransactionItemMenu
        label={title}
        editHref={`/transactions/${transaction.id}/edit`}
        onDelete={() => setDeleteOpen(true)}
      />

      <DeleteTransactionDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        transactionId={transaction.id}
      />
    </li>
  );
}
