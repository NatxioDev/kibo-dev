import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ListGroup, ListRow } from "@/components/ui/ListGroup";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListCategories } from "@/features/categories/application/ListCategories.application";
import { ListFriendships } from "@/features/friends/application/ListFriendships.application";
import { friendName } from "@/features/friends/components/FriendRow";
import { FriendsOverview } from "@/features/friends/components/FriendsOverview";
import { balanceLines } from "@/features/splits/components/balanceLines";
import { FriendsDebtSummary } from "@/features/splits/components/FriendsDebtSummary";
import { UnclassifiedInbox } from "@/features/splits/components/UnclassifiedInbox";

function requestsLabel(incoming: number, outgoing: number): string {
  const parts = [
    incoming > 0
      ? `${incoming} ${incoming === 1 ? "solicitud por responder" : "solicitudes por responder"}`
      : null,
    outgoing > 0
      ? `${outgoing} ${outgoing === 1 ? "solicitud enviada" : "solicitudes enviadas"}`
      : null,
  ].filter(Boolean);
  return parts.length > 0 ? `Agregar amigos, ${parts.join(", ")}` : "Agregar amigos";
}

export default async function FriendsPage() {
  const { friendshipRepository, splitRepository, categoryRepository } =
    await createServerDependencies();
  const [result, balances, attention, categories] = await Promise.all([
    new ListFriendships(friendshipRepository).execute(),
    splitRepository.listPersonBalances(),
    splitRepository.listAttention(),
    new ListCategories(categoryRepository).execute(),
  ]);

  const friendIds = new Set(
    result.success ? result.data.friends.map((friendship) => friendship.friend.id) : [],
  );
  const incoming = result.success ? result.data.incoming.length : 0;
  const outgoing = result.success ? result.data.outgoing.length : 0;
  const people = balances.success ? balances.data : [];
  const former = people.filter((person) => !friendIds.has(person.profile.id) && person.hasHistory);
  const expenseCategories = categories.success
    ? categories.data.filter((category) => category.type === "EXPENSE" && category.is_active)
    : [];

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/", label: "Inicio" }}
          title="Amigos"
          actions={
            <Button
              href="/friends/requests"
              size="sm"
              aria-label={requestsLabel(incoming, outgoing)}
              className="relative"
            >
              + Agregar
              {incoming > 0 ? (
                <span
                  aria-hidden
                  className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-expense px-1 text-[0.6875rem] leading-none font-bold text-white tabular-nums ring-2 ring-background"
                >
                  {incoming > 9 ? "9+" : incoming}
                </span>
              ) : null}
            </Button>
          }
        />
      </Reveal>

      {balances.success ? <FriendsDebtSummary people={people} /> : null}

      {attention.success ? (
        <UnclassifiedInbox items={attention.data} categories={expenseCategories} />
      ) : (
        <Alert>{attention.error}</Alert>
      )}

      {!result.success ? (
        <Reveal>
          <Alert>{result.error}</Alert>
        </Reveal>
      ) : (
        <FriendsOverview overview={result.data} balances={people} sections={["friends"]} />
      )}

      {!balances.success ? <Alert>{balances.error}</Alert> : null}

      {former.length > 0 ? (
        <Reveal>
          <ListGroup
            title="Saldos anteriores"
            footer="Si eliminas una amistad, las deudas y el historial se quedan."
          >
            {former.map((person) => (
              <ListRow
                key={person.profile.id}
                href={`/friends/${person.profile.id}`}
                title={friendName(person.profile)}
                subtitle={
                  person.pendingSettlement
                    ? "Pago por confirmar"
                    : balanceLines(person.balances).join(" · ") || "Están a mano"
                }
              />
            ))}
          </ListGroup>
        </Reveal>
      ) : null}
    </PageShell>
  );
}
