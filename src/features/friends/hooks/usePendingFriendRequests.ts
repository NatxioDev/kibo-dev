"use client";

import { useEffect, useState } from "react";
import { countFriendAlertsAction } from "@/features/splits/actions/split.action";
import type { FriendAlertCounts } from "@/features/splits/domain/models";

const EMPTY: FriendAlertCounts = { requests: 0, unclassified: 0, disputes: 0 };

/** Refetches whenever `refreshKey` changes and when the app returns to the foreground. */
export function useFriendAlerts(enabled: boolean, refreshKey: string): FriendAlertCounts {
  const [alerts, setAlerts] = useState<FriendAlertCounts>(EMPTY);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const load = () => {
      countFriendAlertsAction().then((result) => {
        if (!cancelled && result.success) setAlerts(result.data);
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

  return enabled ? alerts : EMPTY;
}
