import type { ProfileRepository } from "@/features/profile/domain/Profile.repository";
import type { ServiceResult } from "@/features/profile/domain/models/Profile";

export class CheckUsernameAvailability {
  constructor(private readonly profileRepository: ProfileRepository) {}

  execute(username: string): Promise<ServiceResult<boolean>> {
    return this.profileRepository.isUsernameAvailable(username);
  }
}
