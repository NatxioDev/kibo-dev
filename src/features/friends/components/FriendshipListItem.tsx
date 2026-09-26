"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FriendRow, friendName } from "@/features/friends/components/FriendRow";
import { RemoveFriendDialog } from "@/features/friends/components/RemoveFriendDialog";
import type { Friendship } from "@/features/friends/domain/models/Friendship";
import { useFriendshipActions } from "@/features/friends/hooks/useFriendshipActions";

type FriendshipListItemProps = {
  friendship: Friendship;
};

export function FriendshipListItem({ friendship }: FriendshipListItemProps) {
  const [removeOpen, setRemoveOpen] = useState(false);
  const { accept, remove, error, loading, pendingAction } = useFriendshipActions();
  const { id, status, direction, friend } = friendship;
  const name = friendName(friend);

  if (status === "accepted") {
    return (
      <>
        <FriendRow
          profile={friend}
          trailing={
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Eliminar a ${name} de tus amigos`}
              onClick={() => setRemoveOpen(true)}
            >
              Eliminar
            </Button>
          }
        />
        <RemoveFriendDialog
          open={removeOpen}
          onClose={() => setRemoveOpen(false)}
          friendshipId={id}
          friendName={name}
        />
      </>
    );
  }

  if (direction === "incoming") {
    return (
      <FriendRow
        profile={friend}
        error={error}
        trailing={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              aria-label={`Rechazar la solicitud de ${name}`}
              onClick={() => remove(id)}
            >
              {pendingAction === "remove" ? "Rechazando…" : "Rechazar"}
            </Button>
            <Button
              size="sm"
              disabled={loading}
              aria-label={`Aceptar la solicitud de ${name}`}
              onClick={() => accept(id)}
            >
              {pendingAction === "accept" ? "Aceptando…" : "Aceptar"}
            </Button>
          </>
        }
      />
    );
  }

  return (
    <FriendRow
      profile={friend}
      error={error}
      trailing={
        <Button
          variant="secondary"
          size="sm"
          disabled={loading}
          aria-label={`Cancelar la solicitud enviada a ${name}`}
          onClick={() => remove(id)}
        >
          {loading ? "Cancelando…" : "Cancelar"}
        </Button>
      }
    />
  );
}
