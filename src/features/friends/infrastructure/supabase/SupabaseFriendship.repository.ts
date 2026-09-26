import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FriendshipRepository } from "@/features/friends/domain/Friendship.repository";
import type {
  FriendProfile,
  FriendRelation,
  FriendSearchResult,
  Friendship,
  FriendshipStatus,
  ServiceResult,
} from "@/features/friends/domain/models/Friendship";
import { mapFriendshipError } from "@/features/friends/infrastructure/supabase/mapFriendshipError";
import { FRIEND_SEARCH_LIMIT } from "@/features/friends/schemas/friendSearchSchema";

const NOT_AUTHENTICATED = "Debes iniciar sesión para ver tus amigos.";
const PROFILE_COLUMNS = "id, username, display_name, avatar_url";

type FriendshipRow = {
  id: string;
  status: FriendshipStatus;
  requester_id: string;
  addressee_id: string;
  created_at: string;
  responded_at: string | null;
  requester: FriendProfile;
  addressee: FriendProfile;
};

type FriendshipLinkRow = Pick<
  FriendshipRow,
  "id" | "status" | "requester_id" | "addressee_id"
>;

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function relationFor(userId: string, link: FriendshipLinkRow): FriendRelation {
  if (link.status === "accepted") return "friends";
  return link.requester_id === userId ? "outgoing" : "incoming";
}

export class SupabaseFriendshipRepository implements FriendshipRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private async getUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    return error ? null : user;
  }

  async list(): Promise<ServiceResult<Friendship[]>> {
    const user = await this.getUser();
    if (!user) {
      return { success: false, error: NOT_AUTHENTICATED };
    }

    const { data, error } = await this.supabase
      .from("friendships")
      .select(
        `id, status, requester_id, addressee_id, created_at, responded_at,
        requester:profiles!friendships_requester_id_fkey(${PROFILE_COLUMNS}),
        addressee:profiles!friendships_addressee_id_fkey(${PROFILE_COLUMNS})`,
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: mapFriendshipError(error) };
    }

    const friendships = ((data ?? []) as unknown as FriendshipRow[]).map(
      (row): Friendship => {
        const isOutgoing = row.requester_id === user.id;
        return {
          id: row.id,
          status: row.status,
          direction: isOutgoing ? "outgoing" : "incoming",
          friend: isOutgoing ? row.addressee : row.requester,
          created_at: row.created_at,
          responded_at: row.responded_at,
        };
      },
    );

    return { success: true, data: friendships };
  }

  async countIncomingPending(): Promise<ServiceResult<number>> {
    const user = await this.getUser();
    if (!user) {
      return { success: false, error: NOT_AUTHENTICATED };
    }

    const { count, error } = await this.supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .eq("addressee_id", user.id)
      .eq("status", "pending");

    if (error) {
      return { success: false, error: mapFriendshipError(error) };
    }

    return { success: true, data: count ?? 0 };
  }

  async searchByUsername(
    query: string,
  ): Promise<ServiceResult<FriendSearchResult[]>> {
    const user = await this.getUser();
    if (!user) {
      return { success: false, error: NOT_AUTHENTICATED };
    }

    const { data: profiles, error } = await this.supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .ilike("username", `${escapeLikePattern(query)}%`)
      .neq("id", user.id)
      .order("username", { ascending: true })
      .limit(FRIEND_SEARCH_LIMIT);

    if (error) {
      return { success: false, error: mapFriendshipError(error) };
    }

    const candidates = (profiles ?? []) as FriendProfile[];
    if (candidates.length === 0) {
      return { success: true, data: [] };
    }

    const ids = candidates.map((profile) => profile.id).join(",");
    const { data: links, error: linksError } = await this.supabase
      .from("friendships")
      .select("id, status, requester_id, addressee_id")
      .or(`requester_id.in.(${ids}),addressee_id.in.(${ids})`);

    if (linksError) {
      return { success: false, error: mapFriendshipError(linksError) };
    }

    const linkByProfile = new Map<string, FriendshipLinkRow>();
    for (const link of (links ?? []) as FriendshipLinkRow[]) {
      const otherId =
        link.requester_id === user.id ? link.addressee_id : link.requester_id;
      linkByProfile.set(otherId, link);
    }

    return {
      success: true,
      data: candidates.map((profile) => {
        const link = linkByProfile.get(profile.id);
        return {
          profile,
          relation: link ? relationFor(user.id, link) : "none",
          friendshipId: link?.id ?? null,
        };
      }),
    };
  }

  async sendRequest(addresseeId: string): Promise<ServiceResult<null>> {
    const { error } = await this.supabase
      .from("friendships")
      .insert({ addressee_id: addresseeId });

    if (error) {
      return { success: false, error: mapFriendshipError(error) };
    }

    return { success: true, data: null };
  }

  async accept(id: string): Promise<ServiceResult<null>> {
    const { data, error } = await this.supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      return { success: false, error: mapFriendshipError(error) };
    }

    if (!data) {
      return { success: false, error: "Esta solicitud ya no está disponible." };
    }

    return { success: true, data: null };
  }

  async remove(id: string): Promise<ServiceResult<null>> {
    const { error } = await this.supabase
      .from("friendships")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: mapFriendshipError(error) };
    }

    return { success: true, data: null };
  }
}
