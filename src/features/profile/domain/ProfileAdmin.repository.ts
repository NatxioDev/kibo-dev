import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  Profile,
} from "@/features/profile/domain/models/Profile";

export interface ProfileAdminRepository {
  updateUsername(
    userId: string,
    username: string,
  ): Promise<ServiceResult<Profile>>;
}
