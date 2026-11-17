"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ListRow } from "@/components/ui/ListGroup";
import { markNotificationsReadAction } from "@/features/notifications/actions/notification.action";
import type { Notification } from "@/features/notifications/domain/models/Notification";
import { NOTIFICATIONS_CHANGED_EVENT } from "@/features/notifications/notificationEvents";

type NotificationItemProps = {
  notification: Notification;
  /** Tiempo relativo calculado en el servidor para no deshidratar con otra marca. */
  timeLabel: string;
};

export function NotificationItem({
  notification,
  timeLabel,
}: NotificationItemProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [read, setRead] = useState(notification.read_at != null);

  const open = () => {
    if (!read) {
      setRead(true);
      startTransition(async () => {
        await markNotificationsReadAction([notification.id]);
        window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
        router.refresh();
      });
    }
    router.push(notification.url);
  };

  return (
    <ListRow
      title={notification.title}
      subtitle={notification.body}
      onClick={open}
      muted={read}
      trailing={
        <span className="flex flex-col items-end gap-1">
          <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
            {timeLabel}
          </span>
          {read ? null : (
            <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />
          )}
        </span>
      }
    />
  );
}
