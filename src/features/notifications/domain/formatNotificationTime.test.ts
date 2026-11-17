import { describe, expect, it } from "vitest";
import { formatNotificationTime } from "@/features/notifications/domain/formatNotificationTime";

const NOW = new Date(2026, 9, 20, 12, 0, 0);

describe("formatNotificationTime", () => {
  it("recién creada dice Ahora", () => {
    expect(formatNotificationTime("2026-10-20T11:59:30", NOW)).toBe("Ahora");
  });

  it("minutos, horas y días", () => {
    expect(formatNotificationTime("2026-10-20T11:55:00", NOW)).toBe("hace 5 min");
    expect(formatNotificationTime("2026-10-20T10:00:00", NOW)).toBe("hace 2 h");
    expect(formatNotificationTime("2026-10-18T12:00:00", NOW)).toBe("hace 2 d");
  });

  it("más de una semana muestra la fecha", () => {
    expect(formatNotificationTime("2026-10-01T12:00:00", NOW)).toMatch(/\d{2}/);
  });
});
