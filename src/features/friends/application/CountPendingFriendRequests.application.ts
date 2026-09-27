import "server-only";

import type { FriendshipRepository } from "@/features/friends/domain/Friendship.repository";
import type { ServiceResult } from "@/features/friends/domain/models/Friendship";

export class CountPendingFriendRequests {
  constructor(private readonly friendshipRepository: FriendshipRepository) {}

  execute(): Promise<ServiceResult<number>> {
    return this.friendshipRepository.countIncomingPending();
  }
}
