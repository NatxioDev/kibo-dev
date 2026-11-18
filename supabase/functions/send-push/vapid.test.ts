import { describe, expect, it } from "vitest";
import { base64UrlToBytes, vapidKeysFromJwk } from "./vapid";

function b64url(bytes: number[]): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const X = b64url(Array(32).fill(7));
const Y = b64url(Array(32).fill(9));
const D = b64url(Array(32).fill(3));

function jwk(overrides: Record<string, unknown> = {}) {
  return { kty: "EC", crv: "P-256", x: X, y: Y, d: D, ...overrides };
}

describe("vapidKeysFromJwk", () => {
  it("arma la pública sin comprimir y deja la privada en base64url", () => {
    const keys = vapidKeysFromJwk(jwk());

    expect(keys).not.toBeNull();
    expect(keys?.privateKey).toBe(D);

    const publicKey = base64UrlToBytes(keys?.publicKey ?? "");
    expect(publicKey).toHaveLength(65);
    expect(publicKey?.[0]).toBe(4);
    expect(Array.from(publicKey?.slice(1, 33) ?? [])).toEqual(
      Array.from(base64UrlToBytes(X) ?? []),
    );
    expect(Array.from(publicKey?.slice(33) ?? [])).toEqual(
      Array.from(base64UrlToBytes(Y) ?? []),
    );
  });

  it("rechaza un JWK incompleto o de otra curva", () => {
    const invalid: unknown[] = [
      null,
      undefined,
      "jwk",
      42,
      {},
      jwk({ kty: "RSA" }),
      jwk({ crv: "P-384" }),
      jwk({ d: undefined }),
      jwk({ y: undefined }),
      jwk({ x: "corto" }),
      jwk({ d: 7 }),
    ];

    for (const value of invalid) {
      expect(vapidKeysFromJwk(value)).toBeNull();
    }
  });
});
