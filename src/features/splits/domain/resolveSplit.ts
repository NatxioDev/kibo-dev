import type { CurrencyCode } from "@/core/domain/value-objects";
import type { ResolvedSplit, SplitDraft } from "@/features/splits/domain/models";
import {
  fromCents,
  sharesMatchTotal,
  splitEqual,
  toCents,
} from "@/features/splits/domain/splitAmount";

type ResolveInput = {
  totalAmount: number;
  currency: CurrencyCode;
  date: string;
  merchant: string | null;
  description: string | null;
  categoryId: string | null;
  paymentMethodId: string | null;
  draft: SplitDraft;
};

export function resolveSplitDraft(
  input: ResolveInput,
): { ok: true; split: ResolvedSplit } | { ok: false; error: string } {
  const friendIds = [...new Set(input.draft.friendIds)];
  if (friendIds.length === 0) {
    return { ok: false, error: "Elige al menos un amigo." };
  }
  if (friendIds.length > 30) {
    return { ok: false, error: "Puedes dividir con hasta 30 amigos." };
  }

  let payerAmount = 0;
  let participants: { userId: string; amount: number }[] = [];

  if (input.draft.mode === "equal") {
    const split = splitEqual(
      input.totalAmount,
      friendIds.length,
      input.draft.payerConsumes,
    );
    payerAmount = fromCents(split.payerCents);
    participants = friendIds.map((userId, index) => ({
      userId,
      amount: fromCents(split.friendCents[index] ?? 0),
    }));
  } else {
    const amounts = new Map(
      input.draft.friendAmounts.map((item) => [item.userId, item.amount]),
    );
    payerAmount = input.draft.payerConsumes ? input.draft.payerAmount : 0;
    participants = friendIds.map((userId) => ({
      userId,
      amount: amounts.get(userId) ?? 0,
    }));
  }

  if (input.draft.payerConsumes && toCents(payerAmount) <= 0) {
    return {
      ok: false,
      error: "Si también consumiste, tu parte tiene que ser mayor que 0.",
    };
  }

  if (participants.some((item) => toCents(item.amount) <= 0)) {
    return {
      ok: false,
      error: "Cada amigo tiene que tener un monto mayor que 0. Ajusta el reparto.",
    };
  }

  if (
    !sharesMatchTotal(
      input.totalAmount,
      payerAmount,
      participants.map((item) => item.amount),
    )
  ) {
    return {
      ok: false,
      error: "La suma de las partes tiene que ser el total. Revisa los montos.",
    };
  }

  return {
    ok: true,
    split: {
      totalAmount: input.totalAmount,
      currency: input.currency,
      date: input.date,
      merchant: input.merchant,
      description: input.description,
      payerConsumes: input.draft.payerConsumes,
      payerAmount,
      categoryId: input.categoryId,
      paymentMethodId: input.paymentMethodId,
      participants,
    },
  };
}

export function sameSplitAmounts(
  current: {
    totalAmount: number;
    currency: CurrencyCode;
    payerConsumes: boolean;
    payerAmount: number;
    participants: { userId: string; amount: number }[];
  },
  next: ResolvedSplit,
): boolean {
  if (current.currency !== next.currency) return false;
  if (toCents(current.totalAmount) !== toCents(next.totalAmount)) return false;
  if (current.payerConsumes !== next.payerConsumes) return false;
  if (toCents(current.payerAmount) !== toCents(next.payerAmount)) return false;
  if (current.participants.length !== next.participants.length) return false;
  const amounts = new Map(
    current.participants.map((item) => [item.userId, toCents(item.amount)]),
  );
  return next.participants.every(
    (item) => amounts.get(item.userId) === toCents(item.amount),
  );
}
