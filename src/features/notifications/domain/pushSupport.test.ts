import { describe, expect, it } from "vitest";
import {
  resolvePushSupportState,
  type PushSupportInput,
} from "@/features/notifications/domain/pushSupport";

function input(overrides: Partial<PushSupportInput> = {}): PushSupportInput {
  return {
    inAppBrowser: false,
    isIos: false,
    standalone: false,
    hasNotification: true,
    hasPushManager: true,
    hasServiceWorker: true,
    hasVapidKey: true,
    permission: "default",
    subscribed: false,
    ...overrides,
  };
}

describe("resolvePushSupportState", () => {
  it("un navegador in-app gana aunque falten APIs", () => {
    expect(
      resolvePushSupportState(
        input({ inAppBrowser: true, hasPushManager: false }),
      ),
    ).toBe("in-app-browser");
  });

  it("en iOS sin instalar pide instalar antes que decir 'no soportado'", () => {
    expect(
      resolvePushSupportState(
        input({ isIos: true, hasPushManager: false, hasServiceWorker: false }),
      ),
    ).toBe("ios-not-installed");
  });

  it("iOS instalado sin PushManager (Safari viejo) es unsupported", () => {
    expect(
      resolvePushSupportState(
        input({ isIos: true, standalone: true, hasPushManager: false }),
      ),
    ).toBe("unsupported");
  });

  it("sin la VAPID configurada no se puede activar", () => {
    expect(resolvePushSupportState(input({ hasVapidKey: false }))).toBe(
      "unconfigured",
    );
  });

  it("sin la VAPID configurada, unconfigured gana sobre denied", () => {
    expect(
      resolvePushSupportState(input({ permission: "denied", hasVapidKey: false })),
    ).toBe("unconfigured");
    expect(resolvePushSupportState(input({ permission: "denied" }))).toBe(
      "denied",
    );
  });

  it("permiso concedido con y sin subscription", () => {
    expect(
      resolvePushSupportState(input({ permission: "granted", subscribed: true })),
    ).toBe("subscribed");
    expect(
      resolvePushSupportState(input({ permission: "granted", subscribed: false })),
    ).toBe("available");
  });

  it("permiso por defecto queda disponible para activar", () => {
    expect(resolvePushSupportState(input({ permission: "default" }))).toBe(
      "available",
    );
  });
});
