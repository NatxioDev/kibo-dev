"use server";

import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { SearchFriends } from "@/features/friends/application/SearchFriends.application";
import type {
  FriendSearchResult,
  ServiceResult,
} from "@/features/friends/domain/models/Friendship";
import {
  FRIEND_SEARCH_LIMIT,
  FRIEND_SEARCH_MIN_LENGTH,
  friendSearchSchema,
} from "@/features/friends/schemas/friendSearchSchema";

/**
 * Busca amigos por username en el servidor.
 * Valida la longitud mínima y limita resultados.
 */
export async function searchFriendsAction(
  query: string,
): Promise<ServiceResult<FriendSearchResult[]>> {
  // Validación de entrada en el servidor con zod
  const parsed = friendSearchSchema.safeParse(query);
  if (!parsed.success) {
    // Si no cumple con el mínimo, devolver lista vacía (no es un error)
    if (query.trim().length < FRIEND_SEARCH_MIN_LENGTH) {
      return { success: true, data: [] };
    }
    return {
      success: false,
      error: `El username debe tener entre ${FRIEND_SEARCH_MIN_LENGTH} y 30 caracteres, solo letras minúsculas, números y guiones bajos.`,
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { friendshipRepository } = await createServerDependencies();

  // Ejecutar el caso de uso (ya tiene el límite de resultados en el repositorio)
  const result = await new SearchFriends(friendshipRepository).execute(
    parsed.data,
  );

  // Asegurarse de no devolver más de FRIEND_SEARCH_LIMIT resultados
  if (result.success && result.data.length > FRIEND_SEARCH_LIMIT) {
    return { success: true, data: result.data.slice(0, FRIEND_SEARCH_LIMIT) };
  }

  return result;
}
