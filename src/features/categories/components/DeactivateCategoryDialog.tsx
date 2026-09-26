"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToggleCategoryActive } from "@/features/categories/hooks/useToggleCategoryActive";

type DeactivateCategoryDialogProps = {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
};

export function DeactivateCategoryDialog({
  open,
  onClose,
  categoryId,
  categoryName,
}: DeactivateCategoryDialogProps) {
  const { toggle, error, loading, setError } = useToggleCategoryActive();

  function handleClose() {
    if (loading) return;
    setError(null);
    onClose();
  }

  function handleConfirm() {
    toggle(categoryId, false, () => {
      setError(null);
      onClose();
    });
  }

  return (
    <ConfirmDialog
      open={open}
      title={`¿Desactivar “${categoryName}”?`}
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
