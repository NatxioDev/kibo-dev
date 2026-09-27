"use server";

import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { GetCurrentProfile } from "@/features/profile/application/GetCurrentProfile.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { CurrentProfile } from "@/features/profile/domain/models/Profile";

export async function getCurrentProfileAction(): Promise<
  ServiceResult<CurrentProfile>
> {
  // Obtener dependencias del servidor (incluye autenticación)
  const { profileRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new GetCurrentProfile(profileRepository).execute();

  return result;
}
