import "server-only";

import type { FriendshipRepository } from "@/features/friends/domain/Friendship.repository";
import type { ServiceResult } from "@/features/friends/domain/models/Friendship";

export class AcceptFriendRequest {
  constructor(private readonly friendshipRepository: FriendshipRepository) {}

  execute(id: string): Promise<ServiceResult<null>> {
    return this.friendshipRepository.accept(id);
  }
}
