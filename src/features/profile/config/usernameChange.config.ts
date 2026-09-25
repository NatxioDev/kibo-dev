import "server-only";

const DEFAULT_COOLDOWN_DAYS = 30;

export function getUsernameChangeCooldownDays(): number {
  const raw = process.env.USERNAME_CHANGE_COOLDOWN_DAYS;
  if (raw === undefined || raw.trim() === "") {
    return DEFAULT_COOLDOWN_DAYS;
  }

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0
    ? parsed
    : DEFAULT_COOLDOWN_DAYS;
}
