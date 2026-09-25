import type {
  CurrentProfile,
  Profile,
  ServiceResult,
} from "@/features/profile/domain/models/Profile";

export interface ProfileRepository {
  getCurrent(): Promise<ServiceResult<CurrentProfile>>;
  isUsernameAvailable(username: string): Promise<ServiceResult<boolean>>;
  setUsername(username: string): Promise<ServiceResult<Profile>>;
  updateDisplayName(displayName: string): Promise<ServiceResult<Profile>>;
}
