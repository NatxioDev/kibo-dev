import "server-only";

import type { FriendshipRepository } from "@/features/friends/domain/Friendship.repository";
import type {
  FriendSearchResult,
  ServiceResult,
} from "@/features/friends/domain/models/Friendship";
import { friendSearchSchema } from "@/features/friends/schemas/friendSearchSchema";

export class SearchFriends {
  constructor(private readonly friendshipRepository: FriendshipRepository) {}

  execute(query: string): Promise<ServiceResult<FriendSearchResult[]>> {
    const parsed = friendSearchSchema.safeParse(query);
    if (!parsed.success) {
      return Promise.resolve({ success: true, data: [] });
    }

    return this.friendshipRepository.searchByUsername(parsed.data);
  }
}
