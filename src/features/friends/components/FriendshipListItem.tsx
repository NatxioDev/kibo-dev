"use client";

import { Button } from "@/components/ui/Button";
import { FriendRow, friendName } from "@/features/friends/components/FriendRow";
import { balanceLines } from "@/features/splits/components/balanceLines";
import type { PersonBalance } from "@/features/splits/domain/models";
import type { Friendship } from "@/features/friends/domain/models/Friendship";
import { useFriendshipActions } from "@/features/friends/hooks/useFriendshipActions";

type FriendshipListItemProps = {
  friendship: Friendship;
  balance?: PersonBalance;
};

export function FriendshipListItem({ friendship, balance }: FriendshipListItemProps) {
  const { accept, remove, error, loading, pendingAction } = useFriendshipActions();
  const { id, status, direction, friend } = friendship;
  const name = friendName(friend);

  if (status === "accepted") {
    return (
      <FriendRow
        profile={friend}
        href={`/friends/${friend.id}`}
        subtitle={
          balance?.pendingSettlement
            ? "Pago por confirmar"
            : balance
              ? balanceLines(balance.balances).join(" · ") || (balance.hasHistory ? "Están a mano" : undefined)
              : undefined
        }
      />
    );
  }

  if (direction === "incoming") {
    return (
      <FriendRow
        profile={friend}
        error={error}
        actions={
          <>
            <Button
              variant="secondary"
              disabled={loading}
              aria-label={`Rechazar la solicitud de ${name}`}
              onClick={() => remove(id, undefined, "Solicitud rechazada")}
            >
              {pendingAction === "remove" ? "Rechazando…" : "Rechazar"}
            </Button>
            <Button
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
      actions={
        <Button
          variant="secondary"
          disabled={loading}
          aria-label={`Cancelar la solicitud enviada a ${name}`}
          onClick={() => remove(id, undefined, "Solicitud cancelada")}
        >
          {loading ? "Cancelando…" : "Cancelar"}
        </Button>
      }
    />
  );
}
