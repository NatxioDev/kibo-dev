import "server-only";

import type { NotificationRepository } from "@/features/notifications/domain/Notification.repository";
import type { ServiceResult } from "@/features/notifications/domain/models/Notification";

export class MarkAllNotificationsRead {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  execute(): Promise<ServiceResult<number>> {
    return this.notificationRepository.markAllRead();
  }
}
