"use server";

import { revalidatePath } from "next/cache";
import { createAdminDependencies } from "@/core/infrastructure/factories/createAdminDependencies";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ChangeUsername } from "@/features/profile/application/ChangeUsername.application";
import { getUsernameChangeCooldownDays } from "@/features/profile/config/usernameChange.config";
import type { ServiceResult } from "@/features/profile/domain/models/Profile";

export async function changeUsernameAction(
  username: string,
): Promise<ServiceResult<{ username: string }>> {
  if (typeof username !== "string") {
    return { success: false, error: "Nombre de usuario inválido." };
  }

  let adminDependencies: ReturnType<typeof createAdminDependencies>;
  try {
    adminDependencies = createAdminDependencies();
  } catch {
    return {
      success: false,
      error: "El cambio de nombre de usuario no está disponible ahora.",
    };
  }

  const { profileRepository } = await createServerDependencies();
  const { profileAdminRepository } = adminDependencies;

  const result = await new ChangeUsername(
    profileRepository,
    profileAdminRepository,
    getUsernameChangeCooldownDays(),
  ).execute(username);

  if (!result.success) {
    return result;
  }

  revalidatePath("/settings", "layout");
  return { success: true, data: { username: result.data.username ?? username } };
}
