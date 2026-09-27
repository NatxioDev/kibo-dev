import type {
  FriendSearchResult,
  Friendship,
  ServiceResult,
} from "@/features/friends/domain/models/Friendship";

export interface FriendshipRepository {
  list(): Promise<ServiceResult<Friendship[]>>;
  countIncomingPending(): Promise<ServiceResult<number>>;
  searchByUsername(query: string): Promise<ServiceResult<FriendSearchResult[]>>;
  sendRequest(addresseeId: string): Promise<ServiceResult<null>>;
  accept(id: string): Promise<ServiceResult<null>>;
  remove(id: string): Promise<ServiceResult<null>>;
}
