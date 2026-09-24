import { createClient } from "@/lib/supabase/client";
import type { AuthResult, LoginCredentials, RegisterCredentials } from "@/types/auth";
import { mapAuthError } from "./mapAuthError";

export async function signIn({
  email,
  password,
}: LoginCredentials): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: mapAuthError(error) };
  }

  return { success: true };
}

export async function signUp({
  email,
  password,
}: Omit<RegisterCredentials, "confirmPassword">): Promise<AuthResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { success: false, error: mapAuthError(error) };
  }

  const needsEmailConfirmation = !data.session;

  return { success: true, needsEmailConfirmation };
}

export async function signOut(): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: mapAuthError(error) };
  }

  return { success: true };
}
