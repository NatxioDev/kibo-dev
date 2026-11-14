/** Ruta interna permitida después de OAuth. Evita redirecciones abiertas. */
export function safeInternalPath(
  value: string | null,
  allowedPaths: readonly string[],
): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\") || value.includes("://") || value.includes("%5c")) return null;
  const path = value.split("?")[0]?.split("#")[0] ?? "";
  if (!allowedPaths.includes(path)) return null;
  return value;
}
