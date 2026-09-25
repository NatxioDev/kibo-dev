import type { ProfileAdminRepository } from "@/features/profile/domain/ProfileAdmin.repository";
import type { ProfileRepository } from "@/features/profile/domain/Profile.repository";
import type {
  Profile,
  ServiceResult,
} from "@/features/profile/domain/models/Profile";
import {
  formatNextUsernameChange,
  getUsernameChangeAvailability,
} from "@/features/profile/domain/usernameChangePolicy";
import { usernameSchema } from "@/features/profile/schemas/usernameSchema";

export class ChangeUsername {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly profileAdminRepository: ProfileAdminRepository,
    private readonly cooldownDays: number,
  ) {}

  async execute(rawUsername: string): Promise<ServiceResult<Profile>> {
    const parsed = usernameSchema.safeParse(rawUsername);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Nombre de usuario inválido.",
      };
    }
    const username = parsed.data;

    const current = await this.profileRepository.getCurrent();
    if (!current.success) {
      return current;
    }

    const profile = current.data;
    if (!profile.username) {
      return { success: false, error: "Primero elige tu nombre de usuario." };
    }

    if (profile.username.toLowerCase() === username) {
      return { success: false, error: "Ese ya es tu nombre de usuario." };
    }

    const availability = getUsernameChangeAvailability(
      profile.username_changed_at,
      this.cooldownDays,
    );
    if (!availability.canChange) {
      return {
        success: false,
        error: `Podrás cambiarlo de nuevo el ${formatNextUsernameChange(availability.nextChangeAt)}.`,
      };
    }

    const isAvailable = await this.profileRepository.isUsernameAvailable(
      username,
    );
    if (!isAvailable.success) {
      return isAvailable;
    }
    if (!isAvailable.data) {
      return { success: false, error: "Ese nombre de usuario ya existe." };
    }

    return this.profileAdminRepository.updateUsername(profile.id, username);
  }
}
