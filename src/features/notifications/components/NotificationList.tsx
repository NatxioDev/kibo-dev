import { Reveal } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListGroup } from "@/components/ui/ListGroup";
import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import { formatNotificationTime } from "@/features/notifications/domain/formatNotificationTime";
import type { NotificationGroup } from "@/features/notifications/domain/models/Notification";

type NotificationListProps = {
  groups: NotificationGroup[];
};

export function NotificationList({ groups }: NotificationListProps) {
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  if (total === 0) {
    return (
      <Reveal>
        <EmptyState
          title="Sin notificaciones"
          description="Te avisamos cuando pase algo: cobros nuevos, pagos y novedades."
        />
      </Reveal>
    );
  }

  return (
    <>
      {groups.map((group) => (
        <Reveal key={group.period}>
          <ListGroup title={group.label}>
            {group.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                timeLabel={formatNotificationTime(notification.created_at)}
              />
            ))}
          </ListGroup>
        </Reveal>
      ))}
    </>
  );
}
