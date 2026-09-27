"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { SendFriendRequest } from "@/features/friends/application/SendFriendRequest.application";
import type { ServiceResult } from "@/features/friends/domain/models/Friendship";

// Validación del addresseeId con zod
const sendRequestSchema = z.object({
  addresseeId: z.string().uuid("ID de usuario inválido"),
});

export async function sendFriendRequestAction(
  addresseeId: string,
): Promise<ServiceResult<null>> {
  // Validación de entrada en el servidor
  const parsed = sendRequestSchema.safeParse({ addresseeId });
  if (!parsed.success) {
    return {
      success: false,
      error: "El ID del usuario debe ser un UUID válido.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { friendshipRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new SendFriendRequest(friendshipRepository).execute(
    parsed.data.addresseeId,
  );

  if (result.success) {
    // Revalidar la página de amigos para que los datos se actualicen
    revalidatePath("/friends", "layout");
  }

  return result;
}
