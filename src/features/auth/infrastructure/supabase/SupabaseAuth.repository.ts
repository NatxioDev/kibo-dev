import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import { mapAuthError } from "@/features/auth/infrastructure/supabase/mapAuthError";
import type { AuthResult } from "@/types/auth";

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async signInWithGoogle(redirectTo: string): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    return { success: true };
  }

  async signOut(): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    return { success: true };
  }
}
