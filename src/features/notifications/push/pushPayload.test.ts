import { describe, expect, it } from "vitest";
import {
  GENERIC_PUSH,
  parsePushPayload,
  resolveNotificationUrl,
} from "@/features/notifications/push/pushPayload";

const ORIGIN = "https://usekibo.app";

describe("parsePushPayload", () => {
  it("acepta el payload que manda el servidor", () => {
    const payload = parsePushPayload(
      {
        title: "Nuevo cobro",
        body: "Ana te creó un cobro",
        url: "/friends/ana",
        tag: "shared-expense-1",
        data: { notificationId: "n-1" },
      },
      ORIGIN,
    );

    expect(payload).toEqual({
      title: "Nuevo cobro",
      body: "Ana te creó un cobro",
      url: "/friends/ana",
      tag: "shared-expense-1",
      data: { notificationId: "n-1" },
    });
  });

  it("cae en una notificación genérica si el payload no sirve", () => {
    for (const raw of [null, undefined, "texto", 42, [], {}, { title: "" }, { title: "   " }, { title: 7 }]) {
      expect(parsePushPayload(raw, ORIGIN)).toEqual(GENERIC_PUSH);
    }
  });

  it("recorta título y cuerpo para que no rompan la notificación", () => {
    const payload = parsePushPayload(
      { title: "a".repeat(200), body: "b".repeat(500) },
      ORIGIN,
    );

    expect(payload.title.length).toBe(80);
    expect(payload.body.length).toBe(200);
  });

  it("mantiene la URL dentro del sitio aunque el payload traiga otra cosa", () => {
    const external = parsePushPayload(
      { title: "Hola", url: "https://evil.example/phishing" },
      ORIGIN,
    );
    const javascript = parsePushPayload(
      { title: "Hola", url: "javascript:alert(1)" },
      ORIGIN,
    );

    expect(external.url).toBe("/notifications");
    expect(javascript.url).toBe("/notifications");
  });
});

describe("resolveNotificationUrl", () => {
  it("respeta el deep link con query y hash", () => {
    expect(resolveNotificationUrl("/transactions/abc?tab=1#pago", ORIGIN)).toBe(
      "/transactions/abc?tab=1#pago",
    );
  });

  it("normaliza una URL absoluta del mismo sitio a una ruta", () => {
    expect(resolveNotificationUrl(`${ORIGIN}/settings`, ORIGIN)).toBe("/settings");
  });

  it("cae en /notifications si falta o apunta afuera", () => {
    for (const raw of [
      undefined,
      null,
      "",
      "   ",
      "//evil.example/x",
      "https://evil.example/x",
      "javascript:alert(1)",
      "data:text/html,<h1>x</h1>",
    ]) {
      expect(resolveNotificationUrl(raw, ORIGIN)).toBe("/notifications");
    }
  });
});
