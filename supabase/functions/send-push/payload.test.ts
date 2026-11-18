import { describe, expect, it } from "vitest";
import { buildPushPayload, type PushNotificationRow } from "./payload";

function row(overrides: Partial<PushNotificationRow> = {}): PushNotificationRow {
  return {
    id: "n-1",
    title: "Nuevo cobro",
    body: "Ana te creó un cobro",
    url: "/friends/ana",
    tag: "tag-n-1",
    data: { actorId: "u-2" },
    ...overrides,
  };
}

describe("buildPushPayload", () => {
  it("serializa el contrato que espera el service worker", () => {
    expect(JSON.parse(buildPushPayload(row()))).toEqual({
      title: "Nuevo cobro",
      body: "Ana te creó un cobro",
      url: "/friends/ana",
      tag: "tag-n-1",
      data: { actorId: "u-2", notificationId: "n-1" },
    });
  });

  it("siempre manda data como objeto, aunque la fila traiga otra cosa", () => {
    for (const data of [null, [], "texto", 7]) {
      const payload = JSON.parse(
        buildPushPayload(row({ data: data as never })),
      );

      expect(payload.data).toEqual({ notificationId: "n-1" });
    }
  });

  it("no modifica la fila original", () => {
    const notification = row();
    const snapshot = structuredClone(notification);

    buildPushPayload(notification);

    expect(notification).toEqual(snapshot);
  });
});
