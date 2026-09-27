import type { CurrencyCode } from "@/core/domain/value-objects";
import { fromCents, toCents } from "@/features/splits/domain/splitAmount";

export type BalanceEntry = {
  debtorId: string;
  creditorId: string;
  amount: number;
  currency: CurrencyCode;
};

export type BalanceShare = {
  userId: string;
  amount: number;
  status: "pending" | "classified" | "disputed" | "voided";
  currency: CurrencyCode;
  payerId: string;
  expenseStatus: "active" | "voided";
};

export type BalanceSettlement = {
  debtorId: string;
  creditorId: string;
  amount: number;
  currency: CurrencyCode;
  status: "pending" | "confirmed" | "rejected";
};

/** Positive means `other` owes `me`. */
export function signedNet(
  entries: BalanceEntry[],
  me: string,
  other: string,
  currency: CurrencyCode,
): number {
  let cents = 0;
  for (const entry of entries) {
    if (entry.currency !== currency) continue;
    if (entry.creditorId === me && entry.debtorId === other) {
      cents += toCents(entry.amount);
    } else if (entry.debtorId === me && entry.creditorId === other) {
      cents -= toCents(entry.amount);
    }
  }
  return fromCents(cents);
}

export function disputedCents(
  shares: BalanceShare[],
  me: string,
  other: string,
  currency: CurrencyCode,
): { theyOweMe: number; iOweThem: number } {
  let theyOweMe = 0;
  let iOweThem = 0;
  for (const share of shares) {
    if (share.status !== "disputed" || share.expenseStatus !== "active") continue;
    if (share.currency !== currency) continue;
    if (share.userId === other && share.payerId === me && share.userId !== me) {
      theyOweMe += toCents(share.amount);
    }
    if (share.userId === me && share.payerId === other) {
      iOweThem += toCents(share.amount);
    }
  }
  return { theyOweMe, iOweThem };
}

export function pendingPaymentCents(
  settlements: BalanceSettlement[],
  debtorId: string,
  creditorId: string,
  currency: CurrencyCode,
): number {
  let cents = 0;
  for (const settlement of settlements) {
    if (settlement.status !== "pending" || settlement.currency !== currency) continue;
    if (settlement.debtorId === debtorId && settlement.creditorId === creditorId) {
      cents += toCents(settlement.amount);
    }
  }
  return cents;
}

export type PairBalance = {
  currency: CurrencyCode;
  /** Positive: the other person owes me. */
  net: number;
  /** Positive: they can still pay me. */
  theyCanPay: number;
  /** Positive: I can still pay them. */
  iCanPay: number;
  inReview: boolean;
};

export function pairBalance(
  entries: BalanceEntry[],
  shares: BalanceShare[],
  settlements: BalanceSettlement[],
  me: string,
  other: string,
  currency: CurrencyCode,
): PairBalance {
  const net = signedNet(entries, me, other, currency);
  const disputed = disputedCents(shares, me, other, currency);
  const netCents = toCents(net);
  let settleable = netCents;
  if (netCents > 0) settleable = Math.max(0, netCents - disputed.theyOweMe);
  else if (netCents < 0) settleable = Math.min(0, netCents + disputed.iOweThem);
  else settleable = 0;

  const theyCanPay = Math.max(
    0,
    settleable - pendingPaymentCents(settlements, other, me, currency),
  );
  const iCanPay = Math.max(
    0,
    -settleable - pendingPaymentCents(settlements, me, other, currency),
  );

  return {
    currency,
    net,
    theyCanPay: fromCents(theyCanPay),
    iCanPay: fromCents(iCanPay),
    inReview: disputed.theyOweMe > 0 || disputed.iOweThem > 0,
  };
}
