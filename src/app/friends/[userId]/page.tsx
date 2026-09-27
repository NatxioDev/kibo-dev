import { notFound } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { ListGroup, ListRow } from "@/components/ui/ListGroup";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { friendName } from "@/features/friends/components/FriendRow";
import { balanceLines } from "@/features/splits/components/balanceLines";
import { SettlementPanel } from "@/features/splits/components/SettlementPanel";
import { formatMoneyAmount, formatTransactionDate } from "@/features/transactions/components/formatters";

type FriendDetailPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function FriendDetailPage({ params }: FriendDetailPageProps) {
  const { userId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(userId)) notFound();

  const { splitRepository } = await createServerDependencies();
  const result = await splitRepository.friendDetail(userId);
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
              "Saldo anterior"
            )
          }
        />
      </Reveal>

      <Reveal>
        <p className="text-pretty text-lg font-semibold tabular-nums text-foreground">
          {lines.length > 0 ? lines.join(" · ") : "Están a mano"}
        </p>
      </Reveal>

      <Reveal>
        <SettlementPanel
          profile={profile}
          balances={balances}
          pending={pendingSettlements}
        />
      </Reveal>

      <Reveal>
        <ListGroup title="Historial" footer="Las deudas no se borran: si un gasto cambia, queda la anulación.">
          {history.length === 0 ? (
            <li className="px-4 py-4 text-sm text-muted-foreground">Todavía no comparten gastos.</li>
          ) : (
            history.map((event) => (
              <ListRow
                key={event.id}
                href={
                  event.iAmPayer && event.expenseId && event.shareStatus !== "voided"
                    ? `/friends/expenses/${event.expenseId}/edit`
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
  if (event.shareStatus === "voided") return "Gasto anulado";
  if (event.shareStatus === "disputed") return "En revisión";
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
  if (event.shareStatus === "pending") return `${date} · por clasificar`;
  if (event.shareStatus === "disputed") return `${date} · no reconocido`;
  if (event.iAmPayer && event.theyOwe) return `${date} · te debe esta parte`;
  return event.description?.trim() ? `${date} · ${event.description.trim()}` : date;
}
