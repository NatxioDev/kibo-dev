"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { AcceptFriendRequest } from "@/features/friends/application/AcceptFriendRequest.application";
import type { ServiceResult } from "@/features/friends/domain/models/Friendship";

// Validación del friendshipId con zod
const acceptRequestSchema = z.object({
  friendshipId: z.string().uuid("ID de solicitud inválido"),
});

export async function acceptFriendRequestAction(
  friendshipId: string,
): Promise<ServiceResult<null>> {
  // Validación de entrada en el servidor
  const parsed = acceptRequestSchema.safeParse({ friendshipId });
  if (!parsed.success) {
    return {
      success: false,
      error: "El ID de la solicitud debe ser un UUID válido.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { friendshipRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new AcceptFriendRequest(friendshipRepository).execute(
    parsed.data.friendshipId,
  );

  if (result.success) {
    // Revalidar la página de amigos para que los datos se actualicen
    revalidatePath("/friends", "layout");
  }

  return result;
}
