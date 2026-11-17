"use client";

import { useEffect, useState } from "react";
import { countUnreadNotificationsAction } from "@/features/notifications/actions/notification.action";
import { NOTIFICATIONS_CHANGED_EVENT } from "@/features/notifications/notificationEvents";

/**
 * Cuenta de notificaciones sin leídas para la campana.
 * Se actualiza al montar, al cambiar de ruta y cuando la app vuelve al
 * foreground, igual que el contador de solicitudes de amistad.
 */
export function useUnreadNotifications(
  enabled: boolean,
  refreshKey: string,
): number {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const load = () => {
      countUnreadNotificationsAction().then((result) => {
        if (!cancelled && result.success) setUnread(result.data);
      });
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") load();
    };

    load();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, load);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, load);
    };
  }, [enabled, refreshKey]);

  return enabled ? unread : 0;
}
