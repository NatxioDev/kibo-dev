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
