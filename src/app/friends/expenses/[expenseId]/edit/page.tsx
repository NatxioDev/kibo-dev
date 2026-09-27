import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListFriendships } from "@/features/friends/application/ListFriendships.application";
import type { FriendProfile } from "@/features/friends/domain/models/Friendship";
import { VoidExpenseButton } from "@/features/splits/components/VoidExpenseButton";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";

type EditSharedExpensePageProps = {
  params: Promise<{ expenseId: string }>;
};

export default async function EditSharedExpensePage({
  params,
}: EditSharedExpensePageProps) {
  const { expenseId } = await params;
  const { splitRepository, friendshipRepository } = await createServerDependencies();
  const [context, friends, people] = await Promise.all([
    splitRepository.getEditContext(expenseId),
    new ListFriendships(friendshipRepository).execute(),
    splitRepository.listPersonBalances(),
  ]);

  if (!context.success) notFound();

  const accepted: FriendProfile[] = friends.success
    ? friends.data.friends.map((item) => item.friend)
    : [];
  const known = new Map(accepted.map((friend) => [friend.id, friend]));
  if (people.success) {
    for (const person of people.data) known.set(person.profile.id, person.profile);
  }
  const options = [...known.values()];

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/friends", label: "Amigos" }}
          title="Editar gasto compartido"
        />
      </Reveal>
      <Reveal>
        <TransactionForm mode="edit-bill" friends={options} bill={context.data} />
      </Reveal>
      <Reveal>
        <VoidExpenseButton expenseId={expenseId} />
      </Reveal>
    </PageShell>
  );
}
