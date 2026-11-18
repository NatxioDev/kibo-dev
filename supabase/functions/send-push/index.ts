/**
 * send-push (KIBO-100): entrega push de una notificación ya persistida.
 *
 * Lo invoca el servidor de Next justo después de crear la notificación.
 * Es idempotente: solo procesa filas en `pending`, así que reintentar es seguro.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

import { classifyPushStatus } from "./classify.ts";
import { buildPushPayload, type PushNotificationRow } from "./payload.ts";
import { vapidKeysFromJwk, type VapidKeys } from "./vapid.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RETRY_DELAY_MS = 5 * 60 * 1000;

type NotificationRow = PushNotificationRow & {
  user_id: string;
  push_status: string;
};

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  failure_count: number;
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function safeEqual(left: string | null, right: string): boolean {
  if (!left || left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function readVapidKeys(): VapidKeys | null {
  const raw = Deno.env.get("VAPID_KEYS_JWK");
  if (!raw) {
    return null;
  }

  try {
    return vapidKeysFromJwk(JSON.parse(raw));
  } catch {
    return null;
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  const secret = Deno.env.get("PUSH_DISPATCH_SECRET");
  const bearer = request.headers.get("authorization")?.replace(/^Bearer /i, "") ?? null;
  if (!secret || !safeEqual(bearer, secret)) {
    return new Response(null, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    notificationId?: unknown;
  } | null;
  if (typeof body?.notificationId !== "string" || !UUID.test(body.notificationId)) {
    return json({ error: "notificationId inválido" }, 400);
  }

  const notificationId = body.notificationId;
  const vapidKeys = readVapidKeys();
  if (!vapidKeys) {
    console.error("[send-push] VAPID_KEYS_JWK ausente o inválida");
    return json({ error: "push no configurado" }, 500);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SECRET_KEY");
  if (!supabaseUrl || !serviceKey) {
    console.error("[send-push] faltan credenciales de Supabase");
    return json({ error: "push no configurado" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: notification, error: loadError } = await supabase
    .from("notifications")
    .select("id,user_id,title,body,url,tag,data,push_status")
    .eq("id", notificationId)
    .maybeSingle<NotificationRow>();

  if (loadError) {
    console.error("[send-push] no se pudo leer la notificación", loadError.message);
    return json({ error: "no se pudo leer la notificación" }, 500);
  }

  if (!notification) {
    return json({ status: "not_found" }, 404);
  }

  if (notification.push_status !== "pending") {
    return json({ status: "skipped", reason: notification.push_status });
  }

  // Claim atómico: dos invocaciones simultáneas no envían dos veces.
  const { data: claimed, error: claimError } = await supabase
    .from("notifications")
    .update({ push_status: "sending" })
    .eq("id", notificationId)
    .eq("push_status", "pending")
    .select("id");

  if (claimError) {
    console.error("[send-push] no se pudo reclamar la notificación", claimError.message);
    return json({ error: "no se pudo reclamar la notificación" }, 500);
  }

  if (!claimed || claimed.length === 0) {
    return json({ status: "skipped", reason: "claimed" });
  }

  const { data: subscriptions, error: subscriptionError } = await supabase
    .from("push_subscriptions")
    .select("id,endpoint,p256dh,auth,failure_count")
    .eq("user_id", notification.user_id)
    .returns<SubscriptionRow[]>();

  if (subscriptionError) {
    console.error("[send-push] no se pudieron leer las suscripciones", subscriptionError.message);
    await supabase
      .from("notifications")
      .update({ push_status: "failed" })
      .eq("id", notificationId);
    return json({ error: "no se pudieron leer las suscripciones" }, 500);
  }

  if (!subscriptions || subscriptions.length === 0) {
    await supabase
      .from("notifications")
      .update({ push_status: "skipped", push_next_attempt_at: null })
      .eq("id", notificationId);
    return json({ status: "skipped", reason: "sin dispositivos" });
  }

  const subject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:hola@usekibo.app";
  webpush.setVapidDetails(subject, vapidKeys.publicKey, vapidKeys.privateKey);

  const payload = buildPushPayload(notification);
  const results = await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          payload,
        );
        return { subscription, outcome: "delivered" as const, status: 201 };
      } catch (cause) {
        const status = (cause as { statusCode?: unknown }).statusCode;
        const code = typeof status === "number" ? status : 0;
        return { subscription, outcome: classifyPushStatus(code), status: code };
      }
    }),
  );

  const delivered = results.filter((result) => result.outcome === "delivered");
  const gone = results.filter((result) => result.outcome === "gone");
  const retry = results.filter((result) => result.outcome === "retry");

  for (const result of retry) {
    console.error("[send-push] envío fallido", {
      notificationId,
      subscriptionId: result.subscription.id,
      status: result.status,
    });
  }

  if (delivered.length > 0) {
    await supabase
      .from("push_subscriptions")
      .update({ last_used_at: new Date().toISOString(), failure_count: 0 })
      .in(
        "id",
        delivered.map((result) => result.subscription.id),
      );
  }

  if (gone.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in(
        "id",
        gone.map((result) => result.subscription.id),
      );
  }

  await Promise.all(
    retry.map((result) =>
      supabase
        .from("push_subscriptions")
        .update({ failure_count: result.subscription.failure_count + 1 })
        .eq("id", result.subscription.id),
    ),
  );

  const status = delivered.length > 0 ? "sent" : "failed";
  await supabase
    .from("notifications")
    .update({
      push_status: status,
      push_next_attempt_at:
        status === "sent"
          ? null
          : new Date(Date.now() + RETRY_DELAY_MS).toISOString(),
    })
    .eq("id", notificationId);

  return json({
    status,
    delivered: delivered.length,
    gone: gone.length,
    retried: retry.length,
  });
});
