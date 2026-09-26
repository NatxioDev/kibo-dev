"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
    <ConfirmDialog
      open={open}
      title={`¿Desactivar “${paymentMethodName}”?`}
      description="Tus transacciones existentes lo conservan, pero no podrás elegirlo al registrar nuevas. Puedes reactivarlo cuando quieras."
      confirmLabel="Desactivar"
      pendingLabel="Desactivando…"
      loading={loading}
      error={error}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
}
