import { describe, expect, it } from "vitest";
import { parseManualExpiry, parsePaymentQrLabel } from "@/features/payment-qr/domain/fields";
import { paymentQrCopySamples } from "@/features/payment-qr/domain/copy";
import { isRecentSignIn } from "@/features/payment-qr/domain/reauth";
import { validatePaymentQrFile } from "@/features/payment-qr/domain/validatePaymentQrFile";
import { paymentQrValidity, todayInBolivia } from "@/features/payment-qr/domain/validity";

describe("paymentQrValidity", () => {
  it("distingue vigente, vencido y vigencia desconocida", () => {
    expect(paymentQrValidity(null, "2026-11-14")).toBe("desconocida");
    expect(paymentQrValidity("2026-11-14", "2026-11-14")).toBe("vigente");
    expect(paymentQrValidity("2026-12-01", "2026-11-14")).toBe("vigente");
    expect(paymentQrValidity("2026-11-13", "2026-11-14")).toBe("vencido");
  });

  it("usa el día en Bolivia, no el día UTC", () => {
    expect(todayInBolivia(new Date("2026-11-15T03:30:00.000Z"))).toBe("2026-11-14");
    expect(todayInBolivia(new Date("2026-11-15T04:30:00.000Z"))).toBe("2026-11-15");
  });
});

describe("isRecentSignIn", () => {
  const now = new Date("2026-11-14T15:00:00.000Z");

  it("acepta un inicio de sesión dentro de 10 minutos", () => {
    expect(isRecentSignIn("2026-11-14T14:51:00.000Z", now)).toBe(true);
  });

  it("rechaza una sesión más vieja, ausente o futura", () => {
    expect(isRecentSignIn("2026-11-14T14:49:00.000Z", now)).toBe(false);
    expect(isRecentSignIn(null, now)).toBe(false);
    expect(isRecentSignIn("2026-11-14T15:05:00.000Z", now)).toBe(false);
  });
});

describe("campos del QR", () => {
  it("deja la etiqueta y la fecha vacías como nulas", () => {
    expect(parsePaymentQrLabel("  ")).toEqual({ ok: true, label: null });
    expect(parsePaymentQrLabel("Banco Unión")).toEqual({ ok: true, label: "Banco Unión" });
    expect(parseManualExpiry("")).toEqual({ ok: true, date: null });
  });

  it("rechaza etiqueta larga, saltos de línea y fechas imposibles", () => {
    expect(parsePaymentQrLabel("a".repeat(41)).ok).toBe(false);
    expect(parsePaymentQrLabel("ban\nco").ok).toBe(false);
    expect(parseManualExpiry("2026-02-31").ok).toBe(false);
    expect(parseManualExpiry("1999-01-01").ok).toBe(false);
    expect(parseManualExpiry("14/11/2026").ok).toBe(false);
  });
});

describe("validatePaymentQrFile", () => {
  it("acepta PNG, JPEG y WEBP sin reescribirlos", () => {
    const png = pngBytes(320, 320);
    const jpeg = jpegBytes(280, 280);
    const webp = webpBytes(256, 256);
    expect(validatePaymentQrFile(png)).toMatchObject({
      ok: true,
      mime: "image/png",
      extension: "png",
      width: 320,
      height: 320,
    });
    expect(validatePaymentQrFile(jpeg)).toMatchObject({
      ok: true,
      mime: "image/jpeg",
      width: 280,
      height: 280,
    });
    expect(validatePaymentQrFile(webp)).toMatchObject({
      ok: true,
      mime: "image/webp",
      width: 256,
      height: 256,
    });
  });

  it("rechaza SVG, archivos vacíos, imágenes chicas y archivos enormes", () => {
    expect(validatePaymentQrFile(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>")).ok).toBe(false);
    expect(validatePaymentQrFile(new Uint8Array()).ok).toBe(false);
    expect(validatePaymentQrFile(pngBytes(32, 32)).ok).toBe(false);
    const huge = new Uint8Array(2 * 1024 * 1024 + 1);
    huge.set(pngBytes(200, 200));
    expect(validatePaymentQrFile(huge).ok).toBe(false);
  });
});

describe("copy del QR", () => {
  it("no llama a la función pagos con Kibo, billetera ni cobros", () => {
    for (const text of paymentQrCopySamples()) {
      const lower = text.toLowerCase();
      expect(lower).not.toContain("pagos con kibo");
      expect(lower).not.toContain("billetera");
      expect(lower).not.toMatch(/\bcobros\b/);
    }
  });
});

function pngBytes(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  writeU32(bytes, 16, width);
  writeU32(bytes, 20, height);
  return bytes;
}

function jpegBytes(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(32);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  bytes[3] = 0xc0;
  bytes[4] = 0x00;
  bytes[5] = 0x11;
  bytes[6] = 0x08;
  bytes[7] = (height >> 8) & 0xff;
  bytes[8] = height & 0xff;
  bytes[9] = (width >> 8) & 0xff;
  bytes[10] = width & 0xff;
  return bytes;
}

function webpBytes(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(30);
  bytes.set(text("RIFF"), 0);
  bytes.set(text("WEBP"), 8);
  bytes.set(text("VP8X"), 12);
  const w = width - 1;
  const h = height - 1;
  bytes[24] = w & 0xff;
  bytes[25] = (w >> 8) & 0xff;
  bytes[26] = (w >> 16) & 0xff;
  bytes[27] = h & 0xff;
  bytes[28] = (h >> 8) & 0xff;
  bytes[29] = (h >> 16) & 0xff;
  return bytes;
}

function text(value: string): number[] {
  return [...value].map((char) => char.charCodeAt(0));
}

function writeU32(bytes: Uint8Array, offset: number, value: number) {
  bytes[offset] = (value >>> 24) & 0xff;
  bytes[offset + 1] = (value >>> 16) & 0xff;
  bytes[offset + 2] = (value >>> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
}
