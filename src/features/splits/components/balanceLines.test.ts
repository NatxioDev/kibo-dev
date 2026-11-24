import { describe, expect, it } from "vitest";
import { balanceToneClass } from "@/features/splits/components/balanceLines";
import type { CurrencyBalance } from "@/features/splits/domain/models";

function balance(currency: CurrencyBalance["currency"], net: number): CurrencyBalance {
  return { currency, net, theyCanPay: 0, iCanPay: 0, inReview: false };
}

describe("balanceToneClass", () => {
  it("colorea cada moneda por su propio saldo", () => {
    expect(balanceToneClass(balance("BOB", 50))).toBe("text-income");
    expect(balanceToneClass(balance("USD", -50))).toBe("text-expense");
    expect(balanceToneClass(balance("BOB", 0))).toBe("text-foreground");
  });
});
