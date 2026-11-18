import type {
  Notification,
  NotificationPreferences,
  PushSubscriptionInput,
  ServiceResult,
} from "@/features/notifications/domain/models/Notification";

export interface NotificationRepository {
  /** Notificaciones del usuario, de la más reciente a la más antigua. */
  list(limit: number): Promise<ServiceResult<Notification[]>>;
  countUnread(): Promise<ServiceResult<number>>;
  /** Marca como leídas las notificaciones indicadas. Devuelve cuántas cambió. */
  markRead(ids: string[]): Promise<ServiceResult<number>>;
  markAllRead(): Promise<ServiceResult<number>>;
  getPreferences(): Promise<ServiceResult<NotificationPreferences>>;
  updatePreferences(input: {
    sharedExpenses: boolean;
    payments: boolean;
    releases: boolean;
  }): Promise<ServiceResult<NotificationPreferences>>;
  /** Alta o reasignación del dispositivo actual. Devuelve el id de la fila. */
  upsertPushSubscription(
    input: PushSubscriptionInput,
  ): Promise<ServiceResult<string>>;
  /** Baja del dispositivo. `false` si el endpoint no era del usuario. */
  deletePushSubscription(endpoint: string): Promise<ServiceResult<boolean>>;
}
