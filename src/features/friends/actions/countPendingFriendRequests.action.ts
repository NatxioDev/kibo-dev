"use server";

import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { CountPendingFriendRequests } from "@/features/friends/application/CountPendingFriendRequests.application";
import type { ServiceResult } from "@/features/friends/domain/models/Friendship";

/**
 * Cuenta las solicitudes de amistad pendientes en el servidor.
 * Requiere autenticación.
 */
export async function countPendingFriendRequestsAction(): Promise<
  ServiceResult<number>
> {
  // Obtener dependencias del servidor (incluye autenticación)
  const { friendshipRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  return await new CountPendingFriendRequests(friendshipRepository).execute();
}
