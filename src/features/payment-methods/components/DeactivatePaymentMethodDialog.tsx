"use client";

import { useTogglePaymentMethodActive } from "@/features/payment-methods/hooks/useTogglePaymentMethodActive";

type DeactivatePaymentMethodDialogProps = {
  open: boolean;
  onClose: () => void;
  paymentMethodId: string;
  paymentMethodName: string;
};

export function DeactivatePaymentMethodDialog({
  open,
  onClose,
  paymentMethodId,
  paymentMethodName,
}: DeactivatePaymentMethodDialogProps) {
  const { toggle, error, loading, setError } = useTogglePaymentMethodActive();

  if (!open) return null;

  function handleClose() {
    if (loading) return;
    setError(null);
    onClose();
  }

  function handleConfirm() {
    toggle(paymentMethodId, false, () => {
      setError(null);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 py-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-payment-method-title"
    >
      <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-950 p-5 shadow-xl">
        <h2
          id="deactivate-payment-method-title"
          className="text-lg font-semibold text-zinc-50"
        >
          ¿Desactivar &quot;{paymentMethodName}&quot;?
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Las transacciones existentes conservarán este método de pago, pero no
          podrás seleccionarlo en nuevas transacciones.
        </p>

        {error ? (
          <p className="mt-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="h-12 w-full rounded-lg bg-red-500 text-base font-medium text-white disabled:opacity-60"
          >
            {loading ? "Desactivando…" : "Desactivar"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="h-12 w-full rounded-lg border border-zinc-700 bg-zinc-900 text-base font-medium text-zinc-100 disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
