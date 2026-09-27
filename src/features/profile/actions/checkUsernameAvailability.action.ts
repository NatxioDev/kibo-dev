"use server";

import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { CheckUsernameAvailability } from "@/features/profile/application/CheckUsernameAvailability.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";

export async function checkUsernameAvailabilityAction(
  username: string,
): Promise<ServiceResult<boolean>> {
  if (typeof username !== "string") {
    return { success: false, error: "Nombre de usuario inválido." };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { profileRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new CheckUsernameAvailability(profileRepository).execute(
    username,
  );

  return result;
}
