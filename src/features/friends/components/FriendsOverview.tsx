import { Reveal } from "@/components/motion/Reveal";
import { ListGroup } from "@/components/ui/ListGroup";
import { FriendshipListItem } from "@/features/friends/components/FriendshipListItem";
import type { PersonBalance } from "@/features/splits/domain/models";
import type {
  Friendship,
  FriendshipOverview,
} from "@/features/friends/domain/models/Friendship";

type FriendsSection = "incoming" | "outgoing" | "friends";

type FriendsOverviewProps = {
  overview: FriendshipOverview;
  balances?: PersonBalance[];
  sections?: FriendsSection[];
};

function byName(a: Friendship, b: Friendship) {
  const nameOf = (friendship: Friendship) =>
    friendship.friend.display_name ?? friendship.friend.username ?? "";
  return nameOf(a).localeCompare(nameOf(b), "es");
}

export function FriendsOverview({
  overview,
  balances = [],
  sections = ["incoming", "outgoing", "friends"],
}: FriendsOverviewProps) {
  const groups: {
    key: FriendsSection;
    title: string;
    items: Friendship[];
    empty: string;
  }[] = [
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
      empty: "Aún no tienes amigos. Búscalos por su @username en Agregar amigos.",
    },
  ];

  return (
    <>
      {groups.filter((group) => sections.includes(group.key)).map((group) => (
        <Reveal key={group.key}>
          <ListGroup title={group.title}>
            {group.items.length === 0 ? (
              <li className="px-4 py-4 text-sm text-muted-foreground">
                {group.empty}
              </li>
            ) : (
              group.items.map((friendship) => (
                <FriendshipListItem
                  key={friendship.id}
                  friendship={friendship}
                  balance={balances.find((item) => item.profile.id === friendship.friend.id)}
                />
              ))
            )}
          </ListGroup>
        </Reveal>
      ))}
    </>
  );
}
