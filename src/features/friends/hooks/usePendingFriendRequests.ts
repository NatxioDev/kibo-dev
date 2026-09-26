"use client";

import { useEffect, useState } from "react";
import { countPendingFriendRequestsAction } from "@/features/friends/actions/countPendingFriendRequests.action";

/** Refetches whenever `refreshKey` changes (e.g. the pathname) and when the app returns to the foreground. */
export function usePendingFriendRequests(enabled: boolean, refreshKey: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const load = () => {
      // Llamar al server action en lugar del repositorio del cliente
      countPendingFriendRequestsAction().then((result) => {
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
  }, [enabled, refreshKey]);

  return enabled ? count : 0;
}
