export function mapFeedbackError(error: {
  message: string;
  code?: string;
}): string {
  const message = error.message.toLowerCase();

  if (message.includes("row-level security") || message.includes("rls")) {
    return "No tienes permiso para enviar feedback.";
  }

  if (message.includes("check") || message.includes("message")) {
    return "Revisa el mensaje e inténtalo de nuevo.";
  }

  return "No pudimos enviar tu feedback. Inténtalo de nuevo.";
}
