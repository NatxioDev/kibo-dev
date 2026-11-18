/**
 * `applicationServerKey` de Web Push: punto P-256 sin comprimir en base64url
 * (65 bytes, prefijo 0x04). Ver KIBO-98.
 */
const PUBLIC_KEY_BYTES = 65;
const UNCOMPRESSED_PREFIX = 4;

/**
 * Clave pública del par v1. Es pública por diseño: viaja a todos los navegadores,
 * así que vive en el código y no depende de variables de entorno del hosting.
 * Rotar el par obliga a reemplazarla acá y en `VAPID_KEYS_JWK` (Supabase).
 */
export const VAPID_PUBLIC_KEY =
  "BDyO4Pv64_uE0aEoSncAq1cUMUVZ9I-UStZ37vqYksd9CZWUTFLxnQeij7xUzO7MohBmQ0b7sIj4zEqtgtTPi6A";

export function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> | null {
  const normalized = value
    .trim()
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  if (!normalized || !/^[A-Za-z0-9_-]+$/.test(normalized)) {
    return null;
  }

  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);

  try {
    const binary = atob(
      normalized.replace(/-/g, "+").replace(/_/g, "/") + padding,
    );
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

/** Devuelve null si la clave falta o no tiene el formato que exige el navegador. */
export function decodeVapidPublicKey(
  value: string | undefined,
): Uint8Array<ArrayBuffer> | null {
  if (!value) {
    return null;
  }

  const bytes = base64UrlToBytes(value);
  if (!bytes || bytes.length !== PUBLIC_KEY_BYTES || bytes[0] !== UNCOMPRESSED_PREFIX) {
    return null;
  }

  return bytes;
}

/** Compara la key de una subscription existente con la configurada (rotación). */
export function sameApplicationServerKey(
  existing: ArrayBuffer | Uint8Array | null,
  expected: Uint8Array,
): boolean {
  if (!existing) {
    return false;
  }

  const bytes = existing instanceof Uint8Array ? existing : new Uint8Array(existing);
  if (bytes.length !== expected.length) {
    return false;
  }

  return bytes.every((byte, index) => byte === expected[index]);
}
