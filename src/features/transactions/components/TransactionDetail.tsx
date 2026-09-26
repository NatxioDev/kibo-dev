"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
    <div className="flex items-baseline justify-between gap-4 px-5 py-3.5">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-[0.9375rem] font-semibold break-words text-foreground">
        {value}
      </dd>
    </div>
  );
}

export function TransactionDetail({ transaction }: TransactionDetailProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isIncome = transaction.type === "INCOME";
  const categoryLabel = formatCategoryLabel(transaction.category);
  const paymentLabel = transaction.payment_method?.name ?? "Sin método";
  const description = transaction.description?.trim();
  const merchant = transaction.merchant?.trim() || "—";

  return (
    <>
      <Reveal>
        <Card
          variant="hero"
          className="flex flex-col items-center gap-3 px-6 py-8 text-center"
        >
          <span
            aria-hidden
            className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-3xl"
          >
            {transaction.category?.icon?.trim() || (isIncome ? "💰" : "📦")}
          </span>
          <p
            className={`font-display text-5xl font-extrabold tracking-[-0.045em] tabular-nums ${
              isIncome ? "text-income" : ""
            }`}
          >
            {formatTransactionAmount(
              transaction.amount,
              transaction.currency,
              transaction.type,
            )}
          </p>
          <p className="text-sm text-hero-muted first-letter:uppercase">
            {formatTransactionDateTime(transaction.date, transaction.created_at)}
          </p>
        </Card>
      </Reveal>

      <Reveal>
        <Card as="dl" className="flex flex-col divide-y divide-track py-1">
          <DetailRow label="Tipo" value={isIncome ? "Ingreso" : "Gasto"} />
          <DetailRow label="Categoría" value={categoryLabel} />
          <DetailRow label="Método de pago" value={paymentLabel} />
          <DetailRow label="Comercio" value={merchant} />
          <DetailRow label="Moneda" value={transaction.currency} />
        </Card>
      </Reveal>

      {description ? (
        <Reveal>
          <Card className="flex flex-col gap-1.5 px-5 py-4">
            <h2 className="text-sm text-muted-foreground">Nota</h2>
            <p className="text-[0.9375rem] text-pretty break-words whitespace-pre-line text-foreground">
              {description}
            </p>
          </Card>
        </Reveal>
      ) : null}

      <Reveal className="grid grid-cols-2 gap-3">
        <Button
          href={`/transactions/${transaction.id}/edit`}
          size="lg"
        >
          Editar
        </Button>
        <Button
          variant="destructive"
          size="lg"
          onClick={() => setDeleteOpen(true)}
        >
          Eliminar…
        </Button>
      </Reveal>

      <DeleteTransactionDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        transactionId={transaction.id}
        onDeleted={() => router.push("/transactions")}
      />
    </>
  );
}
