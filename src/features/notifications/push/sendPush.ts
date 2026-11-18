import "server-only";

/**
 * Dispara la entrega push de una notificación ya persistida (KIBO-100).
 * Se espera la respuesta: en serverless una promesa suelta se corta al responder.
 * Nunca lanza: el push es un canal, no la operación de negocio.
 */
export async function sendPush(notificationId: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.PUSH_DISPATCH_SECRET;
  if (!baseUrl || !secret) {
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/functions/v1/send-push`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ notificationId }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error("[send-push] respuesta", response.status, notificationId);
    }
  } catch (cause) {
    console.error("[send-push] no se pudo invocar", notificationId, cause);
  }
}
