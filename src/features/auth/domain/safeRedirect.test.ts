import { describe, expect, it } from "vitest";
import { safeInternalPath } from "@/features/auth/domain/safeRedirect";

const allowed = ["/settings/qr"];

describe("safeInternalPath", () => {
  it("permite la pantalla del QR y rechaza destinos externos", () => {
    expect(safeInternalPath("/settings/qr", allowed)).toBe("/settings/qr");
    expect(safeInternalPath("/settings/qr?listo=1", allowed)).toBe("/settings/qr?listo=1");
    expect(safeInternalPath("https://evil.example", allowed)).toBeNull();
    expect(safeInternalPath("//evil.example", allowed)).toBeNull();
    expect(safeInternalPath("/settings/profile", allowed)).toBeNull();
    expect(safeInternalPath("/settings/qr-otro", allowed)).toBeNull();
  });
});