import type { Profile } from "@/features/profile/domain/models/Profile";

export type { ServiceResult } from "@/features/profile/domain/models/Profile";

export type FriendProfile = Pick<
  Profile,
  "id" | "username" | "display_name" | "avatar_url"
>;

export type FriendshipStatus = "pending" | "accepted";

export type FriendshipDirection = "incoming" | "outgoing";

export type Friendship = {
  id: string;
  status: FriendshipStatus;
  direction: FriendshipDirection;
  friend: FriendProfile;
  created_at: string;
  responded_at: string | null;
};

export type FriendRelation = "none" | "friends" | FriendshipDirection;

export type FriendSearchResult = {
  profile: FriendProfile;
  relation: FriendRelation;
  friendshipId: string | null;
};

export type FriendshipOverview = {
  friends: Friendship[];
  incoming: Friendship[];
  outgoing: Friendship[];
};
