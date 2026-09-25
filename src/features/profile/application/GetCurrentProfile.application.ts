import type { ProfileRepository } from "@/features/profile/domain/Profile.repository";
import type {
  CurrentProfile,
  ServiceResult,
} from "@/features/profile/domain/models/Profile";

export class GetCurrentProfile {
  constructor(private readonly profileRepository: ProfileRepository) {}

  execute(): Promise<ServiceResult<CurrentProfile>> {
    return this.profileRepository.getCurrent();
  }
}
