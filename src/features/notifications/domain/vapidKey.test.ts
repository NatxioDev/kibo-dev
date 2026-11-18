import { describe, expect, it } from "vitest";
import {
  base64UrlToBytes,
  decodeVapidPublicKey,
  sameApplicationServerKey,
  VAPID_PUBLIC_KEY,
} from "@/features/notifications/domain/vapidKey";

describe("base64UrlToBytes", () => {
  it("decodifica base64url y base64 estándar", () => {
    const urlSafe = base64UrlToBytes("a-b_");
    const standard = base64UrlToBytes("a+b/");

    expect(urlSafe).toEqual(standard);
    expect(Array.from(urlSafe ?? [])).toEqual([107, 230, 255]);
  });

  it("ignora el padding y los espacios", () => {
    expect(base64UrlToBytes(" YQ== ")).toEqual(new Uint8Array([97]));
  });

  it("rechaza texto que no es base64", () => {
    expect(base64UrlToBytes("no es base64")).toBeNull();
    expect(base64UrlToBytes("")).toBeNull();
  });
});

describe("decodeVapidPublicKey", () => {
  it("acepta un punto P-256 sin comprimir", () => {
    const key = decodeVapidPublicKey(VAPID_PUBLIC_KEY);

    expect(key).not.toBeNull();
    expect(key?.length).toBe(65);
    expect(key?.[0]).toBe(4);
  });

  it("rechaza una key ausente, con prefijo incorrecto o de otro tamaño", () => {
    const withoutPrefix = "A" + VAPID_PUBLIC_KEY.slice(1);

    expect(decodeVapidPublicKey(undefined)).toBeNull();
    expect(decodeVapidPublicKey("")).toBeNull();
    expect(decodeVapidPublicKey(withoutPrefix)).toBeNull();
    expect(decodeVapidPublicKey(VAPID_PUBLIC_KEY.slice(0, -8))).toBeNull();
  });
});

describe("sameApplicationServerKey", () => {
  const expected = decodeVapidPublicKey(VAPID_PUBLIC_KEY)!;

  it("compara contra el ArrayBuffer que devuelve el navegador", () => {
    const buffer = expected.buffer.slice(
      expected.byteOffset,
      expected.byteOffset + expected.byteLength,
    ) as ArrayBuffer;

    expect(sameApplicationServerKey(buffer, expected)).toBe(true);
  });

  it("detecta que cambió la key o que no hay subscription", () => {
    const other = new Uint8Array(expected);
    other[64] = other[64] === 1 ? 2 : 1;

    expect(sameApplicationServerKey(null, expected)).toBe(false);
    expect(sameApplicationServerKey(other, expected)).toBe(false);
    expect(sameApplicationServerKey(expected.slice(0, 64), expected)).toBe(false);
  });
});
