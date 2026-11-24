import { redirect } from "next/navigation";
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
import { FORMER_FRIENDS_TITLE } from "@/features/splits/domain/inboxCopy";
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

function matchesSaldo(
  person: { balances: { net: number }[] },
  saldo: "debo" | "te-deben",
): boolean {
  if (saldo === "debo") return person.balances.some((balance) => balance.net < 0);
  return person.balances.some((balance) => balance.net > 0);
}

type FriendsPageProps = {
  searchParams: Promise<{ saldo?: string | string[] }>;
};

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const { saldo: rawSaldo } = await searchParams;
  const saldoValue = Array.isArray(rawSaldo) ? rawSaldo[0] : rawSaldo;
  const saldo =
    saldoValue === "debo" || saldoValue === "te-deben" ? saldoValue : null;
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
  const hasFriends = friendIds.size > 0;
  const incoming = result.success ? result.data.incoming.length : 0;
  const outgoing = result.success ? result.data.outgoing.length : 0;
  const people = balances.success ? balances.data : [];
  const filteredPeople =
    saldo && balances.success
      ? people.filter((person) => matchesSaldo(person, saldo))
      : people;
  const filteredFriendPeople =
    saldo && balances.success
      ? filteredPeople.filter((person) => friendIds.has(person.profile.id))
      : filteredPeople.filter((person) => friendIds.has(person.profile.id));

  if (
    saldo &&
    balances.success &&
    result.success &&
    filteredFriendPeople.length === 1
  ) {
    redirect(`/friends/${filteredFriendPeople[0].profile.id}`);
  }

  const former = people.filter(
    (person) => !friendIds.has(person.profile.id) && person.hasHistory,
  );
  const expenseCategories = categories.success
    ? categories.data.filter((category) => category.type === "EXPENSE" && category.is_active)
    : [];
  const friendsTitle = saldo === "debo" ? "A quienes les debes" : saldo === "te-deben" ? "Quienes te deben" : undefined;

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/", label: "Inicio" }}
          title="Amigos"
          actions={
            <>
              {hasFriends ? (
                <Button href="/friends/debts/new" size="sm" variant="secondary">
                  Añadir deuda
                </Button>
              ) : null}
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
            </>
          }
        />
      </Reveal>

      {balances.success ? <FriendsDebtSummary people={people} /> : null}
      {saldo ? (
        <Reveal>
          <Button href="/friends" variant="ghost" size="sm" className="self-start">
            Ver todos
          </Button>
        </Reveal>
      ) : null}

      {!balances.success ? (
        <Alert>{balances.error}</Alert>
      ) : !attention.success ? (
        <Alert>{attention.error}</Alert>
      ) : null}

      {attention.success ? (
        <UnclassifiedInbox items={attention.data} categories={expenseCategories} />
      ) : null}

      {!result.success ? (
        <Reveal>
          <Alert>{result.error}</Alert>
        </Reveal>
      ) : (
        <FriendsOverview
          overview={result.data}
          balances={filteredPeople}
          sections={["friends"]}
          friendsTitle={friendsTitle}
          friendsEmpty={saldo ? "No tienes amigos con ese saldo." : undefined}
        />
      )}

      {former.length > 0 ? (
        <Reveal>
          <ListGroup
            title={FORMER_FRIENDS_TITLE}
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
