import type {
  Notification,
  NotificationGroup,
  NotificationPeriod,
} from "@/features/notifications/domain/models/Notification";

const DAY_MS = 24 * 60 * 60 * 1000;

const PERIOD_LABELS: Record<NotificationPeriod, string> = {
  today: "Hoy",
  week: "Esta semana",
  older: "Antes",
};

/** Medianoche local del día de `now`. */
function startOfDay(now: Date): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function periodFor(createdAt: string, now: Date): NotificationPeriod {
  const created = new Date(createdAt).getTime();
  const today = startOfDay(now).getTime();

  if (created >= today) return "today";
  if (created >= today - 7 * DAY_MS) return "week";
  return "older";
}

/**
 * Agrupa las notificaciones en Hoy / Esta semana / Antes, conservando el orden
 * de llegada (de la más reciente a la más antigua).
 */
export function groupNotificationsByPeriod(
  notifications: Notification[],
  now: Date = new Date(),
): NotificationGroup[] {
  const groups = new Map<NotificationPeriod, Notification[]>();

  for (const notification of notifications) {
    const period = periodFor(notification.created_at, now);
    const bucket = groups.get(period);
    if (bucket) {
      bucket.push(notification);
    } else {
      groups.set(period, [notification]);
    }
  }

  return (["today", "week", "older"] as NotificationPeriod[])
    .filter((period) => groups.has(period))
    .map((period) => ({
      period,
      label: PERIOD_LABELS[period],
      items: groups.get(period) ?? [],
    }));
}
