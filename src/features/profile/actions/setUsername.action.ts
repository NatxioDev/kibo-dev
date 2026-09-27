"use server";

import { revalidatePath } from "next/cache";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { SetUsername } from "@/features/profile/application/SetUsername.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";

export async function setUsernameAction(
  username: string,
): Promise<ServiceResult<{ username: string }>> {
  if (typeof username !== "string") {
    return { success: false, error: "Nombre de usuario inválido." };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { profileRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new SetUsername(profileRepository).execute(username);

  if (!result.success) {
    return result;
  }

  revalidatePath("/");
  revalidatePath("/onboarding");
  return { success: true, data: { username: result.data.username ?? username } };
}
