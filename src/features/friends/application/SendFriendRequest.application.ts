import type { FriendshipRepository } from "@/features/friends/domain/Friendship.repository";
import type { ServiceResult } from "@/features/friends/domain/models/Friendship";

export class SendFriendRequest {
  constructor(private readonly friendshipRepository: FriendshipRepository) {}

  execute(addresseeId: string): Promise<ServiceResult<null>> {
    return this.friendshipRepository.sendRequest(addresseeId);
  }
}
