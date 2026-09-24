"use client";

import { useDeleteTransaction } from "@/features/transactions/hooks/useDeleteTransaction";

type DeleteTransactionDialogProps = {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  onDeleted?: () => void;
};

export function DeleteTransactionDialog({
  open,
  onClose,
  transactionId,
  onDeleted,
}: DeleteTransactionDialogProps) {
  const { remove, error, loading, setError } = useDeleteTransaction();

  if (!open) return null;

  function handleClose() {
    if (loading) return;
    setError(null);
    onClose();
  }

  function handleConfirm() {
    remove(transactionId, () => {
      setError(null);
      onClose();
      onDeleted?.();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 dark:bg-black/70 px-4 py-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-transaction-title"
    >
      <div className="w-full max-w-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-5 shadow-xl">
        <h2
          id="delete-transaction-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          ¿Eliminar esta transacción?
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Esta acción no se puede deshacer.
        </p>

        {error ? (
          <p className="mt-3 text-sm text-expense" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="h-12 w-full rounded-lg bg-expense-solid text-base font-medium text-white disabled:opacity-60"
          >
            {loading ? "Eliminando…" : "Eliminar"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="h-12 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-base font-medium text-zinc-800 dark:text-zinc-100 disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
