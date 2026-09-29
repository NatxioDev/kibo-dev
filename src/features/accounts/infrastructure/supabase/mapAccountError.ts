export function mapAccountError(error: {
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
    return "Ya tienes una cuenta con ese nombre.";
  }

  if (
    code === "23503" ||
    message.includes("foreign key") ||
    message.includes("violates foreign key")
  ) {
    return "No puedes eliminar una cuenta con transacciones asociadas. Desactívala en su lugar.";
  }

  if (message.includes("row-level security") || message.includes("rls")) {
    return "No tienes permiso para realizar esta acción.";
  }

  return "No pudimos completar la operación. Inténtalo de nuevo.";
}
