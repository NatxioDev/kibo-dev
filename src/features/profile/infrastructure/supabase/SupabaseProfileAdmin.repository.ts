import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileAdminRepository } from "@/features/profile/domain/ProfileAdmin.repository";
import type {
  Profile,
  ServiceResult,
} from "@/features/profile/domain/models/Profile";
import { mapProfileError } from "@/features/profile/infrastructure/supabase/mapProfileError";

export class SupabaseProfileAdminRepository implements ProfileAdminRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async updateUsername(
    userId: string,
    username: string,
  ): Promise<ServiceResult<Profile>> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update({ username })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: mapProfileError(error) };
    }

    return { success: true, data: data as Profile };
  }
}
