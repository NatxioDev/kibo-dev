export type InstallPlatform = "ios" | "android" | "desktop";

export function detectPlatform(): InstallPlatform {
  const ua = navigator.userAgent;
  const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(ua) || isIPadOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isInAppBrowser(): boolean {
  return /FBAN|FBAV|Instagram|Line\/|TikTok|Twitter|WhatsApp/i.test(navigator.userAgent);
}
