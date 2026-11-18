/// <reference lib="webworker" />
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  type PrecacheEntry,
  type RouteMatchCallbackOptions,
  type RuntimeCaching,
  Serwist,
  type SerwistGlobalConfig,
  StaleWhileRevalidate,
} from "serwist";
import {
  parsePushPayload,
  resolveNotificationUrl,
} from "@/features/notifications/push/pushPayload";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const LAUNCH_URL = "/launch.html";
const OFFLINE_URL = "/offline.html";

const DAY = 24 * 60 * 60;

// Anything that can carry user data or auth state must never reach Cache Storage.
const isPrivateRequest = ({ request, url, sameOrigin }: RouteMatchCallbackOptions) =>
  !sameOrigin ||
  request.mode === "navigate" ||
  request.headers.has("RSC") ||
  request.headers.has("Next-Router-State-Tree") ||
  request.headers.has("Next-Action") ||
  url.pathname.startsWith("/api/") ||
  url.pathname.startsWith("/auth/") ||
  url.pathname.startsWith("/login") ||
  url.pathname.startsWith("/onboarding");

const isPwaLaunch = ({ request, url, sameOrigin }: RouteMatchCallbackOptions) =>
  sameOrigin &&
  request.mode === "navigate" &&
  url.pathname === "/" &&
  url.searchParams.get("source") === "pwa";

const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: isPwaLaunch,
    handler: async ({ request }) =>
      (await serwist.matchPrecache(LAUNCH_URL)) ?? fetch(request),
  },
  {
    matcher: ({ url, sameOrigin }) =>
      !sameOrigin && url.hostname === "lh3.googleusercontent.com",
    handler: new StaleWhileRevalidate({
      cacheName: "avatars",
      plugins: [new ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 7 * DAY })],
    }),
  },
  {
    matcher: isPrivateRequest,
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
    handler: new CacheFirst({
      cacheName: "next-static",
      plugins: [new ExpirationPlugin({ maxEntries: 128, maxAgeSeconds: 30 * DAY })],
    }),
  },
  {
    matcher: ({ url }) =>
      url.pathname.startsWith("/_next/image") ||
      url.pathname.startsWith("/brand/") ||
      /\.(?:woff2?|ttf|otf)$/i.test(url.pathname),
    handler: new StaleWhileRevalidate({
      cacheName: "static-assets",
      plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 30 * DAY })],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  // Off on purpose: a preload for `/?source=pwa` would render the dashboard
  // in parallel with the redirect that launch.html performs.
  navigationPreload: false,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: OFFLINE_URL,
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();

const NOTIFICATION_ICON = "/brand/app-icon-192-v3.png";

function readPushData(data: PushMessageData | null): unknown {
  if (!data) {
    return null;
  }

  try {
    return data.json();
  } catch {
    return null;
  }
}

/** Reutiliza una pestaña de Kibo si existe; si no, abre una nueva en el deep link. */
async function focusOrOpenWindow(path: string): Promise<void> {
  const target = new URL(path, self.location.origin);
  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of windows) {
    if (new URL(client.url).origin !== target.origin) {
      continue;
    }

    const windowClient = client as WindowClient;
    const focused = await windowClient.focus();
    if (focused && focused.url !== target.href) {
      await focused.navigate(target.href).catch(() => {});
    }
    return;
  }

  await self.clients.openWindow(target.href);
}

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(readPushData(event.data), self.location.origin);

  // `renotify` es estándar pero falta en los tipos de lib.webworker.
  const options: NotificationOptions & { renotify?: boolean } = {
    body: payload.body,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    tag: payload.tag,
    // Sin `tag` no hay reemplazo que anunciar.
    renotify: Boolean(payload.tag),
    data: { ...payload.data, url: payload.url },
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data as { url?: unknown } | null;
  const url = resolveNotificationUrl(data?.url, self.location.origin);

  event.waitUntil(focusOrOpenWindow(url));
});
