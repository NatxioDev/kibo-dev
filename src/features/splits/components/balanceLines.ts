import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import type { CurrencyBalance } from "@/features/splits/domain/models";
import { toCents } from "@/features/splits/domain/splitAmount";

export function balanceToneClass(balance: CurrencyBalance): string {
  const net = toCents(balance.net);
  if (net < 0) return "text-expense";
  if (net > 0) return "text-income";
  return "text-foreground";
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
