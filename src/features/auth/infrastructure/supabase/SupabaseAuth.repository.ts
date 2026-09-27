import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import type { PasskeyCredential } from "@/features/auth/domain/Passkey";
import { mapAuthError } from "@/features/auth/infrastructure/supabase/mapAuthError";
import type { AuthResult } from "@/types/auth";

function toPasskeyCredential(item: {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
}): PasskeyCredential {
  return {
    id: item.id,
    friendlyName: item.friendly_name?.trim() ? item.friendly_name : null,
    createdAt: item.created_at,
    lastUsedAt: item.last_used_at ?? null,
  };
}

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

  async signInWithPasskey(): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signInWithPasskey();

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    if (!data.session) {
      return {
        success: false,
        error: "No pudimos iniciar sesión con Passkey. Inténtalo de nuevo.",
      };
    }

    return { success: true };
  }

  async registerPasskey(friendlyName?: string): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.registerPasskey();

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    const trimmed = friendlyName?.trim();
    if (trimmed && data.id) {
      const updateResult = await this.updatePasskey(data.id, trimmed);
      if (!updateResult.success) {
        return updateResult;
      }
    }

    return { success: true };
  }

  async listPasskeys(): Promise<ServiceResult<PasskeyCredential[]>> {
    const { data, error } = await this.supabase.auth.passkey.list();

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    return {
      success: true,
      data: (data ?? []).map(toPasskeyCredential),
    };
  }

  async updatePasskey(id: string, friendlyName: string): Promise<AuthResult> {
    const trimmed = friendlyName.trim();
    if (!trimmed) {
      return {
        success: false,
        error: "El nombre de la Passkey no puede estar vacío.",
      };
    }

    const { error } = await this.supabase.auth.passkey.update({
      passkeyId: id,
      friendlyName: trimmed,
    });

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    return { success: true };
  }

  async deletePasskey(id: string): Promise<AuthResult> {
    const { error } = await this.supabase.auth.passkey.delete({
      passkeyId: id,
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
