export type { ServiceResult } from "@/core/domain/ServiceResult";

export type NotificationCategory =
  | "shared_expenses"
  | "payments"
  | "releases"
  | "marketing";

export type NotificationType =
  | "shared_expense.created"
  | "shared_expense.updated"
  | "shared_expense.voided"
  | "settlement.requested"
  | "settlement.confirmed"
  | "settlement.rejected"
  | "release.published"
  | "marketing.campaign";

export type Notification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  /** Deep link relativo dentro de la app. */
  url: string;
  data: Record<string, unknown>;
  /** Tag del sistema operativo: reemplaza la notificación de la misma entidad. */
  tag: string;
  /** Idempotencia lógica por usuario. */
  dedupe_key: string;
  read_at: string | null;
  created_at: string;
};

export type NotificationPreferences = {
  user_id: string;
  shared_expenses: boolean;
  payments: boolean;
  budget_alerts: boolean;
  releases: boolean;
  marketing: boolean;
  updated_at: string;
};

export type NotificationPeriod = "today" | "week" | "older";

export type NotificationGroup = {
  period: NotificationPeriod;
  label: string;
  items: Notification[];
};
