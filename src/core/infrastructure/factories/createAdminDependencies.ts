import "server-only";
import type { ProfileAdminRepository } from "@/features/profile/domain/ProfileAdmin.repository";
import { SupabaseProfileAdminRepository } from "@/features/profile/infrastructure/supabase/SupabaseProfileAdmin.repository";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminDependencies = {
  profileAdminRepository: ProfileAdminRepository;
};

export function createAdminDependencies(): AdminDependencies {
  const supabase = createAdminClient();
  return {
    profileAdminRepository: new SupabaseProfileAdminRepository(supabase),
  };
}
