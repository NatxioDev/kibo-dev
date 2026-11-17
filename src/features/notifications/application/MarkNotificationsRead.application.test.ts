import { describe, expect, it } from "vitest";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { NotificationRepository } from "@/features/notifications/domain/Notification.repository";
import type { Notification } from "@/features/notifications/domain/models/Notification";
import { MarkNotificationsRead } from "./MarkNotificationsRead.application";

class FakeNotificationRepository implements NotificationRepository {
  marked: string[] = [];

  constructor(private readonly fail = false) {}

  async list(): Promise<ServiceResult<Notification[]>> {
    return { success: true, data: [] };
  }

  async countUnread(): Promise<ServiceResult<number>> {
    return { success: true, data: 0 };
  }

  async markRead(ids: string[]): Promise<ServiceResult<number>> {
    this.marked.push(...ids);
    if (this.fail) {
      return { success: false, error: "boom" };
    }
    return { success: true, data: ids.length };
  }

  async markAllRead(): Promise<ServiceResult<number>> {
    return { success: true, data: 0 };
  }
}

describe("MarkNotificationsRead", () => {
  it("delega los ids al repositorio y devuelve cuántas se marcaron", async () => {
    const repository = new FakeNotificationRepository();

    const result = await new MarkNotificationsRead(repository).execute([
      "id-1",
      "id-2",
    ]);

    expect(repository.marked).toEqual(["id-1", "id-2"]);
    expect(result).toEqual({ success: true, data: 2 });
  });

  it("propaga el error del repositorio", async () => {
    const repository = new FakeNotificationRepository(true);

    const result = await new MarkNotificationsRead(repository).execute(["id-1"]);

    expect(result).toEqual({ success: false, error: "boom" });
  });
});
