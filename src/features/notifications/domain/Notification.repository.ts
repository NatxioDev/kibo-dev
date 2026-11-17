import type {
  Notification,
  ServiceResult,
} from "@/features/notifications/domain/models/Notification";

export interface NotificationRepository {
  /** Notificaciones del usuario, de la más reciente a la más antigua. */
  list(limit: number): Promise<ServiceResult<Notification[]>>;
  countUnread(): Promise<ServiceResult<number>>;
  /** Marca como leídas las notificaciones indicadas. Devuelve cuántas cambió. */
  markRead(ids: string[]): Promise<ServiceResult<number>>;
  markAllRead(): Promise<ServiceResult<number>>;
}
