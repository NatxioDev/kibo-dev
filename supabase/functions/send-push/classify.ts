/**
 * Qué hacer con una subscription según la respuesta del servicio de push.
 * `gone` es el único caso en que se borra el dispositivo.
 */
export type PushOutcome = "delivered" | "gone" | "retry";

export function classifyPushStatus(status: number): PushOutcome {
  if (status === 200 || status === 201) {
    return "delivered";
  }

  if (status === 404 || status === 410) {
    return "gone";
  }

  // 401/403 son de nuestra configuración (VAPID), no del dispositivo:
  // se reintenta en vez de borrar la suscripción del usuario.
  return "retry";
}
