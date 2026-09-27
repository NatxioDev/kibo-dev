"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useFriendshipActions } from "@/features/friends/hooks/useFriendshipActions";

type RemoveFriendDialogProps = {
  open: boolean;
  onClose: () => void;
  friendshipId: string;
  friendName: string;
};

export function RemoveFriendDialog({
  open,
  onClose,
  friendshipId,
  friendName,
}: RemoveFriendDialogProps) {
  const { remove, error, loading, setError } = useFriendshipActions();

  function handleClose() {
    if (loading) return;
    setError(null);
    onClose();
  }

  function handleConfirm() {
    remove(friendshipId, () => {
      setError(null);
      onClose();
    });
  }

  return (
    <ConfirmDialog
      open={open}
      title={`¿Eliminar a “${friendName}”?`}
      description="Dejarán de ser amigos para ambos. Puedes volver a enviarle una solicitud cuando quieras."
      confirmLabel="Eliminar"
      pendingLabel="Eliminando…"
      loading={loading}
      error={error}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
}
