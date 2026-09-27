import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import type { CurrencyBalance } from "@/features/splits/domain/models";
import { toCents } from "@/features/splits/domain/splitAmount";

export function balanceLines(balances: CurrencyBalance[]): string[] {
  return balances.map((balance) => {
    if (toCents(balance.net) === 0) {
      return balance.inReview ? `${balance.currency} en revisión` : "Están a mano";
    }
    const amount = formatMoneyAmount(Math.abs(balance.net), balance.currency);
    const phrase = balance.net > 0 ? `Te debe ${amount}` : `Le debes ${amount}`;
    return balance.inReview ? `${phrase} · en revisión` : phrase;
  });
}
