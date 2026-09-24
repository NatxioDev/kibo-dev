"use client";

import Link from "next/link";
import { useState } from "react";
import { DeactivatePaymentMethodDialog } from "@/features/payment-methods/components/DeactivatePaymentMethodDialog";
import { useTogglePaymentMethodActive } from "@/features/payment-methods/hooks/useTogglePaymentMethodActive";
import type { PaymentMethod } from "@/features/transactions/types";

type PaymentMethodListItemProps = {
  paymentMethod: PaymentMethod;
};

export function PaymentMethodListItem({
  paymentMethod,
}: PaymentMethodListItemProps) {
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const { toggle, error, loading } = useTogglePaymentMethodActive();

  const inactiveClass = paymentMethod.is_active ? "" : "opacity-50";

  return (
    <>
      <article
        className={`flex flex-col gap-3 border-b border-zinc-800 py-4 last:border-b-0 ${inactiveClass}`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-zinc-50">
            {paymentMethod.name}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {paymentMethod.is_active ? "Activo" : "Inactivo"}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/settings/payment-methods/${paymentMethod.id}/edit`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-sm font-medium text-zinc-100"
          >
            Editar
          </Link>
          {paymentMethod.is_active ? (
            <button
              type="button"
              onClick={() => setDeactivateOpen(true)}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-sm font-medium text-red-400"
            >
              Desactivar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggle(paymentMethod.id, true)}
              disabled={loading}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-sm font-medium text-zinc-100 disabled:opacity-60"
            >
              {loading ? "Activando…" : "Activar"}
            </button>
          )}
        </div>

        {error && !deactivateOpen ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </article>

      <DeactivatePaymentMethodDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        paymentMethodId={paymentMethod.id}
        paymentMethodName={paymentMethod.name}
      />
    </>
  );
}
