"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { CountUnreadNotifications } from "@/features/notifications/application/CountUnreadNotifications.application";
import { MarkAllNotificationsRead } from "@/features/notifications/application/MarkAllNotificationsRead.application";
import { MarkNotificationsRead } from "@/features/notifications/application/MarkNotificationsRead.application";
import type {
  NotificationPreferences,
  PushSubscriptionInput,
  ServiceResult,
} from "@/features/notifications/domain/models/Notification";

const markReadSchema = z.object({
  ids: z.array(z.string().uuid("ID de notificación inválido")).min(1),
});

/** Número de notificaciones sin leer para la campana. */
export async function countUnreadNotificationsAction(): Promise<
  ServiceResult<number>
> {
  const { notificationRepository } = await createServerDependencies();

  return new CountUnreadNotifications(notificationRepository).execute();
}

/** Marca como leídas las notificaciones indicadas. */
export async function markNotificationsReadAction(
  ids: string[],
): Promise<ServiceResult<number>> {
  const parsed = markReadSchema.safeParse({ ids });
  if (!parsed.success) {
    return { success: false, error: "Las notificaciones elegidas no son válidas." };
  }

  const { notificationRepository } = await createServerDependencies();
  const result = await new MarkNotificationsRead(
    notificationRepository,
  ).execute(parsed.data.ids);

  if (result.success) {
    revalidatePath("/notifications");
  }

  return result;
}

/** Marca como leídas todas las notificaciones del usuario. */
export async function markAllNotificationsReadAction(): Promise<
  ServiceResult<number>
> {
  const { notificationRepository } = await createServerDependencies();
  const result = await new MarkAllNotificationsRead(
    notificationRepository,
  ).execute();

  if (result.success) {
    revalidatePath("/notifications");
  }

  return result;
}

const pushSubscriptionSchema = z.object({
  endpoint: z.string().max(2048).regex(/^https:\/\//, "Endpoint inválido"),
  p256dh: z.string().min(1).max(255),
  auth: z.string().min(1).max(255),
  platform: z.enum(["android", "ios", "desktop", "unknown"]),
  userAgent: z.string().max(512).nullable(),
});

/** Alta del dispositivo actual. El usuario sale de la sesión, nunca del cliente. */
export async function subscribePushAction(
  input: PushSubscriptionInput,
): Promise<ServiceResult<string>> {
  const parsed = pushSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Este dispositivo no se pudo registrar." };
  }

  const { notificationRepository } = await createServerDependencies();
  const result = await notificationRepository.upsertPushSubscription(parsed.data);

  if (result.success) {
    revalidatePath("/settings/notifications");
  }

  return result;
}

/** Baja del dispositivo actual (solo si el endpoint es del usuario). */
export async function unsubscribePushAction(
  endpoint: string,
): Promise<ServiceResult<boolean>> {
  const parsed = z.string().max(2048).regex(/^https:\/\//).safeParse(endpoint);
  if (!parsed.success) {
    return { success: false, error: "Este dispositivo no se pudo quitar." };
  }

  const { notificationRepository } = await createServerDependencies();
  const result = await notificationRepository.deletePushSubscription(parsed.data);

  if (result.success) {
    revalidatePath("/settings/notifications");
  }

  return result;
}

const preferencesSchema = z.object({
  sharedExpenses: z.boolean(),
  payments: z.boolean(),
  releases: z.boolean(),
});

export async function updateNotificationPreferencesAction(input: {
  sharedExpenses: boolean;
  payments: boolean;
  releases: boolean;
}): Promise<ServiceResult<NotificationPreferences>> {
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Revisa tus preferencias de notificación." };
  }

  const { notificationRepository } = await createServerDependencies();
  const result = await notificationRepository.updatePreferences(parsed.data);

  if (result.success) {
    revalidatePath("/settings/notifications");
  }

  return result;
}
