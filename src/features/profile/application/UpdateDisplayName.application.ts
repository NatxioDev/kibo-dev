import type { ProfileRepository } from "@/features/profile/domain/Profile.repository";
import type {
  Profile,
  ServiceResult,
} from "@/features/profile/domain/models/Profile";

export class UpdateDisplayName {
  constructor(private readonly profileRepository: ProfileRepository) {}

  execute(displayName: string): Promise<ServiceResult<Profile>> {
    return this.profileRepository.updateDisplayName(displayName);
  }
}
