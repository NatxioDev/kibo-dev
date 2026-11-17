const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Tiempo relativo corto: "Ahora", "hace 5 min", "hace 2 h", "hace 3 d". */
export function formatNotificationTime(
  createdAt: string,
  now: Date = new Date(),
): string {
  const elapsed = now.getTime() - new Date(createdAt).getTime();

  if (elapsed < MINUTE_MS) return "Ahora";

  if (elapsed < HOUR_MS) {
    const minutes = Math.floor(elapsed / MINUTE_MS);
    return `hace ${minutes} min`;
  }

  if (elapsed < DAY_MS) {
    const hours = Math.floor(elapsed / HOUR_MS);
    return `hace ${hours} h`;
  }

  const days = Math.floor(elapsed / DAY_MS);
  if (days < 7) return `hace ${days} d`;

  return new Date(createdAt).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
  });
}
