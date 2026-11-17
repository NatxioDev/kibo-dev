import "server-only";

import type { NotificationRepository } from "@/features/notifications/domain/Notification.repository";
import type { ServiceResult } from "@/features/notifications/domain/models/Notification";

export class MarkNotificationsRead {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  execute(ids: string[]): Promise<ServiceResult<number>> {
    return this.notificationRepository.markRead(ids);
  }
}
