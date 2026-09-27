export function mapFriendshipError(error: {
  message: string;
  code?: string;
}): string {
  const message = error.message.toLowerCase();

  if (error.code === "23505" || message.includes("friendships_pair_key")) {
    return "Ya existe una solicitud o amistad con esta persona.";
  }

  if (message.includes("friendships_not_self")) {
    return "No puedes agregarte a ti mismo.";
  }

  if (error.code === "23503") {
    return "Esta persona ya no está disponible.";
  }

  if (message.includes("row-level security") || message.includes("rls")) {
    return "No tienes permiso para realizar esta acción.";
  }

  return "No pudimos completar la acción. Inténtalo de nuevo.";
}
