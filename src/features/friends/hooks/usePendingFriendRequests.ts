"use client";

import { useEffect, useState } from "react";
import { countPendingFriendRequestsAction } from "@/features/friends/actions/countPendingFriendRequests.action";

/**
 * Hook del cliente que cuenta las solicitudes de amistad pendientes.
 * Se mantiene en el cliente porque:
 * - Se actualiza automáticamente cuando cambia la ruta (refreshKey)
 * - Se actualiza cuando la app vuelve al foreground (visibilitychange event)
 * - Proporciona feedback reactivo sin recargar la página
 */
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
