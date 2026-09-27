import type { ProfileRepository } from "@/features/profile/domain/Profile.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";

export class CheckUsernameAvailability {
  constructor(private readonly profileRepository: ProfileRepository) {}

  execute(username: string): Promise<ServiceResult<boolean>> {
    return this.profileRepository.isUsernameAvailable(username);
  }
}
