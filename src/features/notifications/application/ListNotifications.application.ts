import "server-only";

import { groupNotificationsByPeriod } from "@/features/notifications/domain/groupNotificationsByPeriod";
import type { NotificationRepository } from "@/features/notifications/domain/Notification.repository";
import type {
  NotificationGroup,
  ServiceResult,
} from "@/features/notifications/domain/models/Notification";

export class ListNotifications {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(
    limit: number,
    now: Date = new Date(),
  ): Promise<ServiceResult<NotificationGroup[]>> {
    const result = await this.notificationRepository.list(limit);
    if (!result.success) {
      return result;
    }

    return { success: true, data: groupNotificationsByPeriod(result.data, now) };
  }
}
