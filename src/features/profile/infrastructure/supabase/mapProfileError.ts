export function mapProfileError(error: {
  message: string;
  code?: string;
}): string {
  const message = error.message.toLowerCase();

  if (error.code === "23505" || message.includes("duplicate key")) {
    return "Ese nombre de usuario ya existe.";
  }

  if (message.includes("profiles_username_not_reserved")) {
    return "Ese nombre de usuario no está disponible.";
  }

  if (message.includes("profiles_username_format")) {
    return "Usa de 3 a 20 caracteres: letras minúsculas, números o guion bajo.";
  }

  if (message.includes("profiles_display_name_length")) {
    return "El nombre debe tener entre 1 y 50 caracteres.";
  }

  if (message.includes("username cannot be changed")) {
    return "Cambia tu nombre de usuario desde Ajustes.";
  }

  if (message.includes("row-level security") || message.includes("rls")) {
    return "No tienes permiso para modificar este perfil.";
  }

  return "No pudimos guardar tu perfil. Inténtalo de nuevo.";
}
