/**
 * Estado de Push en el dispositivo actual. La UI de /settings/notifications
 * se deriva de acá; KIBO-98.
 */
export type PushSupportState =
  | "in-app-browser"
  | "ios-not-installed"
  | "unsupported"
  | "unconfigured"
  | "denied"
  | "subscribed"
  | "available";

export type PushSupportInput = {
  inAppBrowser: boolean;
  isIos: boolean;
  standalone: boolean;
  hasNotification: boolean;
  hasPushManager: boolean;
  hasServiceWorker: boolean;
  hasVapidKey: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
};

export function resolvePushSupportState(
  input: PushSupportInput,
): PushSupportState {
  if (input.inAppBrowser) {
    return "in-app-browser";
  }

  // En iOS el PushManager solo existe con la PWA instalada; sin eso el
  // mensaje correcto es "instalá Kibo", no "tu navegador no soporta".
  if (input.isIos && !input.standalone) {
    return "ios-not-installed";
  }

  if (!input.hasNotification || !input.hasPushManager || !input.hasServiceWorker) {
    return "unsupported";
  }

  if (!input.hasVapidKey) {
    return "unconfigured";
  }

  if (input.permission === "denied") {
    return "denied";
  }

  if (input.permission === "granted" && input.subscribed) {
    return "subscribed";
  }

  return "available";
}
