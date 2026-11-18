export function mapNotificationError(error: {
  message: string;
  code?: string;
}): string {
  const message = error.message.toLowerCase();

  if (message.includes("debes iniciar sesión")) {
    return "Debes iniciar sesión.";
  }

  if (message.includes("suscripción")) {
    return "No pudimos registrar este dispositivo. Vuelve a intentarlo.";
  }

  if (error.code === "23505" || message.includes("duplicate") || message.includes("unique")) {
    return "Esta notificación ya existe.";
  }

  if (message.includes("row-level security") || message.includes("rls")) {
    return "No tienes permiso para realizar esta acción.";
  }

  return "No pudimos completar la acción. Inténtalo de nuevo.";
}
