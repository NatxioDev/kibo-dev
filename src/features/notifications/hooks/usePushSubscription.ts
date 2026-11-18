"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import type { PushSupportState } from "@/features/notifications/domain/pushSupport";
import {
  disableDevicePush,
  enableDevicePush,
  readDevicePushState,
} from "@/features/notifications/push/devicePush";

export function usePushSubscription() {
  const [state, setState] = useState<PushSupportState | "loading">("loading");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const snapshot = await readDevicePushState().catch(() => null);
    setState(snapshot?.state ?? "unsupported");
  }, []);

  useEffect(() => {
    let active = true;

    readDevicePushState()
      .then((snapshot) => {
        if (active) setState(snapshot.state);
      })
      .catch(() => {
        if (active) setState("unsupported");
      });

    return () => {
      active = false;
    };
  }, []);

  // `startTransition` corre el callback sincrónicamente, así que el prompt de
  // permiso sale dentro del click (requisito de iOS).
  const enable = useCallback(() => {
    setError(null);
    startTransition(async () => {
      try {
        await enableDevicePush();
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "No pudimos activar las notificaciones.",
        );
      } finally {
        await refresh();
      }
    });
  }, [refresh]);

  const disable = useCallback(() => {
    setError(null);
    startTransition(async () => {
      try {
        await disableDevicePush();
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "No pudimos desactivar las notificaciones.",
        );
      } finally {
        await refresh();
      }
    });
  }, [refresh]);

  return { state, error, busy: isPending, enable, disable, refresh };
}
