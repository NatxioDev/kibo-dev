"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
    <ConfirmDialog
      open={open}
      title="¿Eliminar esta transacción?"
      description="Se borrará de tu historial y de los totales. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      pendingLabel="Eliminando…"
      loading={loading}
      error={error}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
}
