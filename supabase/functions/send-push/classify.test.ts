import { describe, expect, it } from "vitest";
import { classifyPushStatus } from "./classify";

describe("classifyPushStatus", () => {
  it("marca entregado cuando el servicio acepta el push", () => {
    expect(classifyPushStatus(200)).toBe("delivered");
    expect(classifyPushStatus(201)).toBe("delivered");
  });

  it("borra el dispositivo cuando el endpoint ya no existe", () => {
    expect(classifyPushStatus(404)).toBe("gone");
    expect(classifyPushStatus(410)).toBe("gone");
  });

  it("reintenta ante límite de tasa, caída del servicio o timeout", () => {
    expect(classifyPushStatus(429)).toBe("retry");
    expect(classifyPushStatus(500)).toBe("retry");
    expect(classifyPushStatus(503)).toBe("retry");
    expect(classifyPushStatus(0)).toBe("retry");
  });

  it("no borra el dispositivo si el problema es de nuestra configuración", () => {
    expect(classifyPushStatus(401)).toBe("retry");
    expect(classifyPushStatus(403)).toBe("retry");
  });
});
