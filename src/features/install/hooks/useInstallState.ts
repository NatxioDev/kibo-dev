"use client";

import { useSyncExternalStore } from "react";
import {
  getInstallPrompt,
  subscribeInstallPrompt,
} from "@/features/install/installPromptStore";
import {
  detectPlatform,
  isInAppBrowser,
  isStandalone,
  type InstallPlatform,
} from "@/features/install/platform";

const noopSubscribe = () => () => {};

function subscribeDisplayMode(listener: () => void) {
  const query = window.matchMedia("(display-mode: standalone)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

export function useInstallState() {
  const platform = useSyncExternalStore<InstallPlatform | null>(
    noopSubscribe,
    detectPlatform,
    () => null,
  );
  const inAppBrowser = useSyncExternalStore(noopSubscribe, isInAppBrowser, () => false);
  const standalone = useSyncExternalStore(subscribeDisplayMode, isStandalone, () => false);
  const canPrompt = useSyncExternalStore(
    subscribeInstallPrompt,
    () => getInstallPrompt() !== null,
    () => false,
  );

  return { platform, inAppBrowser, standalone, canPrompt };
}
