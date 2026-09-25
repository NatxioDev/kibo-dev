const DAY_MS = 24 * 60 * 60 * 1000;

export type UsernameChangeAvailability =
  | { canChange: true }
  | { canChange: false; nextChangeAt: Date };

export function getUsernameChangeAvailability(
  changedAt: string | null,
  cooldownDays: number,
  now: Date = new Date(),
): UsernameChangeAvailability {
  if (!changedAt || cooldownDays <= 0) {
    return { canChange: true };
  }

  const nextChangeAt = new Date(
    new Date(changedAt).getTime() + cooldownDays * DAY_MS,
  );

  return nextChangeAt <= now
    ? { canChange: true }
    : { canChange: false, nextChangeAt };
}

const nextChangeFormatter = new Intl.DateTimeFormat("es-BO", {
  day: "numeric",
  month: "long",
  timeZone: "America/La_Paz",
});

export function formatNextUsernameChange(date: Date): string {
  return nextChangeFormatter.format(date);
}
