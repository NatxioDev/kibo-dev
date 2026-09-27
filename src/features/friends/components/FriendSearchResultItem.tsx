"use client";

import { Button } from "@/components/ui/Button";
import {
  FriendRow,
  FriendRowBadge,
  friendName,
} from "@/features/friends/components/FriendRow";
import type { FriendSearchResult } from "@/features/friends/domain/models/Friendship";
import { useFriendshipActions } from "@/features/friends/hooks/useFriendshipActions";

type FriendSearchResultItemProps = {
  result: FriendSearchResult;
};

export function FriendSearchResultItem({ result }: FriendSearchResultItemProps) {
  const { send, accept, error, loading } = useFriendshipActions();
  const { profile, relation, friendshipId } = result;
  const name = friendName(profile);

  let trailing;
  if (relation === "none") {
    trailing = (
      <Button
        size="sm"
        disabled={loading}
        aria-label={`Agregar a ${name} como amigo`}
        onClick={() => send(profile.id)}
      >
        {loading ? "Enviando…" : "Agregar"}
      </Button>
    );
  } else if (relation === "incoming" && friendshipId) {
    trailing = (
      <Button
        size="sm"
        disabled={loading}
        aria-label={`Aceptar la solicitud de ${name}`}
        onClick={() => accept(friendshipId)}
      >
        {loading ? "Aceptando…" : "Aceptar"}
      </Button>
    );
  } else if (relation === "outgoing") {
    trailing = <FriendRowBadge>Solicitud enviada</FriendRowBadge>;
  } else {
    trailing = <FriendRowBadge>✓ Amigos</FriendRowBadge>;
  }

  return <FriendRow profile={profile} trailing={trailing} error={error} />;
}
