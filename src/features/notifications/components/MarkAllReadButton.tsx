"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { markAllNotificationsReadAction } from "@/features/notifications/actions/notification.action";
import { NOTIFICATIONS_CHANGED_EVENT } from "@/features/notifications/notificationEvents";

export function MarkAllReadButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const markAll = () => {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (result.success) {
        window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
        router.refresh();
      }
    });
  };

  return (
    <Button variant="secondary" size="sm" onClick={markAll} loading={pending}>
      Marcar leídas
    </Button>
  );
}
