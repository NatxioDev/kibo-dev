"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { CountUnreadNotifications } from "@/features/notifications/application/CountUnreadNotifications.application";
import { MarkAllNotificationsRead } from "@/features/notifications/application/MarkAllNotificationsRead.application";
import { MarkNotificationsRead } from "@/features/notifications/application/MarkNotificationsRead.application";
import type { ServiceResult } from "@/features/notifications/domain/models/Notification";

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
