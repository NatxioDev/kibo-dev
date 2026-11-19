import { describe, expect, it } from "vitest";
import { labelClassName } from "@/components/ui/Field";
import { hasExtraDetails } from "@/features/transactions/domain/formDetails";

describe("hasExtraDetails", () => {
  it("abre Más detalles solo si método, comercio o nota tienen valor", () => {
    expect(hasExtraDetails({})).toBe(false);
    expect(hasExtraDetails({ merchant: "   ", description: "" })).toBe(false);
    expect(hasExtraDetails({ paymentMethodId: "pm" })).toBe(true);
    expect(hasExtraDetails({ merchant: "Hipermaxi" })).toBe(true);
    expect(hasExtraDetails({ description: "almuerzo" })).toBe(true);
  });
});

describe("etiquetas de campo", () => {
  it("usa 14 px en sentence case, sin mayúsculas de 11 px", () => {
    expect(labelClassName).toContain("text-sm");
    expect(labelClassName).toContain("font-semibold");
    expect(labelClassName).not.toMatch(/uppercase/);
    expect(labelClassName).not.toContain("0.6875rem");
    expect(labelClassName).not.toContain("tracking");
  });
});
