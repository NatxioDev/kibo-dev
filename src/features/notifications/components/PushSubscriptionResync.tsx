"use client";

import { useEffect } from "react";
import { resyncDevicePush } from "@/features/notifications/push/devicePush";

/** Latido diario del dispositivo. No pide permisos ni renderiza nada. */
export function PushSubscriptionResync() {
  useEffect(() => {
    void resyncDevicePush();
  }, []);

  return null;
}
