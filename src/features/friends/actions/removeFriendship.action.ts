"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { RemoveFriendship } from "@/features/friends/application/RemoveFriendship.application";
import type { ServiceResult } from "@/features/friends/domain/models/Friendship";

// Validación del friendshipId con zod
const removeFriendshipSchema = z.object({
  friendshipId: z.string().uuid("ID de amistad inválido"),
});

/**
 * Elimina una amistad (puede ser para rechazar, cancelar o eliminar amigo).
 * Se ejecuta en el servidor y valida la sesión del usuario.
 */
export async function removeFriendshipAction(
  friendshipId: string,
): Promise<ServiceResult<null>> {
  // Validación de entrada en el servidor
  const parsed = removeFriendshipSchema.safeParse({ friendshipId });
  if (!parsed.success) {
    return {
      success: false,
      error: "El ID de la amistad debe ser un UUID válido.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { friendshipRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new RemoveFriendship(friendshipRepository).execute(
    parsed.data.friendshipId,
  );

  if (result.success) {
    // Revalidar la página de amigos para que los datos se actualicen
    revalidatePath("/friends", "layout");
  }

  return result;
}
