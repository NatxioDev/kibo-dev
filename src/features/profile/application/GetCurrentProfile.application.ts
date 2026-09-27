import type { ProfileRepository } from "@/features/profile/domain/Profile.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  CurrentProfile,
} from "@/features/profile/domain/models/Profile";

export class GetCurrentProfile {
  constructor(private readonly profileRepository: ProfileRepository) {}

  execute(): Promise<ServiceResult<CurrentProfile>> {
    return this.profileRepository.getCurrent();
  }
}
