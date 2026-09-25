import type { ProfileRepository } from "@/features/profile/domain/Profile.repository";
import type {
  Profile,
  ServiceResult,
} from "@/features/profile/domain/models/Profile";

export class SetUsername {
  constructor(private readonly profileRepository: ProfileRepository) {}

  execute(username: string): Promise<ServiceResult<Profile>> {
    return this.profileRepository.setUsername(username);
  }
}
