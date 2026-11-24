"use client";

import { Button } from "@/components/ui/Button";
import { FriendRow, friendName } from "@/features/friends/components/FriendRow";
import {
  balanceLines,
  balanceToneClass,
} from "@/features/splits/components/balanceLines";
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
        trailing={balance ? <FriendBalance balance={balance} /> : undefined}
      />
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
      trailing={
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

function FriendBalance({ balance }: { balance: PersonBalance }) {
  if (balance.pendingSettlement) {
    return (
      <span className="max-w-[10rem] truncate text-right text-sm font-semibold text-foreground">
        Pago por confirmar
      </span>
    );
  }

  const lines = balanceLines(balance.balances).join(" · ");
  if (!lines && !balance.hasHistory) return null;

  return (
    <span
      className={`max-w-[12rem] truncate text-right font-display text-[0.9375rem] font-bold tabular-nums ${balanceToneClass(balance.balances)}`}
    >
      {lines || "Están a mano"}
    </span>
  );
}
