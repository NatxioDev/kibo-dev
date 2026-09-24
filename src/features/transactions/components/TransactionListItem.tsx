"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCategoryLabel } from "@/features/categories/components/formatCategoryLabel";
import { DeleteTransactionDialog } from "@/features/transactions/components/DeleteTransactionDialog";
import {
  formatTransactionAmount,
  formatTransactionDate,
} from "@/features/transactions/components/formatters";
import type { TransactionWithRelations } from "@/features/transactions/types";

type TransactionListItemProps = {
  transaction: TransactionWithRelations;
};

export function TransactionListItem({ transaction }: TransactionListItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const merchantLabel = transaction.merchant?.trim() || "Sin comercio";
  const categoryLabel = formatCategoryLabel(transaction.category);
  const paymentLabel = transaction.payment_method?.name ?? "Sin método";
  const amountClass =
    transaction.type === "INCOME" ? "text-green-400" : "text-zinc-50";

  return (
    <>
      <article className="flex flex-col gap-3 border-b border-zinc-800 py-4 last:border-b-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-zinc-500">
              {formatTransactionDate(transaction.date)}
            </p>
            <h2 className="mt-1 truncate text-base font-medium text-zinc-50">
              {merchantLabel}
            </h2>
            <p className="mt-1 truncate text-sm text-zinc-400">
              {categoryLabel} · {paymentLabel}
            </p>
          </div>
          <p className={`shrink-0 text-base font-semibold ${amountClass}`}>
            {formatTransactionAmount(
              transaction.amount,
              transaction.currency,
              transaction.type,
            )}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/transactions/${transaction.id}/edit`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-sm font-medium text-zinc-100"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-sm font-medium text-red-400"
          >
            Eliminar
          </button>
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
