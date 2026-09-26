"use server";

import { revalidatePath } from "next/cache";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { UpdateDisplayName } from "@/features/profile/application/UpdateDisplayName.application";
import type { ServiceResult } from "@/features/profile/domain/models/Profile";
import { displayNameSchema } from "@/features/profile/schemas/displayNameSchema";

export async function updateDisplayNameAction(
  displayName: string,
): Promise<ServiceResult<{ display_name: string | null }>> {
  // Validación de entrada en el servidor
  const parsed = displayNameSchema.safeParse(displayName);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Revisa el nombre.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { profileRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new UpdateDisplayName(profileRepository).execute(
    parsed.data,
  );

  if (result.success) {
    // Revalidar las rutas relevantes
    revalidatePath("/");
    revalidatePath("/settings/profile");
  }

  return result;
}
