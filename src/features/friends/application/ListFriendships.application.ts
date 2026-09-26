import type { FriendshipRepository } from "@/features/friends/domain/Friendship.repository";
import type {
  FriendshipOverview,
  ServiceResult,
} from "@/features/friends/domain/models/Friendship";

export class ListFriendships {
  constructor(private readonly friendshipRepository: FriendshipRepository) {}

  async execute(): Promise<ServiceResult<FriendshipOverview>> {
    const result = await this.friendshipRepository.list();
    if (!result.success) {
      return result;
    }

    const overview: FriendshipOverview = {
      friends: [],
      incoming: [],
      outgoing: [],
    };

    for (const friendship of result.data) {
      if (friendship.status === "accepted") {
        overview.friends.push(friendship);
      } else {
        overview[friendship.direction].push(friendship);
      }
    }

    return { success: true, data: overview };
  }
}
