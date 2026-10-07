"use client";

import { SerwistProvider } from "@serwist/turbopack/react";

export function ServiceWorkerRegistrar() {
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV !== "production"}
      // Runtime-caching visited pages would store authenticated HTML.
      cacheOnNavigation={false}
      reloadOnOnline={false}
    />
  );
}
