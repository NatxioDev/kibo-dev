export function mapSplitError(error: { message: string; code?: string }): string {
  if (error.code === "P0001") {
    return error.message.replace(/^P0001:\s*/, "");
  }

  const message = error.message.toLowerCase();

  if (message.includes("row-level security") || message.includes("rls")) {
    return "No tienes permiso para realizar esta acción.";
  }

  if (message.includes("append-only")) {
    return "El historial de deudas no se puede borrar.";
  }

  if (error.code === "PGRST205" || message.includes("schema cache")) {
    return "Los gastos compartidos todavía no están listos. Vuelve a abrir la página en un momento.";
  }

  return "No pudimos completar la operación. Inténtalo de nuevo.";
}
