import { notFound } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { ListGroup, ListRow } from "@/components/ui/ListGroup";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListFriendships } from "@/features/friends/application/ListFriendships.application";
import { friendName } from "@/features/friends/components/FriendRow";
import { RemoveFriendSection } from "@/features/friends/components/RemoveFriendSection";
import { DebtPaymentQr } from "@/features/payment-qr/components/DebtPaymentQr";
import { balanceLines, balanceToneClass } from "@/features/splits/components/balanceLines";
import { SettlementPanel } from "@/features/splits/components/SettlementPanel";
import { toCents } from "@/features/splits/domain/splitAmount";
import { formatMoneyAmount, formatTransactionDate } from "@/features/transactions/components/formatters";

export const metadata = {
  robots: { index: false, follow: false },
};

type FriendDetailPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function FriendDetailPage({ params }: FriendDetailPageProps) {
  const { userId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(userId)) notFound();

  const { splitRepository, friendshipRepository } = await createServerDependencies();
  const [result, friendships] = await Promise.all([
    splitRepository.friendDetail(userId),
    new ListFriendships(friendshipRepository).execute(),
  ]);
  if (!result.success) {
    if (result.error === "No encontramos a esa persona.") notFound();
    return (
      <PageShell>
        <PageHeader back={{ href: "/friends", label: "Amigos" }} title="Amigo" />
        <Alert>{result.error}</Alert>
      </PageShell>
    );
  }

  const { profile, balances, history, pendingSettlements, isFriend } = result.data;
  const name = friendName(profile);
  const lines = balanceLines(balances);
  const owed = balances.filter((balance) => toCents(balance.net) < 0);
  const balanceHint =
    owed.length > 0
      ? owed.map((balance) => formatMoneyAmount(Math.abs(balance.net), balance.currency)).join(" · ")
      : null;
  const friendshipId = friendships.success
    ? (friendships.data.friends.find((item) => item.friend.id === profile.id)?.id ?? null)
    : null;

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/friends", label: "Amigos" }}
          title={name}
          description={
            profile.username ? (
              <span translate="no">@{profile.username}</span>
            ) : isFriend ? (
              "Amigo"
            ) : (
              "Ex amigo"
            )
          }
        />
      </Reveal>

      <Reveal>
        <Card className="flex flex-col gap-4 px-5 py-5">
          <p
            className={`font-display text-3xl font-extrabold tracking-tight text-pretty tabular-nums ${balanceToneClass(balances)}`}
          >
            {lines.length > 0 ? lines.join(" · ") : "Están a mano"}
          </p>
          <SettlementPanel
            profile={profile}
            balances={balances}
            pending={pendingSettlements}
          />
          {isFriend ? (
            <Button
              href={`/friends/debts/new?friend=${profile.id}`}
              variant="secondary"
              className="w-full"
            >
              Añadir deuda con {name}
            </Button>
          ) : null}
        </Card>
      </Reveal>

      {owed.length > 0 ? (
        <Reveal>
          <DebtPaymentQr ownerId={profile.id} ownerName={name} balanceHint={balanceHint} />
        </Reveal>
      ) : null}

      <Reveal>
        <ListGroup
          title="Historial"
          footer="Las deudas no se borran. Si un gasto cambia, el registro se queda."
        >
          {history.length === 0 ? (
            <li className="px-4 py-4 text-sm text-muted-foreground">Todavía no comparten gastos.</li>
          ) : (
            history.map((event) => (
              <ListRow
                key={event.id}
                href={
                  event.expenseId && event.shareStatus !== "voided"
                    ? event.iAmPayer
                      ? `/friends/expenses/${event.expenseId}/edit`
                      : `/friends/expenses/${event.expenseId}`
                    : undefined
                }
                title={historyTitle(event, name)}
                subtitle={historySubtitle(event)}
                trailing={
                  <span className="text-sm tabular-nums font-semibold">
                    {formatMoneyAmount(event.amount, event.currency)}
                  </span>
                }
                muted={event.shareStatus === "voided"}
              />
            ))
          )}
        </ListGroup>
      </Reveal>

      {isFriend && friendshipId ? (
        <Reveal>
          <RemoveFriendSection friendshipId={friendshipId} friendName={name} />
        </Reveal>
      ) : null}
    </PageShell>
  );
}

function historyTitle(
  event: {
    kind: "expense" | "payment";
    shareStatus: string | null;
    settlementStatus: string | null;
    theyOwe: boolean;
    merchant: string | null;
    iAmPayer: boolean;
  },
  name: string,
): string {
  if (event.kind === "payment") {
    if (event.settlementStatus === "pending") {
      return event.theyOwe ? `${name} dice que pagó` : "Pago por confirmar";
    }
    return event.theyOwe ? `${name} te pagó` : `Le pagaste a ${name}`;
  }
  if (event.shareStatus === "voided") return "Gasto eliminado";
  if (event.shareStatus === "disputed") return `En disputa con ${name}`;
  const label = event.merchant?.trim() || "Gasto compartido";
  return event.iAmPayer ? label : `Tu parte · ${label}`;
}

function historySubtitle(event: {
  date: string;
  shareStatus: string | null;
  description: string | null;
  iAmPayer: boolean;
  theyOwe: boolean;
  kind: "expense" | "payment";
}): string {
  const date = formatTransactionDate(event.date);
  if (event.kind === "payment") return date;
  if (event.shareStatus === "voided") return `${date} · quedó en el historial`;
  if (event.shareStatus === "pending") return `${date} · para revisar`;
  if (event.shareStatus === "disputed") return `${date} · en disputa`;
  if (event.iAmPayer && event.theyOwe) return `${date} · te debe esta parte`;
  return event.description?.trim() ? `${date} · ${event.description.trim()}` : date;
}
