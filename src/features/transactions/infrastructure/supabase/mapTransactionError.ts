export function mapTransactionError(error: {
  message: string;
  code?: string;
}): string {
  const message = error.message.toLowerCase();

  if (message.includes("row-level security") || message.includes("rls")) {
    return "No tienes permiso para realizar esta acción.";
  }

  if (message.includes("foreign key") || message.includes("violates")) {
    return "La categoría o el método de pago no son válidos.";
  }

  if (message.includes("check constraint") || message.includes("amount")) {
    return "Revisa los datos de la transacción e inténtalo de nuevo.";
  }

  return "No pudimos completar la operación. Inténtalo de nuevo.";
}
