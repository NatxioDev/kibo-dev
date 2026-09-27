const FACTOR = 100;

export function toCents(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(Number((amount * FACTOR).toPrecision(15)));
}

export function fromCents(cents: number): number {
  return cents / FACTOR;
}

export type EqualSplit = {
  payerCents: number;
  friendCents: number[];
};

/** Remainder cents stay with the payer, even when the payer is not consuming. */
export function splitEqual(
  totalAmount: number,
  friendCount: number,
  payerConsumes: boolean,
): EqualSplit {
  if (friendCount < 1) {
    throw new Error("Elige al menos un amigo.");
  }

  const totalCents = toCents(totalAmount);
  const slots = payerConsumes ? friendCount + 1 : friendCount;
  const base = Math.floor(totalCents / slots);
  const remainder = totalCents - base * slots;

  return {
    payerCents: payerConsumes ? base + remainder : remainder,
    friendCents: Array.from({ length: friendCount }, () => base),
  };
}

export function sharesMatchTotal(
  totalAmount: number,
  payerAmount: number,
  friendAmounts: number[],
): boolean {
  const total = toCents(totalAmount);
  if (total <= 0) return false;
  const sum =
    toCents(payerAmount) +
    friendAmounts.reduce((acc, amount) => acc + toCents(amount), 0);
  return total === sum;
}
