"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToggleAccountActiveWithAction } from "@/features/accounts/hooks/useToggleAccountActiveWithAction";

type DeactivateAccountDialogProps = {
  open: boolean;
  onClose: () => void;
  accountId: string;
  accountName: string;
};

export function DeactivateAccountDialog({
  open,
  onClose,
  accountId,
  accountName,
}: DeactivateAccountDialogProps) {
  const { toggle, error, loading, setError } = useToggleAccountActiveWithAction();

  function handleClose() {
    if (loading) return;
    setError(null);
    onClose();
  }

  function handleConfirm() {
    toggle(accountId, false, () => {
      setError(null);
      onClose();
    });
  }

  return (
    <ConfirmDialog
      open={open}
      title={`¿Desactivar “${accountName}”?`}
      description="Tus transacciones existentes la conservan, pero no podrás elegirla al registrar nuevas. Puedes reactivarla cuando quieras."
      confirmLabel="Desactivar"
      pendingLabel="Desactivando…"
      loading={loading}
      error={error}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
}
