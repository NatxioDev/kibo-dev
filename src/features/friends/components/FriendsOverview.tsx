import { Reveal } from "@/components/motion/Reveal";
import { ListGroup } from "@/components/ui/ListGroup";
import { FriendshipListItem } from "@/features/friends/components/FriendshipListItem";
import type {
  Friendship,
  FriendshipOverview,
} from "@/features/friends/domain/models/Friendship";

type FriendsOverviewProps = {
  overview: FriendshipOverview;
};

function byName(a: Friendship, b: Friendship) {
  const nameOf = (friendship: Friendship) =>
    friendship.friend.display_name ?? friendship.friend.username ?? "";
  return nameOf(a).localeCompare(nameOf(b), "es");
}

export function FriendsOverview({ overview }: FriendsOverviewProps) {
  const groups = [
    {
      key: "incoming",
      title: "Solicitudes recibidas",
      items: overview.incoming,
      empty: "No tienes solicitudes pendientes.",
    },
    {
      key: "outgoing",
      title: "Solicitudes enviadas",
      items: overview.outgoing,
      empty: "No has enviado solicitudes.",
    },
    {
      key: "friends",
      title: `Amigos${overview.friends.length ? ` · ${overview.friends.length}` : ""}`,
      items: [...overview.friends].sort(byName),
      empty: "Aún no tienes amigos. Búscalos por su @username.",
    },
  ];

  return (
    <>
      {groups.map((group) => (
        <Reveal key={group.key}>
          <ListGroup title={group.title}>
            {group.items.length === 0 ? (
              <li className="px-4 py-4 text-sm text-muted-foreground">
                {group.empty}
              </li>
            ) : (
              group.items.map((friendship) => (
                <FriendshipListItem key={friendship.id} friendship={friendship} />
              ))
            )}
          </ListGroup>
        </Reveal>
      ))}
    </>
  );
}
