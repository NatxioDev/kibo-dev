import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import { mapAuthError } from "@/features/auth/infrastructure/supabase/mapAuthError";
import type {
  AuthResult,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth";

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async signIn({ email, password }: LoginCredentials): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    return { success: true };
  }

  async signUp({
    email,
    password,
  }: Omit<RegisterCredentials, "confirmPassword">): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    const needsEmailConfirmation = !data.session;

    return { success: true, needsEmailConfirmation };
  }

  async signOut(): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    return { success: true };
  }
}
