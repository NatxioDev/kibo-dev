import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import type {
  CurrencyBalance,
  PersonBalance,
} from "@/features/splits/domain/models";
import { toCents } from "@/features/splits/domain/splitAmount";

export function balanceToneClass(balances: CurrencyBalance[]): string {
  if (balances.some((balance) => toCents(balance.net) < 0)) return "text-expense";
  if (balances.some((balance) => toCents(balance.net) > 0)) return "text-income";
  return "text-foreground";
}

export function hasPendingBalance(balance: PersonBalance | undefined): boolean {
  return Boolean(
    balance?.pendingSettlement ||
      balance?.balances.some((item) => toCents(item.net) !== 0),
  );
}

export function balanceLines(balances: CurrencyBalance[]): string[] {
  return balances.map((balance) => {
    if (toCents(balance.net) === 0) {
      return balance.inReview ? `${balance.currency} en disputa` : "Están a mano";
    }
    const amount = formatMoneyAmount(Math.abs(balance.net), balance.currency);
    const phrase = balance.net > 0 ? `Te debe ${amount}` : `Le debes ${amount}`;
    return balance.inReview ? `${phrase} · en disputa` : phrase;
  });
}
