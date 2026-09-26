"use client";

import { useEffect, useState } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { CountPendingFriendRequests } from "@/features/friends/application/CountPendingFriendRequests.application";

/** Refetches whenever `refreshKey` changes (e.g. the pathname) and when the app returns to the foreground. */
export function usePendingFriendRequests(enabled: boolean, refreshKey: string) {
  const { friendshipRepository } = useDependencyContext();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const load = () => {
      new CountPendingFriendRequests(friendshipRepository)
        .execute()
        .then((result) => {
          if (!cancelled && result.success) {
            setCount(result.data);
          }
        });
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") load();
    };

    load();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, refreshKey, friendshipRepository]);

  return enabled ? count : 0;
}
