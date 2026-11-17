import { describe, expect, it } from "vitest";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { NotificationRepository } from "@/features/notifications/domain/Notification.repository";
import type { Notification } from "@/features/notifications/domain/models/Notification";
import { ListNotifications } from "./ListNotifications.application";

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

class FakeNotificationRepository implements NotificationRepository {
  limits: number[] = [];

  constructor(
    private readonly notifications: Notification[],
    private readonly failWhen: (limit: number) => boolean = () => false,
  ) {}

  async list(limit: number): Promise<ServiceResult<Notification[]>> {
    this.limits.push(limit);
    if (this.failWhen(limit)) {
      return { success: false, error: "boom" };
    }
    return { success: true, data: this.notifications };
  }

  async countUnread(): Promise<ServiceResult<number>> {
    return { success: true, data: 0 };
  }

  async markRead(): Promise<ServiceResult<number>> {
    return { success: true, data: 0 };
  }

  async markAllRead(): Promise<ServiceResult<number>> {
    return { success: true, data: 0 };
  }
}

describe("ListNotifications", () => {
  it("pide el límite al repositorio y agrupa el resultado", async () => {
    const repository = new FakeNotificationRepository([
      notification("a", "2026-10-20T11:00:00"),
      notification("b", "2026-10-01T10:00:00"),
    ]);

    const result = await new ListNotifications(repository).execute(30, NOW);

    expect(repository.limits).toEqual([30]);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.map((group) => group.label)).toEqual(["Hoy", "Antes"]);
    expect(result.data[0].items[0].id).toBe("a");
  });

  it("propaga el error del repositorio", async () => {
    const repository = new FakeNotificationRepository([], (limit) => limit === 30);

    const result = await new ListNotifications(repository).execute(30, NOW);

    expect(result).toEqual({ success: false, error: "boom" });
  });
});
