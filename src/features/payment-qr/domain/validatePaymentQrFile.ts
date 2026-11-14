import {
  PAYMENT_QR_MAX_BYTES,
  PAYMENT_QR_MAX_DIMENSION,
  PAYMENT_QR_MIN_DIMENSION,
  type PaymentQrExtension,
  type PaymentQrMime,
} from "@/features/payment-qr/domain/constants";

export type ValidatedPaymentQrFile = {
  ok: true;
  mime: PaymentQrMime;
  extension: PaymentQrExtension;
  width: number;
  height: number;
};

export type PaymentQrFileResult =
  | ValidatedPaymentQrFile
  | { ok: false; error: string };

const TYPE_ERROR =
  "Usa una imagen PNG, JPG o WEBP de hasta 2 MB. Kibo no modifica el archivo.";
const DIMENSION_ERROR =
  "La imagen es muy chica o demasiado grande. Usa una de entre 100 y 4096 píxeles, sin recortar el QR.";
const UNREADABLE_ERROR =
  "No pudimos leer esa imagen. Prueba con PNG o JPG, sin editar el QR.";

/**
 * Valida magic bytes, tamaño y dimensiones.
 * No reescribe ni decodifica el contenido del QR: solo lee la cabecera del contenedor.
 */
export function validatePaymentQrFile(bytes: Uint8Array): PaymentQrFileResult {
  if (bytes.byteLength === 0 || bytes.byteLength > PAYMENT_QR_MAX_BYTES) {
    return { ok: false, error: TYPE_ERROR };
  }

  const png = pngSize(bytes);
  const jpeg = png ? null : jpegSize(bytes);
  const webp = png || jpeg ? null : webpSize(bytes);
  const size = png ?? jpeg ?? webp;
  if (!size) {
    const looksLikeImage = isPng(bytes) || isJpeg(bytes) || isWebp(bytes);
    return { ok: false, error: looksLikeImage ? UNREADABLE_ERROR : TYPE_ERROR };
  }

  if (
    size.width < PAYMENT_QR_MIN_DIMENSION ||
    size.height < PAYMENT_QR_MIN_DIMENSION ||
    size.width > PAYMENT_QR_MAX_DIMENSION ||
    size.height > PAYMENT_QR_MAX_DIMENSION
  ) {
    return { ok: false, error: DIMENSION_ERROR };
  }

  if (png) return { ok: true, mime: "image/png", extension: "png", ...size };
  if (jpeg) return { ok: true, mime: "image/jpeg", extension: "jpg", ...size };
  return { ok: true, mime: "image/webp", extension: "webp", ...size };
}

function isPng(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isWebp(bytes: Uint8Array): boolean {
  return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP";
}

function pngSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (!isPng(bytes) || bytes.length < 24) return null;
  if (ascii(bytes, 12, 4) !== "IHDR") return null;
  return { width: readU32BE(bytes, 16), height: readU32BE(bytes, 20) };
}

function jpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (!isJpeg(bytes)) return null;
  let offset = 2;
  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) return null;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) return null;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
    if (offset + 1 >= bytes.length) return null;
    const length = (bytes[offset] << 8) | bytes[offset + 1];
    if (length < 2 || offset + length > bytes.length) return null;
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof) {
      if (length < 7) return null;
      const height = (bytes[offset + 3] << 8) | bytes[offset + 4];
      const width = (bytes[offset + 5] << 8) | bytes[offset + 6];
      if (width <= 0 || height <= 0) return null;
      return { width, height };
    }
    offset += length;
  }
  return null;
}

function webpSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (!isWebp(bytes) || bytes.length < 30) return null;
  const chunk = ascii(bytes, 12, 4);
  if (chunk === "VP8X") {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return positive(width, height);
  }
  if (chunk === "VP8L") {
    if (bytes[20] !== 0x2f) return null;
    const bits =
      bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return positive(width, height);
  }
  if (chunk === "VP8 ") {
    const start = 23;
    if (bytes.length < start + 7) return null;
    if (bytes[start] !== 0x9d || bytes[start + 1] !== 0x01 || bytes[start + 2] !== 0x2a) {
      return null;
    }
    const width = (bytes[start + 3] | (bytes[start + 4] << 8)) & 0x3fff;
    const height = (bytes[start + 5] | (bytes[start + 6] << 8)) & 0x3fff;
    return positive(width, height);
  }
  return null;
}

function positive(width: number, height: number): { width: number; height: number } | null {
  if (width <= 0 || height <= 0) return null;
  return { width, height };
}

function readU32BE(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>>
    0
  );
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  if (offset + length > bytes.length) return "";
  let text = "";
  for (let index = 0; index < length; index += 1) {
    text += String.fromCharCode(bytes[offset + index]);
  }
  return text;
}
