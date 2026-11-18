import { detectPlatform, isInAppBrowser, isStandalone } from "@/features/install/platform";
import {
  subscribePushAction,
  unsubscribePushAction,
} from "@/features/notifications/actions/notification.action";
import type { PushSubscriptionInput } from "@/features/notifications/domain/models/Notification";
import {
  resolvePushSupportState,
  type PushSupportState,
} from "@/features/notifications/domain/pushSupport";
import {
  decodeVapidPublicKey,
  sameApplicationServerKey,
  VAPID_PUBLIC_KEY,
} from "@/features/notifications/domain/vapidKey";

const REGISTRATION_TIMEOUT_MS = 8000;
const RESYNC_KEY = "kibo-push-resync-at";
const RESYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

export type DevicePushSnapshot = {
  state: PushSupportState;
  subscription: PushSubscription | null;
};

export function getVapidPublicKey(): Uint8Array<ArrayBuffer> | null {
  return decodeVapidPublicKey(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY,
  );
}

function readEnvironment() {
  const hasNotification = "Notification" in window;

  return {
    inAppBrowser: isInAppBrowser(),
    isIos: detectPlatform() === "ios",
    standalone: isStandalone(),
    hasNotification,
    hasPushManager: "PushManager" in window,
    hasServiceWorker: "serviceWorker" in navigator,
    hasVapidKey: getVapidPublicKey() !== null,
    permission: (hasNotification
      ? Notification.permission
      : "default") as NotificationPermission,
  };
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  return (await navigator.serviceWorker.getRegistration().catch(() => null)) ?? null;
}

async function getActiveRegistration(): Promise<ServiceWorkerRegistration | null> {
  const registration = await getRegistration();
  if (!registration) {
    return null;
  }

  // `ready` nunca resuelve si el SW no llegó a activarse (por ejemplo en dev).
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), REGISTRATION_TIMEOUT_MS);
    }),
  ]);
}

export async function readDevicePushState(): Promise<DevicePushSnapshot> {
  const environment = readEnvironment();
  const key = getVapidPublicKey();
  let subscription: PushSubscription | null = null;

  const registration = await getRegistration();
  if (registration?.pushManager) {
    subscription = await registration.pushManager.getSubscription().catch(() => null);
  }

  const subscribed =
    subscription !== null &&
    key !== null &&
    sameApplicationServerKey(subscription.options.applicationServerKey, key);

  return {
    state: resolvePushSupportState({ ...environment, subscribed }),
    subscription,
  };
}

function toPayload(subscription: PushSubscription): PushSubscriptionInput | null {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    return null;
  }

  return {
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
    platform: detectPlatform(),
    userAgent: navigator.userAgent.slice(0, 512),
  };
}

export async function enableDevicePush(): Promise<void> {
  const key = getVapidPublicKey();
  if (!key) {
    throw new Error("Las notificaciones no están configuradas en este entorno.");
  }

  if (!("Notification" in window) || !("PushManager" in window)) {
    throw new Error("Tu navegador no soporta notificaciones.");
  }

  // Tiene que ejecutarse dentro del gesto: iOS rechaza el prompt si hay awaits antes.
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      "No diste permiso. Puedes activarlas desde los ajustes del navegador o del sistema.",
    );
  }

  const registration = await getActiveRegistration();
  if (!registration) {
    throw new Error("Kibo todavía no está listo. Recarga la página e inténtalo de nuevo.");
  }

  const current = await registration.pushManager.getSubscription();
  if (current && !sameApplicationServerKey(current.options.applicationServerKey, key)) {
    await current.unsubscribe();
  }

  const subscription =
    current && sameApplicationServerKey(current.options.applicationServerKey, key)
      ? current
      : await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });

  const payload = toPayload(subscription);
  if (!payload) {
    await subscription.unsubscribe().catch(() => {});
    throw new Error("Este dispositivo no devolvió una suscripción válida.");
  }

  const result = await subscribePushAction(payload);
  if (!result.success) {
    await subscription.unsubscribe().catch(() => {});
    throw new Error(result.error);
  }

  markResynced();
}

export async function disableDevicePush(): Promise<void> {
  const registration = await getRegistration();
  const subscription =
    registration?.pushManager
      ? await registration.pushManager.getSubscription().catch(() => null)
      : null;
  const endpoint = subscription?.toJSON().endpoint ?? null;

  // Primero se corta la entrega en el navegador: si la baja en DB falla,
  // el dispositivo deja de recibir pushes igual.
  await subscription?.unsubscribe().catch(() => {});
  if (endpoint) {
    await unsubscribePushAction(endpoint).catch(() => {});
  }
}

function isResyncFresh(): boolean {
  try {
    const last = Number(window.localStorage.getItem(RESYNC_KEY) ?? 0);
    return Number.isFinite(last) && Date.now() - last < RESYNC_INTERVAL_MS;
  } catch {
    return false;
  }
}

function markResynced(): void {
  try {
    window.localStorage.setItem(RESYNC_KEY, String(Date.now()));
  } catch {
    // Safari en modo privado bloquea localStorage; el resync simplemente se repite.
  }
}

/**
 * Latido diario: mantiene `last_seen_at` al día y borra la fila cuando el
 * usuario revocó el permiso. Se llama al abrir la app, nunca pide permiso.
 */
export async function resyncDevicePush(): Promise<void> {
  if (isResyncFresh()) {
    return;
  }

  const environment = readEnvironment();
  if (environment.permission === "default") {
    return;
  }

  const { state, subscription } = await readDevicePushState();

  if (environment.permission !== "granted") {
    if (subscription) {
      await disableDevicePush();
    }
    markResynced();
    return;
  }

  if (state !== "subscribed" || !subscription) {
    return;
  }

  const payload = toPayload(subscription);
  if (!payload) {
    return;
  }

  await subscribePushAction(payload).catch(() => {});
  markResynced();
}
