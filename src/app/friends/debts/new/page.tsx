import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListFriendships } from "@/features/friends/application/ListFriendships.application";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";

export default async function NewDebtPage() {
  const { friendshipRepository } = await createServerDependencies();
  const friends = await new ListFriendships(friendshipRepository).execute();

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/friends", label: "Amigos" }}
          title="Añadir deuda"
          description="Pagaste por tus amigos; queda como deuda."
        />
      </Reveal>
      <Reveal>
        <TransactionForm
          mode="create"
          preset="debt"
          friends={friends.success ? friends.data.friends.map((item) => item.friend) : []}
        />
      </Reveal>
    </PageShell>
  );
}
