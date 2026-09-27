import { Reveal } from "@/components/motion/Reveal";
import { StatCard } from "@/components/ui/StatCard";
import type { CurrencyCode } from "@/core/domain/value-objects";
import type { PersonBalance } from "@/features/splits/domain/models";
import { fromCents, toCents } from "@/features/splits/domain/splitAmount";

const CURRENCIES: CurrencyCode[] = ["BOB", "USD"];

export function FriendsDebtSummary({ people }: { people: PersonBalance[] }) {
  const active = CURRENCIES.flatMap((currency) => {
    let owedToMe = 0;
    let iOwe = 0;
    let touched = false;

    for (const person of people) {
      const balance = person.balances.find((item) => item.currency === currency);
      if (!balance) continue;
      touched = true;
      if (balance.net > 0) owedToMe += toCents(balance.net);
      if (balance.net < 0) iOwe += toCents(Math.abs(balance.net));
    }

    if (!touched || (owedToMe === 0 && iOwe === 0)) return [];
    return [{ currency, owedToMe: fromCents(owedToMe), iOwe: fromCents(iOwe) }];
  });

  const hasHistory = people.some((person) => person.hasHistory);
  if (!hasHistory && active.length === 0) return null;

  if (active.length === 0) {
    return (
      <Reveal>
        <p className="rounded-card border border-border bg-surface px-4 py-4 text-sm font-semibold text-foreground shadow-card">
          Con tus amigos están a mano
        </p>
      </Reveal>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {active.map((summary) => (
        <Reveal key={summary.currency} className="grid grid-cols-2 gap-3">
          <StatCard
            label="Te deben"
            amount={summary.owedToMe}
            currency={summary.currency}
            accent="income"
          />
          <StatCard
            label="Debes"
            amount={summary.iOwe}
            currency={summary.currency}
            accent="expense"
          />
        </Reveal>
      ))}
    </div>
  );
}
