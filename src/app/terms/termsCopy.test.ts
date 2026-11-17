import { describe, expect, it } from "vitest";
import { termsCopySamples } from "@/app/terms/termsCopy";

describe("copy de los términos", () => {
  it("no presenta el servicio como pagos con Kibo, billetera ni cobros", () => {
    const samples = termsCopySamples();
    expect(samples.length).toBeGreaterThan(10);
    for (const text of samples) {
      const lower = text.toLowerCase();
      expect(lower).not.toContain("pagos con kibo");
      expect(lower).not.toContain("billetera");
      expect(lower).not.toMatch(/\bcobros\b/);
    }
  });
});
