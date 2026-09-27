import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  CurrentProfile,
  Profile,
} from "@/features/profile/domain/models/Profile";

export interface ProfileRepository {
  getCurrent(): Promise<ServiceResult<CurrentProfile>>;
  isUsernameAvailable(username: string): Promise<ServiceResult<boolean>>;
  setUsername(username: string): Promise<ServiceResult<Profile>>;
  updateDisplayName(displayName: string): Promise<ServiceResult<Profile>>;
}
