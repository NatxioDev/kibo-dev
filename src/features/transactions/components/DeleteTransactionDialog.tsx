"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDeleteTransactionWithAction } from "@/features/transactions/hooks/useDeleteTransactionWithAction";

type DeleteTransactionDialogProps = {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  description?: string;
  onDeleted?: () => void;
};

export function DeleteTransactionDialog({
  open,
  onClose,
  transactionId,
  description = "Se borrará de tu historial y de los totales. Esta acción no se puede deshacer.",
  onDeleted,
}: DeleteTransactionDialogProps) {
  const { remove, error, loading, setError } = useDeleteTransactionWithAction();

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
      description={description}
      confirmLabel="Eliminar"
      pendingLabel="Eliminando…"
      loading={loading}
      error={error}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
}
