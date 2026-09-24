"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCategoryLabel } from "@/features/categories/components/formatCategoryLabel";
import { DeleteTransactionDialog } from "@/features/transactions/components/DeleteTransactionDialog";
import {
  formatTransactionAmount,
  formatTransactionDateTime,
} from "@/features/transactions/components/formatters";
import type { TransactionWithRelations } from "@/features/transactions/types";

type TransactionDetailProps = {
  transaction: TransactionWithRelations;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-zinc-200 py-3.5 last:border-b-0 dark:border-zinc-800">
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="text-base text-zinc-900 dark:text-zinc-50">{value}</dd>
    </div>
  );
}

export function TransactionDetail({ transaction }: TransactionDetailProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const title =
    transaction.merchant?.trim() ||
    transaction.category?.name ||
    "Sin comercio";
  const typeLabel = transaction.type === "INCOME" ? "Ingreso" : "Gasto";
  const amountClass =
    transaction.type === "INCOME"
      ? "text-income"
      : "text-zinc-900 dark:text-zinc-50";
  const categoryLabel = formatCategoryLabel(transaction.category);
  const paymentLabel = transaction.payment_method?.name ?? "Sin método";
  const description = transaction.description?.trim() || "—";
  const merchant = transaction.merchant?.trim() || "—";

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-2xl dark:bg-zinc-800"
            aria-hidden
          >
            {transaction.category?.icon?.trim() || "📦"}
          </span>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {typeLabel}
          </p>
          <p className={`text-3xl font-semibold tabular-nums ${amountClass}`}>
            {formatTransactionAmount(
              transaction.amount,
              transaction.currency,
              transaction.type,
            )}
          </p>
          <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            {title}
          </p>
        </div>

        <dl className="flex flex-col">
          <DetailRow
            label="Fecha"
            value={formatTransactionDateTime(
              transaction.date,
              transaction.created_at,
            )}
          />
          <DetailRow label="Categoría" value={categoryLabel} />
          <DetailRow label="Método de pago" value={paymentLabel} />
          <DetailRow label="Comercio" value={merchant} />
          <DetailRow label="Descripción" value={description} />
          <DetailRow label="Moneda" value={transaction.currency} />
        </dl>

        <div className="flex flex-col gap-3">
          <Link
            href={`/transactions/${transaction.id}/edit`}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-zinc-900 text-base font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white text-base font-medium text-expense dark:border-zinc-700 dark:bg-zinc-900"
          >
            Eliminar
          </button>
        </div>
      </div>

      <DeleteTransactionDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        transactionId={transaction.id}
        onDeleted={() => router.push("/transactions")}
      />
    </>
  );
}
