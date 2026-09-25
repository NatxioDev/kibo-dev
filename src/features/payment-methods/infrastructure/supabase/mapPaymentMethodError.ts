export function mapPaymentMethodError(error: {
  message: string;
  code?: string;
}): string {
  const message = error.message.toLowerCase();
  const code = error.code;

  if (
    code === "23505" ||
    message.includes("duplicate") ||
    message.includes("unique")
  ) {
    return "Ya tienes un método de pago con ese nombre.";
  }

  if (message.includes("row-level security") || message.includes("rls")) {
    return "No tienes permiso para realizar esta acción.";
  }

  return "No pudimos completar la operación. Inténtalo de nuevo.";
}
