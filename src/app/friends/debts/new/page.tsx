import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListFriendships } from "@/features/friends/application/ListFriendships.application";
import { friendIdFromSearchParam } from "@/features/friends/domain/friendQuery";
import { friendName } from "@/features/friends/components/FriendRow";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";

type NewDebtPageProps = {
  searchParams: Promise<{ friend?: string | string[] }>;
};

export default async function NewDebtPage({ searchParams }: NewDebtPageProps) {
  const params = await searchParams;
  const initialFriendId = friendIdFromSearchParam(params.friend);
  const { friendshipRepository } = await createServerDependencies();
  const friends = await new ListFriendships(friendshipRepository).execute();
  const friendList = friends.success ? friends.data.friends.map((item) => item.friend) : [];
  const presetFriend = friendList.find((friend) => friend.id === initialFriendId);

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/friends", label: "Amigos" }}
          title="Añadir deuda"
          description={
            presetFriend
              ? `Deuda con ${friendName(presetFriend)}.`
              : "Pagaste por tus amigos; queda como deuda."
          }
        />
      </Reveal>
      <Reveal>
        <TransactionForm
          mode="create"
          preset="debt"
          friends={friendList}
          initialFriendId={presetFriend?.id ?? null}
        />
      </Reveal>
    </PageShell>
  );
}
