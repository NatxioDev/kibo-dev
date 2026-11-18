import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationRepository } from "@/features/notifications/domain/Notification.repository";
import type {
  Notification,
  NotificationPreferences,
  PushSubscriptionInput,
  ServiceResult,
} from "@/features/notifications/domain/models/Notification";
import { mapNotificationError } from "@/features/notifications/infrastructure/supabase/mapNotificationError";

const NOT_AUTHENTICATED = "Debes iniciar sesión para ver tus notificaciones.";

function defaultPreferences(userId: string): NotificationPreferences {
  return {
    user_id: userId,
    shared_expenses: true,
    payments: true,
    budget_alerts: true,
    releases: true,
    marketing: false,
    updated_at: "",
  };
}

const COLUMNS =
  "id, user_id, actor_id, type, category, title, body, url, data, tag, dedupe_key, read_at, created_at";

export class SupabaseNotificationRepository implements NotificationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private async getUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    return error ? null : user;
  }

  async list(limit: number): Promise<ServiceResult<Notification[]>> {
    const user = await this.getUser();
    if (!user) {
      return { success: false, error: NOT_AUTHENTICATED };
    }

    const { data, error } = await this.supabase
      .from("notifications")
      .select(COLUMNS)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: mapNotificationError(error) };
    }

    return { success: true, data: (data ?? []) as Notification[] };
  }

  async countUnread(): Promise<ServiceResult<number>> {
    const user = await this.getUser();
    if (!user) {
      return { success: false, error: NOT_AUTHENTICATED };
    }

    const { count, error } = await this.supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      return { success: false, error: mapNotificationError(error) };
    }

    return { success: true, data: count ?? 0 };
  }

  async markRead(ids: string[]): Promise<ServiceResult<number>> {
    if (ids.length === 0) {
      return { success: true, data: 0 };
    }

    const { data, error } = await this.supabase.rpc("mark_notifications_read", {
      p_ids: ids,
    });

    if (error) {
      return { success: false, error: mapNotificationError(error) };
    }

    return { success: true, data: data ?? 0 };
  }

  async markAllRead(): Promise<ServiceResult<number>> {
    const { data, error } = await this.supabase.rpc("mark_all_notifications_read");

    if (error) {
      return { success: false, error: mapNotificationError(error) };
    }

    return { success: true, data: data ?? 0 };
  }

  async getPreferences(): Promise<ServiceResult<NotificationPreferences>> {
    const user = await this.getUser();
    if (!user) {
      return { success: false, error: NOT_AUTHENTICATED };
    }

    const { data, error } = await this.supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return { success: false, error: mapNotificationError(error) };
    }

    return {
      success: true,
      data: (data as NotificationPreferences | null) ?? defaultPreferences(user.id),
    };
  }

  async updatePreferences(input: {
    sharedExpenses: boolean;
    payments: boolean;
    releases: boolean;
  }): Promise<ServiceResult<NotificationPreferences>> {
    const { data, error } = await this.supabase.rpc(
      "update_notification_preferences",
      {
        p_shared_expenses: input.sharedExpenses,
        p_payments: input.payments,
        p_releases: input.releases,
      },
    );

    if (error) {
      return { success: false, error: mapNotificationError(error) };
    }

    return { success: true, data: data as NotificationPreferences };
  }

  async upsertPushSubscription(
    input: PushSubscriptionInput,
  ): Promise<ServiceResult<string>> {
    const { data, error } = await this.supabase.rpc("upsert_push_subscription", {
      p_endpoint: input.endpoint,
      p_p256dh: input.p256dh,
      p_auth: input.auth,
      p_platform: input.platform,
      p_user_agent: input.userAgent,
    });

    if (error) {
      return { success: false, error: mapNotificationError(error) };
    }

    return { success: true, data: data as string };
  }

  async deletePushSubscription(endpoint: string): Promise<ServiceResult<boolean>> {
    const { data, error } = await this.supabase.rpc("delete_push_subscription", {
      p_endpoint: endpoint,
    });

    if (error) {
      return { success: false, error: mapNotificationError(error) };
    }

    return { success: true, data: Boolean(data) };
  }
}
