import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListFriendships } from "@/features/friends/application/ListFriendships.application";
import { FriendSearch } from "@/features/friends/components/FriendSearch";
import { FriendsOverview } from "@/features/friends/components/FriendsOverview";

export default async function FriendRequestsPage() {
  const { friendshipRepository } = await createServerDependencies();
  const result = await new ListFriendships(friendshipRepository).execute();

  const syncKey = result.success
    ? [...result.data.friends, ...result.data.incoming, ...result.data.outgoing]
        .map((friendship) => `${friendship.id}:${friendship.status}`)
        .join(",")
    : "";

  return (
    <PageShell>
      <Reveal>
        <PageHeader back={{ href: "/friends", label: "Amigos" }} title="Agregar amigos" />
      </Reveal>

      <Reveal>
        <FriendSearch syncKey={syncKey} />
      </Reveal>

      {!result.success ? (
        <Reveal>
          <Alert>{result.error}</Alert>
        </Reveal>
      ) : (
        <FriendsOverview overview={result.data} sections={["incoming", "outgoing"]} />
      )}
    </PageShell>
  );
}
