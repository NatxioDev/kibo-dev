"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { AcceptFriendRequest } from "@/features/friends/application/AcceptFriendRequest.application";
import { RemoveFriendship } from "@/features/friends/application/RemoveFriendship.application";
import { SendFriendRequest } from "@/features/friends/application/SendFriendRequest.application";
import type { ServiceResult } from "@/features/friends/domain/models/Friendship";

export type FriendshipAction = "send" | "accept" | "remove";

export function useFriendshipActions() {
  const router = useRouter();
  const { friendshipRepository } = useDependencyContext();
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<FriendshipAction | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(
    kind: FriendshipAction,
    action: () => Promise<ServiceResult<null>>,
    onSuccess?: () => void,
  ) {
    setError(null);
    setLastAction(kind);

    startTransition(async () => {
      const result = await action();

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSuccess?.();
      router.refresh();
    });
  }

  function send(addresseeId: string, onSuccess?: () => void) {
    run(
      "send",
      () => new SendFriendRequest(friendshipRepository).execute(addresseeId),
      onSuccess,
    );
  }

  function accept(id: string, onSuccess?: () => void) {
    run(
      "accept",
      () => new AcceptFriendRequest(friendshipRepository).execute(id),
      onSuccess,
    );
  }

  function remove(id: string, onSuccess?: () => void) {
    run(
      "remove",
      () => new RemoveFriendship(friendshipRepository).execute(id),
      onSuccess,
    );
  }

  return {
    send,
    accept,
    remove,
    error,
    loading: isPending,
    pendingAction: isPending ? lastAction : null,
    setError,
  };
}
