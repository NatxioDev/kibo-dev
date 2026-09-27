import type { ProfileRepository } from "@/features/profile/domain/Profile.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  Profile,
} from "@/features/profile/domain/models/Profile";

export class SetUsername {
  constructor(private readonly profileRepository: ProfileRepository) {}

  execute(username: string): Promise<ServiceResult<Profile>> {
    return this.profileRepository.setUsername(username);
  }
}
