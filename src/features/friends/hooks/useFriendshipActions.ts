"use client";

import { useState, useTransition } from "react";
import { showToast } from "@/components/ui/Toast";
import { acceptFriendRequestAction } from "@/features/friends/actions/acceptFriendRequest.action";
import { removeFriendshipAction } from "@/features/friends/actions/removeFriendship.action";
import { sendFriendRequestAction } from "@/features/friends/actions/sendFriendRequest.action";
import type { ServiceResult } from "@/features/friends/domain/models/Friendship";

export type FriendshipAction = "send" | "accept" | "remove";

export function useFriendshipActions() {
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

      // No necesitamos router.refresh() porque revalidatePath en el server action
      // ya invalida el cache y Next.js recarga los datos del servidor automáticamente
      onSuccess?.();
    });
  }

  function send(addresseeId: string, onSuccess?: () => void) {
    run("send", () => sendFriendRequestAction(addresseeId), () => {
      showToast("Solicitud enviada");
      onSuccess?.();
    });
  }

  function accept(id: string, onSuccess?: () => void) {
    run("accept", () => acceptFriendRequestAction(id), () => {
      showToast("Solicitud aceptada");
      onSuccess?.();
    });
  }

  function remove(id: string, onSuccess?: () => void, successMessage = "Listo") {
    run("remove", () => removeFriendshipAction(id), () => {
      showToast(successMessage);
      onSuccess?.();
    });
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
