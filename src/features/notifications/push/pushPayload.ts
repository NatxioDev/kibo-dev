/**
 * Contrato del payload de Web Push: lo lee el Service Worker al recibir y lo
 * arma la Edge Function `send-push` (KIBO-100). Sin imports a propósito:
 * este módulo se bundlea dentro del Service Worker.
 */
export type PushPayload = {
  title: string;
  body: string;
  url: string;
  /** Único por notificación (p. ej. el id): un tag repetido reemplaza la anterior en vez de avisar. */
  tag?: string;
  data: Record<string, unknown>;
};

const MAX_TITLE = 80;
const MAX_BODY = 200;
const MAX_TAG = 64;
const FALLBACK_URL = "/notifications";

/** Un push siempre debe mostrar algo: Chrome penaliza los que no lo hacen. */
export const GENERIC_PUSH: PushPayload = {
  title: "Kibo",
  body: "Tienes novedades.",
  url: FALLBACK_URL,
  data: {},
};

function truncate(value: string, max: number): string {
  const chars = Array.from(value);
  return chars.length > max ? chars.slice(0, max).join("") : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Solo devuelve rutas del propio sitio: un push nunca debe poder abrir otro
 * dominio. El deep link conserva query y hash.
 */
export function resolveNotificationUrl(raw: unknown, origin: string): string {
  if (typeof raw !== "string" || !raw.trim()) {
    return FALLBACK_URL;
  }

  let url: URL;
  try {
    url = new URL(raw.trim(), origin);
  } catch {
    return FALLBACK_URL;
  }

  if (url.origin !== origin) {
    return FALLBACK_URL;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function parsePushPayload(raw: unknown, origin: string): PushPayload {
  if (!isRecord(raw)) {
    return { ...GENERIC_PUSH };
  }

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) {
    return { ...GENERIC_PUSH };
  }

  const rawTag = typeof raw.tag === "string" ? raw.tag.trim() : "";
  const body = typeof raw.body === "string" ? raw.body.trim() : "";

  return {
    title: truncate(title, MAX_TITLE),
    body: truncate(body, MAX_BODY),
    url: resolveNotificationUrl(raw.url, origin),
    ...(rawTag ? { tag: truncate(rawTag, MAX_TAG) } : {}),
    data: isRecord(raw.data) ? raw.data : {},
  };
}
