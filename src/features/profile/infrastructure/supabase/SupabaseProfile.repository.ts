import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileRepository } from "@/features/profile/domain/Profile.repository";
import type {
  CurrentProfile,
  Profile,
  ServiceResult,
} from "@/features/profile/domain/models/Profile";
import { mapProfileError } from "@/features/profile/infrastructure/supabase/mapProfileError";

const NOT_AUTHENTICATED = "Debes iniciar sesión para ver tu perfil.";

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private async getUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    return error ? null : user;
  }

  async getCurrent(): Promise<ServiceResult<CurrentProfile>> {
    const user = await this.getUser();
    if (!user) {
      return { success: false, error: NOT_AUTHENTICATED };
    }

    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return { success: false, error: mapProfileError(error) };
    }

    return {
      success: true,
      data: { ...(data as Profile), email: user.email ?? null },
    };
  }

  async isUsernameAvailable(
    username: string,
  ): Promise<ServiceResult<boolean>> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      return { success: false, error: mapProfileError(error) };
    }

    return { success: true, data: data === null };
  }

  async setUsername(username: string): Promise<ServiceResult<Profile>> {
    return this.updateCurrent({ username });
  }

  async updateDisplayName(
    displayName: string,
  ): Promise<ServiceResult<Profile>> {
    return this.updateCurrent({ display_name: displayName });
  }

  private async updateCurrent(
    values: Partial<Pick<Profile, "username" | "display_name">>,
  ): Promise<ServiceResult<Profile>> {
    const user = await this.getUser();
    if (!user) {
      return { success: false, error: NOT_AUTHENTICATED };
    }

    const { data, error } = await this.supabase
      .from("profiles")
      .update(values)
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: mapProfileError(error) };
    }

    return { success: true, data: data as Profile };
  }
}
