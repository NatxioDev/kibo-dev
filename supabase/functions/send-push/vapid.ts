/**
 * VAPID en el formato que espera `web-push`, derivado del JWK P-256 que vive
 * en Supabase secrets (`VAPID_KEYS_JWK`). Sin APIs de Deno: se testea con vitest.
 */
export type VapidKeys = {
  publicKey: string;
  privateKey: string;
};

const P256_BYTES = 32;
const UNCOMPRESSED_PREFIX = 4;

export function base64UrlToBytes(value: string): Uint8Array | null {
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

function bytesToBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** `applicationServerKey` es el punto sin comprimir: 0x04 || x || y. */
export function vapidKeysFromJwk(jwk: unknown): VapidKeys | null {
  if (typeof jwk !== "object" || jwk === null) {
    return null;
  }

  const { kty, crv, x, y, d } = jwk as Record<string, unknown>;
  if (kty !== "EC" || crv !== "P-256") {
    return null;
  }

  if (typeof x !== "string" || typeof y !== "string" || typeof d !== "string") {
    return null;
  }

  const xBytes = base64UrlToBytes(x);
  const yBytes = base64UrlToBytes(y);
  const dBytes = base64UrlToBytes(d);

  if (
    !xBytes ||
    !yBytes ||
    !dBytes ||
    xBytes.length !== P256_BYTES ||
    yBytes.length !== P256_BYTES ||
    dBytes.length !== P256_BYTES
  ) {
    return null;
  }

  const publicBytes = new Uint8Array(1 + P256_BYTES * 2);
  publicBytes[0] = UNCOMPRESSED_PREFIX;
  publicBytes.set(xBytes, 1);
  publicBytes.set(yBytes, 1 + P256_BYTES);

  return { publicKey: bytesToBase64Url(publicBytes), privateKey: d };
}
