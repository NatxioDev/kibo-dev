/**
 * Payload que consumen los handlers de `push` del service worker (KIBO-99).
 * Mantener en sync con `src/features/notifications/push/pushPayload.ts`.
 */
export type PushNotificationRow = {
  id: string;
  title: string;
  body: string;
  url: string;
  tag: string;
  data: unknown;
};

export function buildPushPayload(row: PushNotificationRow): string {
  const data =
    typeof row.data === "object" && row.data !== null && !Array.isArray(row.data)
      ? (row.data as Record<string, unknown>)
      : {};

  return JSON.stringify({
    title: row.title,
    body: row.body,
    url: row.url,
    tag: row.tag,
    data: { ...data, notificationId: row.id },
  });
}
