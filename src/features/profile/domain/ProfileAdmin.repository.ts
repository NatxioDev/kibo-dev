import type {
  Profile,
  ServiceResult,
} from "@/features/profile/domain/models/Profile";

export interface ProfileAdminRepository {
  updateUsername(
    userId: string,
    username: string,
  ): Promise<ServiceResult<Profile>>;
}
