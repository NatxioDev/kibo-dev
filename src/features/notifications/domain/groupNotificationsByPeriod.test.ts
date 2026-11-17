import { describe, expect, it } from "vitest";
import {
  groupNotificationsByPeriod,
  periodFor,
} from "@/features/notifications/domain/groupNotificationsByPeriod";
import type { Notification } from "@/features/notifications/domain/models/Notification";

const NOW = new Date(2026, 9, 20, 12, 0, 0);

function notification(id: string, createdAt: string): Notification {
  return {
    id,
    user_id: "user",
    actor_id: null,
    type: "shared_expense.created",
    category: "shared_expenses",
    title: "Nuevo cobro",
    body: "Ana te creó un cobro",
    url: "/friends/ana",
    data: {},
    tag: `tag-${id}`,
    dedupe_key: `key-${id}`,
    read_at: null,
    created_at: createdAt,
  };
}

describe("periodFor", () => {
  it("hoy incluye desde la medianoche", () => {
    expect(periodFor("2026-10-20T00:00:00", NOW)).toBe("today");
    expect(periodFor("2026-10-20T11:59:00", NOW)).toBe("today");
  });

  it("ayer ya es de la semana", () => {
    expect(periodFor("2026-10-19T23:00:00", NOW)).toBe("week");
  });

  it("más de 7 días es anterior", () => {
    expect(periodFor("2026-10-12T23:00:00", NOW)).toBe("older");
    expect(periodFor("2026-09-01T10:00:00", NOW)).toBe("older");
  });
});

describe("groupNotificationsByPeriod", () => {
  it("agrupa en Hoy, Esta semana y Antes y conserva el orden", () => {
    const groups = groupNotificationsByPeriod(
      [
        notification("a", "2026-10-20T11:00:00"),
        notification("b", "2026-10-18T10:00:00"),
        notification("c", "2026-10-01T10:00:00"),
        notification("d", "2026-10-20T08:00:00"),
      ],
      NOW,
    );

    expect(groups.map((group) => group.label)).toEqual([
      "Hoy",
      "Esta semana",
      "Antes",
    ]);
    expect(groups[0].items.map((item) => item.id)).toEqual(["a", "d"]);
    expect(groups[1].items.map((item) => item.id)).toEqual(["b"]);
    expect(groups[2].items.map((item) => item.id)).toEqual(["c"]);
  });

  it("omite los grupos vacíos", () => {
    const groups = groupNotificationsByPeriod(
      [notification("a", "2026-10-01T10:00:00")],
      NOW,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].period).toBe("older");
  });

  it("sin notificaciones devuelve la lista vacía", () => {
    expect(groupNotificationsByPeriod([], NOW)).toEqual([]);
  });
});
