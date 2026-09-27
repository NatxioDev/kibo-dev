"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type DeletePasskeyDialogProps = {
  open: boolean;
  passkeyName: string;
  loading: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeletePasskeyDialog({
  open,
  passkeyName,
  loading,
  error,
  onConfirm,
  onClose,
}: DeletePasskeyDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={`¿Eliminar “${passkeyName}”?`}
      description="Ya no podrás iniciar sesión con esta Passkey. Puedes seguir entrando con Google u otra Passkey registrada."
      confirmLabel="Eliminar"
      pendingLabel="Eliminando…"
      loading={loading}
      error={error}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
