"use client";

import { useEffect, useState } from "react";
import { countFriendAlertsAction } from "@/features/splits/actions/split.action";
import type { FriendAlertCounts } from "@/features/splits/domain/models";

const EMPTY: FriendAlertCounts = { requests: 0, unclassified: 0, disputes: 0 };

/**
 * Hook del cliente que cuenta solicitudes de amistad, gastos por clasificar y deudas en revisión.
 * Se mantiene en el cliente porque:
 * - Se actualiza automáticamente cuando cambia la ruta (refreshKey)
 * - Se actualiza cuando la app vuelve al foreground (visibilitychange event)
 * - Proporciona feedback reactivo sin recargar la página
 */
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
